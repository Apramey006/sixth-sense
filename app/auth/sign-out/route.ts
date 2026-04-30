import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfig, supabaseEnabled } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function handle(request: NextRequest) {
  const redirectUrl = new URL("/", request.url);
  const response = NextResponse.redirect(redirectUrl);

  if (!supabaseEnabled) return response;

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

  await supabase.auth.signOut();
  return response;
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
