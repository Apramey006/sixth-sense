import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfig, supabaseEnabled } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Magic-link callback. Supabase emails a link back here with a `code` query
 * param; we exchange it for a session, set auth cookies on the response, and
 * redirect to wherever the user was headed (default: home).
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next") ?? "/";
  const next = nextParam.startsWith("/") ? nextParam : "/";

  const redirectUrl = new URL(next, requestUrl.origin);

  if (!code || !supabaseEnabled) {
    return NextResponse.redirect(redirectUrl);
  }

  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set({ name, value, ...options });
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const errUrl = new URL("/auth", requestUrl.origin);
    errUrl.searchParams.set("error", error.message);
    return NextResponse.redirect(errUrl);
  }

  return response;
}
