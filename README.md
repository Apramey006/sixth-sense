# Taste Reps

A practice tool for product taste. Real product decisions, your unfiltered take, then the reveal.

**Live:** https://taste-reps.vercel.app

## What it is

Two practices for working PMs:

- **Daily rep** (`/today`) — ~3 min. A real product moment from a real company. Write one sentence on the most interesting choice you notice. Then see what the team actually said and the choice that's easy to miss.
- **Weekly deep rep** (`/this-week`) — ~25 min. A full real decision room. Write your unfiltered take across four dimensions (tradeoff, target user, alternative, prediction) before seeing what shipped, real outcomes, and a side-by-side of your take vs. reality.

Plus:
- **Library** (`/library`) — the catalog of every scenario in rotation, filterable by daily/weekly.
- **Profile** (`/me`) — your take history, once you've signed in.
- **Auth** (`/auth`) — magic-link, opt-in. The site works fully anonymously; sign-in lets you save reps across devices.

## Architectural commitments

These are the constraints the product is designed around. Don't break them.

1. **No LLM scoring or evaluation, anywhere.** Every scenario, every reveal, every quote is human-authored from real public sources. The model never reads the user's take. Adding "AI feedback" would invalidate the project's core argument.
2. **No taste profile, scoring, streaks, or leaderboards in v1.** Earn engagement on the rep mechanic alone. The profile is the most valuable feature and the most fragile to design — we capture takes now so we can design it honestly later.
3. **Anonymous-first.** Anyone can land and complete a rep without signing up. Auth is an opt-in upgrade, not a gate.
4. **Editorial-but-app, not editorial-but-essay.** The voice is thoughtful and restrained; the layout is dense, content-rich, and tool-like.

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS with custom design tokens (terracotta primary, sage secondary, warm-cream paper)
- Supabase (Postgres + Auth + RLS)
- Anonymous user ID via UUID in `localStorage`
- Deployed on Vercel

## Local setup

```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from your Supabase project
npm run dev
```

Open http://localhost:3000.

The app falls back to TypeScript seed content (`lib/seedScenarios.ts`) when Supabase is unconfigured or empty, so dev never breaks.

## Configure Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run **in this order**:
   - `supabase/schema.sql` — creates `scenarios` and `takes` tables with base RLS.
   - `supabase/seed.sql` — loads starter scenarios into the database.
   - `supabase/auth_migration.sql` — adds `user_id` column to `takes`, the `link_anon_takes_to_user` RPC, and auth-related RLS policies. **Required for sign-in to work.**
3. In **Authentication → URL Configuration → Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - `https://taste-reps.vercel.app/auth/callback`
   - Any other deploy URLs.
4. Paste the project URL + anon key into `.env.local` (and into Vercel project env vars for prod).
5. Restart `npm run dev`. The app reads scenarios from Supabase, writes takes to the `takes` table, and magic-link sign-in is live.

## Authoring scenarios

Two paths:

1. **Edit Supabase directly** (production). In Supabase Studio, edit rows in `scenarios`. Live in the next page load — no redeploy.
2. **Edit `lib/seedScenarios.ts`** (versioned). Add or change scenarios in TypeScript, run `npm run gen:seed` to regenerate `supabase/seed.sql`, run that SQL in Supabase. Keeps a versioned snapshot of seed content in git.

`scenarios` and `takes` persist independently — re-seeding scenarios doesn't touch takes.

## Deploy

Push to GitHub. Import the repo in Vercel. Set the two `NEXT_PUBLIC_*` env vars in the Vercel project. Push to `main` deploys automatically.

## Layout

```
app/
  page.tsx              landing
  today/page.tsx        daily rep route
  this-week/page.tsx    weekly rep route
  library/page.tsx      catalog of all scenarios
  me/page.tsx           authenticated take history
  auth/page.tsx         magic-link sign-in
  auth/callback/        magic-link callback handler
  auth/sign-out/        sign-out route
  layout.tsx            shell
  globals.css           design tokens + utilities

components/
  TopNav.tsx            top navigation with AuthButton
  Masthead.tsx          contextual page header strip
  DailyRep.tsx          daily flow (intro → reveal)
  WeeklyRep.tsx         weekly flow (intro → take → reveal)
  RepStatus.tsx         done/new chip on landing tiles
  PostRepFooter.tsx     post-reveal footer + email capture
  EmailCapture.tsx      magic-link sign-in prompt
  AuthButton.tsx        sign-in/out nav button
  LibraryGrid.tsx       library page grid + filter chips
  ScenarioCard.tsx      individual library card

lib/
  supabase.ts           client + types
  auth.ts               useUser hook, sendMagicLink, anon→user migration
  scenarios.ts          Supabase-first fetch with TS fallback (today/this-week)
  library.ts            Supabase-first fetch for the full catalog
  seedScenarios.ts      TS fallback content + source for gen:seed
  anonId.ts             UUID in localStorage, completion tracking
  submit.ts             write a take to Supabase (or localStorage fallback)
  dates.ts              todayISO + currentISOWeek

scripts/
  gen-seed-sql.ts       emit supabase/seed.sql from lib/seedScenarios.ts

supabase/
  schema.sql            tables + base RLS
  seed.sql              generated; loads starter scenarios
  auth_migration.sql    adds user_id to takes + auth RLS

prototype/
  index.html            original single-file prototype, kept for reference
```

## Where to look next

See [`NEXT_STEPS.md`](./NEXT_STEPS.md) for the live punch list of product, distribution, and technical work, plus the architectural tradeoffs to keep in mind.
