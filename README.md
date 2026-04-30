# Taste Reps

A practice tool for product taste. Two reps:

- **Daily rep** (`/today`) — one real product moment, ~3 minutes, single-sentence take, then a real quote and one note on the choice that's easy to miss.
- **Weekly deep rep** (`/this-week`) — one full scenario, ~25 minutes, four-dimension take (tradeoff, target user, alternative, prediction), then the reveal: what shipped, real outcomes, the tradeoffs to notice, and a side-by-side of your take vs. reality.

Two architectural commitments worth keeping:

1. **No LLM scoring or evaluation.** Every scenario, every reveal, every quote is human-authored from real public sources. The model never reads the user's take.
2. **No taste profile yet.** v1 earns engagement on the rep mechanic alone. The profile is the most valuable feature and the most fragile to design — we capture takes now so we can design it honestly later, but we ship without it.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

The app runs without Supabase configured — takes stash in `localStorage` and the side-by-side reveal still works. Configure Supabase to persist takes across devices (and to enable peer-comparison later).

## Configure Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql` (creates `scenarios` and `takes` tables with RLS).
3. Run `supabase/seed.sql` to load the starter scenarios into the database.
4. Copy `.env.example` to `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
5. Restart `npm run dev`. The app reads scenarios from Supabase and writes takes to the `takes` table.

The app falls back to the TypeScript seed in `lib/seedScenarios.ts` when Supabase is unconfigured or empty, so the experience never breaks during dev.

## Authoring scenarios

Two paths:

1. **Edit Supabase directly** (production path). Open the Supabase Studio, edit rows in the `scenarios` table. No redeploy needed — the next page load picks up the new content.
2. **Edit `lib/seedScenarios.ts`** (dev path). Add or change scenarios in the TypeScript file, then run `npm run gen:seed` to regenerate `supabase/seed.sql`, then re-run that SQL in Supabase. This keeps a versioned snapshot of seed content in git.

Both `scenarios` and `takes` tables persist independently — re-seeding scenarios does not touch takes.

## Deploy

Push to GitHub. Import the repo in Vercel. Set the two `NEXT_PUBLIC_*` env vars in the Vercel project. Done.

## Layout

```
app/
  page.tsx              — landing
  today/page.tsx        — daily rep route
  this-week/page.tsx    — weekly rep route
  layout.tsx            — fonts, masthead shell
  globals.css           — editorial design tokens
components/
  Masthead.tsx
  DailyRep.tsx          — daily rep flow (intro → reveal)
  WeeklyRep.tsx         — weekly rep flow (intro → take → reveal)
lib/
  supabase.ts           — client + types
  scenarios.ts          — Supabase-first fetch with TS fallback, date-based rotation
  seedScenarios.ts      — TS fallback content + source for gen:seed
  anonId.ts             — UUID in localStorage, completion tracking
  submit.ts             — write a take to Supabase (or localStorage fallback)
  dates.ts              — todayISO + currentISOWeek
scripts/
  gen-seed-sql.ts       — emit supabase/seed.sql from lib/seedScenarios.ts
supabase/
  schema.sql            — tables + RLS
  seed.sql              — generated; run after schema.sql to load starter scenarios
prototype/
  index.html            — original single-file prototype, kept for reference
```

## What's deliberately not here

- No auth. anon_id in localStorage attributes takes for future peer-comparison without a sign-in wall.
- No taste profile. Will be designed once we have real takes to learn from.
- No daily streaks UI, no notifications, no admin tooling, no peer comparison. Each is a separate v2 conversation.
- No LLM features anywhere. Adding one to "summarize the user's take" or "give feedback" would invalidate the whole project.
