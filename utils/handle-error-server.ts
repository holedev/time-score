"use server";

import type { RequiredClaims } from "@supabase/supabase-js";
import { jwtDecode } from "jwt-decode";
import { createClientSsr } from "@/configs/supabase/server";
import { UserRole, UserWithRole } from "@/types/global";
import type { ResponseType } from "@/types/response";
import { ErrorResponse, SuccessResponse } from "./response";

const _MILLISECONDS_IN_SECOND = 1000;

export type DecodedTokenType = RequiredClaims & {
  // biome-ignore lint/style/useNamingConvention: <key of supabase>
  user_role: UserRole;
};

type HandleErrorServerType = {
  cb: ({ user }: { user?: UserWithRole }) => Promise<object>;
};

const handleErrorServerNoAuth = async ({ cb }: HandleErrorServerType): Promise<ResponseType> => {
  try {
    const res = await cb({});
    return SuccessResponse({ payload: res });
  } catch (error) {
    if (error instanceof Error) {
      return ErrorResponse({ message: error.message });
    }
    return ErrorResponse({ message: "Unknown error occurred!" });
  }
};

const handleErrorServerWithAuth = async ({ cb }: HandleErrorServerType): Promise<ResponseType> => {
  try {
    const supabase = await createClientSsr();
    const { data, error: authError } = await supabase.auth.getUser();

    if (authError) {
      return ErrorResponse({ message: authError.message });
    }

    if (!data.user) {
      return ErrorResponse({ message: "Unauthorized" });
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    let decodedToken = accessToken ? jwtDecode<DecodedTokenType>(accessToken) : null;

    if (decodedToken && Date.now() >= decodedToken.exp * _MILLISECONDS_IN_SECOND) {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        throw new Error(error.message);
      }
      decodedToken = data.session ? jwtDecode<DecodedTokenType>(data.session.access_token) : null;
    }
    const userRole = decodedToken?.user_role || "anonymous";

    const res = await cb({ user: { ...data.user, userRole } });
    return SuccessResponse({ payload: res });
  } catch (error) {
    if (error instanceof Error) {
      return ErrorResponse({ message: error.message });
    }
    return ErrorResponse({ message: "Unknown error occurred!" });
  }
};

const handleAuthorization = async (role: UserRole): Promise<UserWithRole | null> => {
  const supabase = await createClientSsr();
  const { data, error: authError } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!data.user) {
    throw new Error("Unauthorized", {
      cause: { status: 401 }
    });
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;
  let decodedToken = accessToken ? jwtDecode<DecodedTokenType>(accessToken) : null;

  if (decodedToken && Date.now() >= decodedToken.exp * _MILLISECONDS_IN_SECOND) {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      throw new Error(error.message);
    }
    decodedToken = data.session ? jwtDecode<DecodedTokenType>(data.session.access_token) : null;
  }
  const userRole = decodedToken?.user_role || "anonymous";

  if (userRole !== role) {
    throw new Error("Forbidden", {
      cause: { status: 403 }
    });
  }

  return { ...data.user, userRole };
};

const handleAuthorizeRoleAdmin = async ({ cb }: HandleErrorServerType): Promise<ResponseType> => {
  try {
    const user = await handleAuthorization("admin");
    const res = await cb({ user });
    return SuccessResponse({ payload: res });
  } catch (error) {
    if (error instanceof Error) {
      return ErrorResponse({ message: error.message });
    }
    return ErrorResponse({ message: "Unknown error occurred!" });
  }
};

const handleAuthorizeRoleReviewer = async ({ cb }: HandleErrorServerType): Promise<ResponseType> => {
  try {
    const user = await handleAuthorization("reviewer");
    const res = await cb({ user });
    return SuccessResponse({ payload: res });
  } catch (error) {
    if (error instanceof Error) {
      return ErrorResponse({ message: error.message });
    }
    return ErrorResponse({ message: "Unknown error occurred!" });
  }
};

const handleAuthorizeRoleUser = async ({ cb }: HandleErrorServerType): Promise<ResponseType> => {
  try {
    const user = await handleAuthorization("user");
    const res = await cb({ user });
    return SuccessResponse({ payload: res });
  } catch (error) {
    if (error instanceof Error) {
      return ErrorResponse({ message: error.message });
    }
    return ErrorResponse({ message: "Unknown error occurred!" });
  }
};

export {
  handleErrorServerNoAuth,
  handleErrorServerWithAuth,
  handleAuthorizeRoleAdmin,
  handleAuthorizeRoleReviewer,
  handleAuthorizeRoleUser
};
