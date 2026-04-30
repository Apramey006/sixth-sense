# Next steps

Where the product is, what to do next, and the tradeoffs to weigh as you go. Living document — update as you ship.

## State of the MVP

Six routes live: `/`, `/today`, `/this-week`, `/library`, `/me`, `/auth`.

- Daily and weekly rep flows working end-to-end with real content (3 daily scenarios + 2 weekly).
- Anonymous-first: the entire experience works without sign-in.
- Magic-link auth opt-in via email capture after the first reveal. Anon takes migrate to the user on first sign-in.
- `/library` shows all scenarios in rotation. `/me` shows the user's history.
- Editorial-app design system (Inter throughout, terracotta + sage palette, dense card layout, no LLM-feeling components anywhere).

The product is ready to be put in front of a small set of real users. It is not ready to be public-launched.

## Manual setup still required (do this before any real testing)

1. **Run `supabase/auth_migration.sql`** in the Supabase SQL editor. Without it, sign-in will appear to work but takes won't actually attribute to the user, and `/me` will be empty.
2. **Add redirect URLs** in Supabase → Authentication → URL Configuration → Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://taste-reps.vercel.app/auth/callback`
3. **Rotate the Supabase anon key** (Settings → API → Reset anon key) since the original was shared in chat history. Anon keys are public-by-design but it's hygiene.
4. **Walk the full anonymous → email-capture → magic-link → /me flow** yourself before sending the link to anyone. End-to-end testing on a real device is the only honest test.

## The 14-day plan (from the distribution memo)

This was the strategic recommendation from the product/distribution audit. Treat it as a starting point, not a contract.

### Product (ship in this order)

- **Day 1–3.** Make sure the visual refresh actually carried into the daily and weekly reveals on mobile — eyeball the live site on a phone. Fix anything that broke.
- **Day 4–6.** Author one new daily scenario per day for five days (Linear, Figma, Stripe, Vercel, Anthropic — companies your target users work at or admire). The catalog has to be deeper than three before distribution hits.
- **Day 7–10.** Build the **pre-reveal share link** (the one moat-shaped feature the memo argued for): a route that opens the prompt only, with the reveal locked until the recipient writes their own take. Pattern: `/share/<scenario-id>` → user writes their take → only then sees the reveal. This extends the rep mechanic into a paired-rep format. It's the only "viral" mechanic that respects the editorial tone.
- **Day 11–14.** Add deep-linking to the library — a route param so users can browse and re-do specific scenarios. Currently the library only links to `/today` and `/this-week`, which means past scenarios are unreachable.

### Distribution (concurrent)

- **Day 1–7.** Draft a Lenny's guest essay: *"How to actually develop product taste (and why frameworks won't get you there)."* Live exhibit at the bottom = the product. In parallel, draft three Twitter threads — each one unpacks a scenario from the library. The thread *is* the scenario; the link is "do this rep yourself."
- **Day 8.** Publish thread #1 (Notion AI pricing — simplest scenario to thread).
- **Day 10.** Cold-DM 25 PMs at named companies (Linear, Figma, Vercel, Stripe, Anthropic, Ramp). One tailored scenario per person. Not a pitch — a question: *"Curious what you'd have shipped here."*
- **Day 12.** Publish thread #2 (Linear onboarding).
- **Day 14.** Submit Lenny essay.

### Floor target by day 30

- 200 completed reps from ~80 PMs concentrated at 8–10 companies
- At least 3 pieces of organic editorial mention (a Substack reference, a thread quoting a reveal, a Slack share)
- 5+ unsolicited DMs about a *specific scenario detail* (this is the diagnostic — proves the reveal landed, not just the pitch)

If by day 30 you have <5 unprompted DMs about specific scenarios, the fix is the reveal, not the funnel.

## Decisions to revisit as you scale

These are non-urgent but **load-bearing** — they constrain what data you should be capturing now to keep options open later.

### 1. The taste profile

Deferred deliberately for v1. Three open questions:

- **Architecture commitment to keep:** the LLM never reads the user's take. Scoring must come from structured questions (deterministic) + user self-annotation (metacognition) + outcome-anchored truth, not from machine-reading prose.
- **Data shape needed:** the profile depends on capturing takes in a structured-enough form to be aggregated. Right now the weekly rep captures four free-text dimensions — those are dimensional but unstructured. Before designing the profile, decide whether to add discrete questions (rank-the-segments, pick-the-bigger-risk) per scenario alongside the free-text take.
- **When to ship:** not before you have real user data showing patterns. Watch for it: if users start asking "where do I keep messing up?" unprompted, the product is *asking for* a profile and the design will be informed by their question.

### 2. Peer comparison on the weekly rep

This was identified as the v2 moat — see how other PMs answered the same scenario. Today the schema deliberately has no read policy on `takes`. Decide before you ship the feature:

- **Aggregate-only or individual-readable?** If aggregates, what kind — common phrases? Cluster of takes? Highlighted standout takes chosen by an editor?
- **Consent model:** opt-in checkbox at submit time? Opt-out by default? Anonymized with no opt-in needed (legal grey area)?
- **What actually creates value:** seeing many takes is interesting; seeing *one strong take* you wouldn't have written yourself is taste-changing. The latter is harder to build but is the actual product.

### 3. Authoring workflow at scale

Today scenario authoring is: edit `lib/seedScenarios.ts` → `npm run gen:seed` → run SQL in Supabase Studio. That works for an engineer-author. It does not work for a content-author.

When you bring on a non-engineer to author scenarios — likely the third or fourth person involved in the project — you'll need:
- A simple admin route (`/admin`) gated by your email
- A form for the scenario fields, write directly to Supabase
- Optional: preview-as-you-author

Not v1 work, but flag it the moment scenario authoring becomes the bottleneck.

### 4. Library deep-linking and route shape

Currently scenarios are picked by date hash. The library can show them all but can't link to them individually. Adding `/today/<id>` and `/this-week/<id>` (or `/scenario/<id>`) routes is small work and unlocks: shared links, paired-rep share mechanic, re-doing past scenarios, and any "play through the catalog" experience.

This is a prerequisite for the pre-reveal share link in the 14-day plan.

## Tech debt deferred (and what would force you to address it)

- **No analytics.** You can't tell who finishes vs. drops off, or whether anyone returns. Vercel Analytics is one toggle; PostHog free tier gives funnels. Add this *before* distribution starts — flying blind during a launch is the worst time.
- **No error monitoring.** Sentry, 10 minutes. Add before any traffic.
- **No rate limiting on `takes` insert.** Anon key + insert policy = anyone with the public key can spam the table. Doesn't matter at zero traffic; matters the moment a thread goes viral. Mitigation: a serverless function that does basic length/frequency validation before insert.
- **No tests.** Rep flows have enough state (multi-step, async submit, localStorage tracking) that a couple of E2E tests in Playwright would catch regressions. Not urgent until you have collaborators.
- **No staging environment.** Today, edits to production scenarios go straight live (`scenarios` table is shared). Once content velocity ramps, fork a staging Supabase project + use Vercel preview deploys.
- **Mobile QA.** The visual refresh aimed for app-density; it deserves a real walkthrough on phone before any link goes out.
- **Deep linking & sitemap & OG cards.** SEO and link-sharing experience is generic. Easy to add when there's a reason.

## Constraints to keep honoring

These have shaped every decision so far. Breaking any of them would change the product's core argument:

1. **No LLM in the user's experience.** Not in scoring, not in feedback, not as an assistant, not as a "summarize my take." The product's premise is that taste develops *because* you sit with the gap between your raw take and reality without a model whispering an answer. An AI feature is the easiest thing to add and the only thing that breaks the project.
2. **Taste profile only when the data justifies the design.** Don't ship a "5-axis radar chart" or a "you ranked 87th-percentile" because it'd look like progress. It would be vibes-based and would corrupt the data.
3. **Editorial restraint, but app density.** Don't drift back toward Substack-essay layout. Don't drift toward Duolingo gamification. Both are easier than the actual register.
4. **Anonymous-first stays.** Auth is an upgrade, not a gate. The moment a sign-in wall sits between a curious PM and the first reveal, conversion to engaged user collapses.
5. **Scenarios are real or they're nothing.** Every scenario is a real decision at a real company. No hypotheticals. No composites. If we run out of real material, we either commission new write-ups or we slow down — we don't fake it.

## Personal-checklist version

If you're returning to this in two weeks, here's the smallest sequence that gets you to first-user feedback:

1. Run the three SQL files in Supabase if you haven't. Walk the full anon → magic-link → /me flow on your phone.
2. Author 2–3 new daily scenarios so the library has real depth.
3. Pick **three names** of PMs whose feedback you'd take seriously. Send each one a personal message + one specific scenario. Don't ask "what do you think of the product" — ask "do this scenario and tell me where your take diverged."
4. Watch what those three people do. That's your data for the next iteration.

Everything else can wait until those three replies tell you what to build.
