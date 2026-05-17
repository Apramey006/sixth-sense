export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function currentISOWeek(): string {
  const d = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

// Local-time Monday 00:00 of the week containing `ref` (default: now).
// Used for "this week" counting on /me.
export function startOfWeek(ref: Date = new Date()): Date {
  const d = new Date(ref);
  const day = d.getDay(); // 0=Sun, 1=Mon, ... 6=Sat
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ISO week containing tomorrow. The Sunday-morning weekly email previews the
// rep for the week that starts the next day — sending about the week that
// ends in 12 hours doesn't give the user time to do it.
export function upcomingISOWeek(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  const ref = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = ref.getUTCDay() || 7;
  ref.setUTCDate(ref.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(ref.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((ref.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${ref.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}
