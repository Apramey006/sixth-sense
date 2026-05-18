// All "today" / "this week" calculations are anchored to America/New_York so
// the daily/weekly rep rolls at midnight ET, regardless of where the server
// (UTC on Vercel) or the browser is. startOfWeek also runs in ET for /me
// counting consistency.

const TZ = "America/New_York";

function partsInET(d: Date): { y: number; m: number; day: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA formats as YYYY-MM-DD.
  const [y, m, day] = fmt.format(d).split("-").map(Number);
  return { y, m, day };
}

export function todayISO(): string {
  const { y, m, day } = partsInET(new Date());
  return `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isoWeekFor(y: number, m: number, day: number): string {
  // Treat the ET calendar date as a UTC reference, then run the standard
  // ISO-8601 week calculation.
  const ref = new Date(Date.UTC(y, m - 1, day));
  const dayNum = ref.getUTCDay() || 7;
  ref.setUTCDate(ref.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(ref.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((ref.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${ref.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export function currentISOWeek(): string {
  const { y, m, day } = partsInET(new Date());
  return isoWeekFor(y, m, day);
}

// ISO week containing "tomorrow in ET". The Sunday-morning weekly email
// previews the rep for the week that starts the next day — sending about
// the week that ends in 12 hours doesn't give the user time to do it.
export function upcomingISOWeek(): string {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const { y, m, day } = partsInET(tomorrow);
  return isoWeekFor(y, m, day);
}

// Monday 00:00 ET of the week containing `ref` (default: now), returned as a
// Date whose .getTime() is the correct UTC instant. Used for "this week"
// counting on /me.
export function startOfWeek(ref: Date = new Date()): Date {
  const { y, m, day } = partsInET(ref);
  // Compute the weekday of that ET date.
  const etDate = new Date(Date.UTC(y, m - 1, day));
  const weekday = etDate.getUTCDay() || 7; // 1=Mon..7=Sun
  const mondayUTC = new Date(Date.UTC(y, m - 1, day - (weekday - 1)));
  // Midnight ET on that Monday, expressed as a UTC instant.
  // ET is UTC-5 (EST) or UTC-4 (EDT) — derive the offset from the actual date.
  const offsetMin = etOffsetMinutes(mondayUTC);
  return new Date(mondayUTC.getTime() + offsetMin * 60 * 1000);
}

// Minutes to add to a UTC midnight to land at the same wall-clock moment in
// ET. EST = +300, EDT = +240.
function etOffsetMinutes(d: Date): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    timeZoneName: "shortOffset",
  });
  // e.g. "11/17/2026, GMT-5"
  const part = fmt.formatToParts(d).find((p) => p.type === "timeZoneName")?.value ?? "GMT-5";
  const match = /GMT([+-]\d+)/.exec(part);
  const hours = match ? parseInt(match[1], 10) : -5;
  return -hours * 60;
}
