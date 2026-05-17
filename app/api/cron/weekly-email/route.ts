import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getWeeklyForWeek } from "@/lib/scenarios";
import { sendWeeklyEmail } from "@/lib/email";
import { upcomingISOWeek } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Hit by Vercel Cron every Sunday at 13:00 UTC (≈ 9am ET). Sends this week's
// deep-rep scenario to every signed-in, non-unsubscribed user.

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dryRun = req.nextUrl.searchParams.get("dry") === "1";

  // Use the week starting Monday rather than the week ending today, so the
  // Sunday-morning email previews the upcoming rep (not the one that ends in
  // a few hours).
  const week = upcomingISOWeek();
  const scenario = await getWeeklyForWeek(week);

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
      week,
      scenario_id: scenario.id,
      recipient_count: recipients.length,
    });
  }

  const results = await Promise.allSettled(
    recipients.map((u) => sendWeeklyEmail(u.email!, u.id, scenario)),
  );
  const ok = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - ok;

  return NextResponse.json({
    week,
    scenario_id: scenario.id,
    sent: ok,
    failed,
    failures: results
      .filter((r) => r.status === "rejected")
      .map((r) => (r as PromiseRejectedResult).reason?.message ?? "unknown"),
  });
}
