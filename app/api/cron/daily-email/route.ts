import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin, listAllAuthUsers } from "@/lib/supabaseAdmin";
import { getDailyForDate } from "@/lib/scenarios";
import { buildDailyEmail, sendBatch } from "@/lib/email";
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
  const allUsers = await listAllAuthUsers();

  const { data: optOutRows } = await admin.from("email_unsubscribes").select("user_id");
  const optedOut = new Set((optOutRows ?? []).map((r) => r.user_id));

  const recipients = allUsers.filter(
    (u) => u.email && u.email_confirmed_at && !optedOut.has(u.id),
  );

  console.log(
    `[daily-email] date=${date} total_users=${allUsers.length} opted_out=${optedOut.size} recipients=${recipients.length}`,
  );

  if (dryRun) {
    return NextResponse.json({
      date,
      scenario_id: scenario.id,
      total_users: allUsers.length,
      opted_out: optedOut.size,
      recipient_count: recipients.length,
      recipients: recipients.map((u) => u.email),
    });
  }

  const payloads = recipients.map((u) => buildDailyEmail(u.email!, u.id, scenario));
  const { sent, failed, errors } = await sendBatch(payloads);

  if (failed > 0) {
    console.error(`[daily-email] sent=${sent} failed=${failed} errors=${errors.join(" | ")}`);
  } else {
    console.log(`[daily-email] sent=${sent}`);
  }

  return NextResponse.json({
    date,
    scenario_id: scenario.id,
    total_users: allUsers.length,
    recipient_count: recipients.length,
    sent,
    failed,
    failures: errors,
  });
}
