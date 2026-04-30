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

## Configure Supabase (optional for v1)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql`.
3. Copy `.env.example` to `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
4. Restart `npm run dev`. Takes will now write to the `takes` table.

Scenarios live in `lib/seedScenarios.ts` and rotate deterministically by date / ISO week. They are intentionally NOT seeded into Supabase in v1 — the only thing the database stores in v1 is user takes. We'll move scenarios into the DB when content velocity demands it (~50+ scenarios, or when we want non-engineer authoring).

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
  seedScenarios.ts      — daily and weekly scenarios + date-based picker
  anonId.ts             — UUID in localStorage, completion tracking
  submit.ts             — write a take to Supabase (or localStorage fallback)
  dates.ts              — todayISO + currentISOWeek
supabase/
  schema.sql            — tables + RLS
  seed.sql              — optional scenario seed (v1 keeps scenarios in TS)
prototype/
  index.html            — original single-file prototype, kept for reference
```

## What's deliberately not here

- No auth. anon_id in localStorage attributes takes for future peer-comparison without a sign-in wall.
- No taste profile. Will be designed once we have real takes to learn from.
- No daily streaks UI, no notifications, no admin tooling, no peer comparison. Each is a separate v2 conversation.
- No LLM features anywhere. Adding one to "summarize the user's take" or "give feedback" would invalidate the whole project.
