import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getDailyForDate } from "@/lib/scenarios";
import { sendDailyEmail } from "@/lib/email";
import { todayISO } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Hit by Vercel Cron daily at 12:00 UTC (≈ 8am ET). Loads today's daily
// scenario, finds every signed-in user who hasn't unsubscribed, sends them
// the rep. Auth is via the Vercel-supplied `Authorization: Bearer <CRON_SECRET>`
// header.

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dryRun = req.nextUrl.searchParams.get("dry") === "1";

  const date = todayISO();
  const scenario = await getDailyForDate(date);

  const admin = supabaseAdmin();
  const { data: usersPage, error: usersErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (usersErr) {
    return NextResponse.json({ error: usersErr.message }, { status: 500 });
  }

  const { data: optOutRows } = await admin.from("email_unsubscribes").select("user_id");
  const optedOut = new Set((optOutRows ?? []).map((r) => r.user_id));

  const recipients = (usersPage.users ?? []).filter(
    (u) => u.email && u.email_confirmed_at && !optedOut.has(u.id),
  );

  if (dryRun) {
    return NextResponse.json({
      date,
      scenario_id: scenario.id,
      recipient_count: recipients.length,
    });
  }

  const results = await Promise.allSettled(
    recipients.map((u) => sendDailyEmail(u.email!, u.id, scenario)),
  );
  const ok = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - ok;

  return NextResponse.json({
    date,
    scenario_id: scenario.id,
    sent: ok,
    failed,
    failures: results
      .filter((r) => r.status === "rejected")
      .map((r) => (r as PromiseRejectedResult).reason?.message ?? "unknown"),
  });
}
