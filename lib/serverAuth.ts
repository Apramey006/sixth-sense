import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { supabaseConfig } from "./supabase";

// Resolve the signed-in user inside a route handler. Returns null if no valid
// session cookie is present.
export async function getRequestUser(req: NextRequest): Promise<User | null> {
  const supabase = createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll() {
        // Route handlers can't mutate request cookies; we only read here.
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
