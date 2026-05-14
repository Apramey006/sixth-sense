// Single source of truth for scenario priority + scheduling + featured status.
// Edit this file (NOT lib/seedScenarios.ts) to retier, reschedule, or refeature.
// Run `npm run gen:seed` to bake priorities into supabase/seed.sql, then push.
//
// Priority 1 = top tier (featured + scheduled in date order, surfaces first)
// Priority 2 = strong tier (featured in library, falls back to hash rotation)
// Unlisted scenarios = priority 999 (unfeatured, hash rotation)

type DailyPriority = {
  priority: 1 | 2;
  featured: boolean;
  scheduled_date?: string; // Only Tier 1 has a fixed date.
};

type WeeklyPriority = {
  priority: 1 | 2;
  featured: boolean;
  iso_week?: string; // Only Tier 1 has a fixed week.
};

// Daily Tier 1 — 30 scenarios scheduled 2026-05-15 through 2026-06-13.
// Ranked by 4-agent editorial pass, filtered to 2018+ era.
const DAILY_TIER_1: Array<[string, string]> = [
  ["github-copilot-launch-2021", "2026-05-15"],
  ["twitter-spaces-launch", "2026-05-16"],
  ["notion-ai-inline-slash", "2026-05-17"],
  ["apple-personas-vision-pro", "2026-05-18"],
  ["perplexity-citation-first-search", "2026-05-19"],
  ["duolingo-leagues-leaderboard", "2026-05-20"],
  ["tiktok-for-you-feed", "2026-05-21"],
  ["ios-focus-modes-2021", "2026-05-22"],
  ["youtube-shorts-launch-2020", "2026-05-23"],
  ["airtag-anti-stalking", "2026-05-24"],
  ["apple-live-text", "2026-05-25"],
  ["twitter-edit-button-blue", "2026-05-26"],
  ["notion-ai-bundle", "2026-05-27"],
  ["slack-huddles-2021", "2026-05-28"],
  ["spotify-family-plan-address-rule", "2026-05-29"],
  ["apple-vision-pro-eyesight", "2026-05-30"],
  ["anthropic-safety-positioning", "2026-05-31"],
  ["threads-no-following-feed", "2026-06-01"],
  ["discord-stage-channels", "2026-06-02"],
  ["sign-in-with-apple", "2026-06-03"],
  ["chatgpt-plus-20-dollar", "2026-06-04"],
  ["cursor-vscode-fork", "2026-06-05"],
  ["substack-notes-launch", "2026-06-06"],
  ["chatgpt-custom-instructions", "2026-06-07"],
  ["instagram-hide-likes-experiment", "2026-06-08"],
  ["robinhood-confetti-removed", "2026-06-09"],
  ["linear-cmd-k", "2026-06-10"],
  ["chatgpt-memory-feature", "2026-06-11"],
  ["apple-memoji-2018", "2026-06-12"],
  ["apple-music-replay-2019", "2026-06-13"],
];

// Daily Tier 2 — 2018+ leftovers, featured in library but unscheduled.
const DAILY_TIER_2: string[] = [
  "apple-watch-fall-detection",
  "headspace-sleep-stories",
  "duolingo-streak-freeze",
];

// Weekly Tier 1 — 7 scenarios scheduled 2026-W21 through 2026-W27.
// Strategic / product decisions only; layoff and personality-drama scenarios
// explicitly excluded per editorial guidance.
const WEEKLY_TIER_1: Array<[string, string]> = [
  ["openai-chatgpt-launch-2022", "2026-W21"],
  ["apple-vision-pro-2024", "2026-W22"],
  ["apple-att-2021", "2026-W23"],
  ["meta-threads-2023", "2026-W24"],
  ["salesforce-acquires-slack-2020", "2026-W25"],
  ["microsoft-activision-2022", "2026-W26"],
  ["microsoft-bing-chatgpt-2023", "2026-W27"],
];

// Weekly Tier 2 — strong but not scheduled.
const WEEKLY_TIER_2: string[] = [
  "reddit-api-protest-2023",
  "reddit-ipo-2024",
  "instagram-reels-launch-2020",
  "google-stadia-shutdown-2023",
  "stripe-tender-2023",
  "whatsapp-privacy-policy-india-2021",
];

export const dailyPriorityMap: Record<string, DailyPriority> = Object.fromEntries([
  ...DAILY_TIER_1.map(([id, date]) => [id, { priority: 1 as const, featured: true, scheduled_date: date }]),
  ...DAILY_TIER_2.map((id) => [id, { priority: 2 as const, featured: true }]),
]);

export const weeklyPriorityMap: Record<string, WeeklyPriority> = Object.fromEntries([
  ...WEEKLY_TIER_1.map(([id, week]) => [id, { priority: 1 as const, featured: true, iso_week: week }]),
  ...WEEKLY_TIER_2.map((id) => [id, { priority: 2 as const, featured: true }]),
]);

export function getDailyMeta(id: string) {
  return dailyPriorityMap[id] ?? { priority: 999, featured: false };
}

export function getWeeklyMeta(id: string) {
  return weeklyPriorityMap[id] ?? { priority: 999, featured: false };
}
