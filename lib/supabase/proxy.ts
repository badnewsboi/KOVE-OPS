import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/database/types";
import { getSupabaseEnv } from "./env";

const AUTH_PATHS = ["/auth/sign-in", "/auth/sign-up", "/auth/forgot-password", "/auth/reset-password", "/auth/callback"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseEnv();
  const supabase = createServerClient<Database>(url, publishableKey, { cookies: {
    getAll: () => request.cookies.getAll(),
    setAll(cookiesToSet, headers) {
      cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
      response = NextResponse.next({ request });
      cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
    },
  }});
  const { data } = await supabase.auth.getClaims();
  const isAuthPath = AUTH_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));
  if (!data?.claims && !isAuthPath) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json(
        { data: null, error: { code: "UNAUTHENTICATED", message: "Authentication is required." } },
        { status: 401, headers: { "Cache-Control": "private, no-store" } },
      );
    }
    const destination = request.nextUrl.clone();
    destination.pathname = "/auth/sign-in";
    destination.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(destination);
  }
  if (data?.claims && request.nextUrl.pathname === "/auth/sign-in") {
    const destination = request.nextUrl.clone();
    destination.pathname = "/";
    destination.search = "";
    return NextResponse.redirect(destination);
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
