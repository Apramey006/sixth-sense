import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getRequestUser } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = supabaseAdmin();

  // Clean up app-side rows first; takes are kept anonymized (user_id set null)
  // so any aggregate metrics survive, but unsubscribe rows can go.
  await admin.from("email_unsubscribes").delete().eq("user_id", user.id);
  await admin.from("takes").update({ user_id: null }).eq("user_id", user.id);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
