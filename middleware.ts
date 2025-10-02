import type { NextRequest } from "next/server";
import { updateSession } from "./configs/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|apple-touch-icon.png|favicon.svg|icons|manifest).*)"]
};
