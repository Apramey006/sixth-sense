import { Resend } from "resend";
import { makeUnsubscribeToken } from "./unsubscribeToken";
import type { DailyScenario, WeeklyScenario } from "./supabase";

const FROM = process.env.RESEND_FROM ?? "Sixth Sense <onboarding@resend.dev>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sixth-sense.app";

let _client: Resend | null = null;
function client(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  if (!_client) _client = new Resend(key);
  return _client;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function footer(userId: string): string {
  const token = makeUnsubscribeToken(userId);
  const url = `${SITE}/unsubscribe?token=${encodeURIComponent(token)}`;
  return `<p style="color:#888;font-size:12px;margin-top:32px;border-top:1px solid #eee;padding-top:16px">
    You're receiving this because you signed up at <a href="${SITE}" style="color:#888">sixth-sense.app</a>.
    <a href="${url}" style="color:#888">Unsubscribe</a>.
  </p>`;
}

function shell(inner: string, userId: string): string {
  return `<!doctype html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222;line-height:1.5">
${inner}
${footer(userId)}
</body></html>`;
}

export async function sendDailyEmail(
  to: string,
  userId: string,
  scenario: DailyScenario,
): Promise<void> {
  const company = escapeHtml(scenario.company);
  const era = escapeHtml(scenario.era);
  const context = escapeHtml(scenario.context);
  const prompt = escapeHtml(scenario.prompt);
  const ctaUrl = `${SITE}/today`;

  const subject = `Today's rep: ${scenario.company}`;
  const html = shell(
    `
    <p style="text-transform:uppercase;font-size:12px;letter-spacing:0.08em;color:#888;margin-bottom:4px">Daily rep · ~3 min</p>
    <h1 style="font-size:24px;margin:0 0 4px;font-weight:600">${company}</h1>
    <p style="font-size:14px;color:#666;margin:0 0 20px">${era}</p>
    <p style="font-size:15px;color:#222;margin:0 0 20px">${context}</p>
    <p style="font-size:15px;color:#222;font-style:italic;margin:0 0 24px">${prompt}</p>
    <p style="margin:0 0 8px">
      <a href="${ctaUrl}" style="display:inline-block;background:#c66f3a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500">Take today's rep →</a>
    </p>
    `,
    userId,
  );

  await client().emails.send({ from: FROM, to, subject, html });
}

export async function sendWeeklyEmail(
  to: string,
  userId: string,
  scenario: WeeklyScenario,
): Promise<void> {
  const company = escapeHtml(scenario.company);
  const era = escapeHtml(scenario.era);
  const intro = escapeHtml(scenario.intro);
  const ctaUrl = `${SITE}/this-week`;

  const subject = `This week's deep rep: ${scenario.company}`;
  const html = shell(
    `
    <p style="text-transform:uppercase;font-size:12px;letter-spacing:0.08em;color:#888;margin-bottom:4px">Weekly rep · ~25 min</p>
    <h1 style="font-size:24px;margin:0 0 4px;font-weight:600">${company}</h1>
    <p style="font-size:14px;color:#666;margin:0 0 20px">${era}</p>
    <p style="font-size:15px;color:#222;margin:0 0 24px">${intro}</p>
    <p style="margin:0 0 8px">
      <a href="${ctaUrl}" style="display:inline-block;background:#222;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500">Take this week's deep rep →</a>
    </p>
    `,
    userId,
  );

  await client().emails.send({ from: FROM, to, subject, html });
}
