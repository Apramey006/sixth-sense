# Scenario batch workflow

Process for adding new daily/weekly scenarios to the pool. Each session adds
one batch and ends with `npm run validate:scenarios` passing.

## Pool targets

| Format | Current | Target | Remaining |
|--------|---------|--------|-----------|
| Daily  | 8       | 500    | 492       |
| Weekly | 3       | 80     | 77        |

Each daily ≈ 10–20 min of research. Each weekly ≈ 45–90 min. Plan batches of
20–40 dailies + 4–6 weeklies per session.

## Required shape per scenario

Every entry in `lib/seedScenarios.ts` must carry:

- `id` — kebab-case, unique across daily + weekly
- All format-specific fields (see `lib/supabase.ts` types)
- `quote_type: "verbatim" | "paraphrased"`
  - If `paraphrased`, the attribution string MUST contain "paraphrased" — the
    validator enforces this so we never imply a verbatim quote we don't have.
- `sources: ScenarioSource[]` — at least one real, resolving URL
  - `type` from the allowlist in `scripts/validate-scenarios.ts`
  - Include `publisher` and `year` where known
- `tags: { industry, region, decade }`
  - `industry` from `INDUSTRY_ALLOWLIST` in the validator (extend the allowlist
    if the new entry justifies a new category; don't invent ad-hoc strings)

## Research standard

Per scenario, hold yourself to these rules:

1. **Real moment.** The decision must be a named event in a real company's
   history that you can point at in a primary or strong secondary source.
2. **At least one source per scenario.** Two is better. Prefer:
   - Primary: company blog post, founder letter, official press release, S-1,
     earnings call, podcast transcript with the founder/exec.
   - Strong secondary: TechCrunch, Bloomberg, The Information, NPR, Stratechery,
     Lenny's Newsletter (when interviewing the actual operator).
   - Acceptable for color: Wikipedia (sparingly), well-cited Substacks.
   - Avoid: AI-content farms, listicle sites with no byline, content marketing
     pages from companies that don't have skin in the moment.
3. **Quote handling.**
   - `verbatim`: only if you have the exact phrasing from a published source.
     Include the source in `sources`.
   - `paraphrased`: anything you've condensed, reworded, or stitched together.
     The attribution string must say "paraphrased" — the validator will fail
     the build otherwise.
   - Never put words in a real person's mouth without a source for the substance.
4. **Falsifiable stats.** Outcome numbers in weeklies (e.g. "100M signups",
   "$250M/month burn") must be sourced. If you can't source it, soften it
   ("tens of millions", "≈ $X") or drop it.
5. **Non-obvious lesson.** The reveal note should change a reader's mental
   model, not summarize. If a smart reader can predict the reveal from the
   prompt, the scenario is dead weight.

## Diversity targets

The validator warns when any tag exceeds these shares of the pool. Aim to stay
under each:

- `industry`: 35%
- `region`: 70% (US dominance is expected; we still want UK/EU/Asia/LATAM/Africa/ANZ representation)
- `decade`: 55%

When picking the next batch, deliberately bias toward under-represented
quadrants. The current pool is heavily 2020s and US — early batches should
favor 1990s/2000s/2010s and non-US examples.

## Step-by-step

1. Pick ~10–20 candidate companies/moments for the batch. Spread across:
   - **Industries**: SaaS, fintech, marketplace, hardware, infra, devtools,
     consumer-social, media, health, ecommerce, gaming, productivity, etc.
   - **Decades**: 1990s through 2020s.
   - **Regions**: US, UK, EU, Asia, LATAM, ANZ.
   - **Outcomes**: include failures and "wrong but interesting" decisions, not
     just wins. A scenario where the team got it wrong is often more useful
     than one where they got it right.
   - **Archetypes**: pricing, onboarding, GTM, hiring, branding, technical
     architecture, layoff/restructure, M&A, deprecation, public stance.
2. For each candidate, run web research to confirm:
   - The moment is real and the year is right.
   - You can cite a primary or strong secondary source.
   - You have a non-obvious lesson the reader can't guess from the setup.
3. Draft each scenario directly in `lib/seedScenarios.ts`, following the shape
   of the existing entries.
4. Run `npm run validate:scenarios`. Fix every error before committing.
   Diversity warnings are OK during build-out; they should clear by launch.
5. Run `npm run gen:seed` to regenerate `supabase/seed.sql`.
6. Commit with a message like `chore(scenarios): add batch N (XX dailies + Y weeklies)`.

## When to extend the validator

- New industry that doesn't fit existing tags → add it to `INDUSTRY_ALLOWLIST`
  in `scripts/validate-scenarios.ts`.
- New source type (e.g. earnings call) → add to `SOURCE_TYPE_ALLOWLIST`.
- New region or decade → update both `lib/supabase.ts` types and
  `REGION_ALLOWLIST`/`DECADE_ALLOWLIST` in the validator.
- Tighten bounds (`BOUNDS`) if you're seeing recurring slop at the edges.

## What this validator does NOT check

- Factual accuracy of the content (no LLM-as-judge). Source-presence is a
  proxy: if you cite a real source, the reviewer can verify.
- Whether sources resolve over the network. The validator only checks URL
  format. If we want live link-checking later, wire `fetch(url, { method: "HEAD" })`
  into `checkSources` behind a `--check-links` flag.
- Whether two scenarios cover near-identical lessons. Track that yourself
  while drafting — duplicates in the lesson space hurt the product more than
  duplicates in the company space.
