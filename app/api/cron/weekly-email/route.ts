import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin, listAllAuthUsers } from "@/lib/supabaseAdmin";
import { getWeeklyForWeek } from "@/lib/scenarios";
import { buildWeeklyEmail, sendBatch } from "@/lib/email";
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
  const allUsers = await listAllAuthUsers();

  const { data: optOutRows } = await admin.from("email_unsubscribes").select("user_id");
  const optedOut = new Set((optOutRows ?? []).map((r) => r.user_id));

  const recipients = allUsers.filter(
    (u) => u.email && u.email_confirmed_at && !optedOut.has(u.id),
  );

  console.log(
    `[weekly-email] week=${week} total_users=${allUsers.length} opted_out=${optedOut.size} recipients=${recipients.length}`,
  );

  if (dryRun) {
    return NextResponse.json({
      week,
      scenario_id: scenario.id,
      total_users: allUsers.length,
      opted_out: optedOut.size,
      recipient_count: recipients.length,
      recipients: recipients.map((u) => u.email),
    });
  }

  const payloads = recipients.map((u) => buildWeeklyEmail(u.email!, u.id, scenario));
  const { sent, failed, errors } = await sendBatch(payloads);

  if (failed > 0) {
    console.error(`[weekly-email] sent=${sent} failed=${failed} errors=${errors.join(" | ")}`);
  } else {
    console.log(`[weekly-email] sent=${sent}`);
  }

  return NextResponse.json({
    week,
    scenario_id: scenario.id,
    total_users: allUsers.length,
    recipient_count: recipients.length,
    sent,
    failed,
    failures: errors,
  });
}
