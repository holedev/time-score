"use server";

import { createClientSsr } from "@/configs/supabase/server";
import { handleErrorServerWithAuth } from "@/utils/handle-error-server";

const getProfile = async () =>
  handleErrorServerWithAuth({
    cb: async ({ user }) => ({ user })
  });

const updateDisplayName = async (displayName: string) =>
  handleErrorServerWithAuth({
    cb: async ({ user: _ }) => {
      const supabase = await createClientSsr();
      const { error, data } = await supabase.auth.updateUser({
        // biome-ignore lint/style/useNamingConvention: <key of supabase>
        data: { display_name: displayName }
      });

      if (error) {
        throw new Error(error.message);
      }
      return data.user;
    }
  });

export { getProfile, updateDisplayName };
