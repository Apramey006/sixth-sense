import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfig, supabaseEnabled } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Auth callback. Used by both the email-confirmation link and OAuth providers
 * (Google, etc.). Supabase delivers a `code` query param; we exchange it for a
 * session, set auth cookies on the response, and redirect the user to `next`.
 *
 * On first successful sign-in, we send a one-time welcome email and mark the
 * user's metadata so we don't double-send on later sign-ins.
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

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const errUrl = new URL("/auth", requestUrl.origin);
    errUrl.searchParams.set("error", error.message);
    return NextResponse.redirect(errUrl);
  }

  const user = data.session?.user;
  if (user?.email && !user.user_metadata?.welcome_sent) {
    try {
      await sendWelcomeEmail(user.email, user.id);
      await supabaseAdmin().auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, welcome_sent: true },
      });
    } catch (e) {
      console.error("welcome email failed", e);
    }
  }

  return response;
}
