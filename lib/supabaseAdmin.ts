import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

// Admin client — uses the service_role key, bypasses RLS. ONLY import this from
// server-side code (route handlers, cron jobs). Never expose to the browser.

let _admin: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase admin client needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }
  _admin = createClient(url, key, { auth: { persistSession: false } });
  return _admin;
}

// Walks every page of admin.listUsers. The single-page call silently caps in
// some GoTrue deployments, so don't trust perPage alone — page until empty.
export async function listAllAuthUsers(): Promise<User[]> {
  const admin = supabaseAdmin();
  const all: User[] = [];
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data.users ?? [];
    all.push(...users);
    if (users.length < perPage) break;
    page += 1;
    if (page > 50) break; // hard stop, ~10k users
  }
  return all;
}
