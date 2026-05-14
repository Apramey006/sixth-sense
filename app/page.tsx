import Link from "next/link";
import { RepStatus } from "@/components/RepStatus";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getDailyForDate, getWeeklyForWeek } from "@/lib/scenarios";
import { todayISO, currentISOWeek } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const date = todayISO();
  const week = currentISOWeek();
  const [daily, weekly] = await Promise.all([
    getDailyForDate(date),
    getWeeklyForWeek(week),
  ]);

  return (
    <main className="max-w-5xl mx-auto px-5 sm:px-6 pt-12 sm:pt-20 pb-24">
      {/* Hero ---------------------------------------------------------- */}
      <section className="max-w-3xl">
        <div className="flex items-center gap-2 mb-5">
          <span className="pill pill-accent">A practice for product taste</span>
        </div>
        <h1 className="display text-[2.5rem] sm:text-[3.5rem] lg:text-[4rem]">
          Form your take{" "}
          <span style={{ fontStyle: "italic", color: "var(--accent)" }}>before</span>{" "}
          you see anyone else's.
        </h1>
        <p className="body-prose mt-6 max-w-2xl drop-cap">
          Product taste is a reflex you build by forming opinions and watching them collide
          with reality. Two reps a week — one short, one deep — on real product decisions.
          No frameworks. No model-graded answers.
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-7">
          <Link
            href="/today"
            className="btn-accent rounded-md px-5 py-2.5 text-sm inline-flex items-center gap-1.5"
          >
            Start today's rep <span aria-hidden>→</span>
          </Link>
          <Link href="/this-week" className="btn-ghost rounded-md px-5 py-2.5 text-sm">
            Open this week's deep rep
          </Link>
        </div>
      </section>

      {/* The two reps — rule-divided columns, not cards ---------------- */}
      <ScrollReveal as="section" className="mt-16">
        <div className="eyebrow mb-5">The two reps</div>
        <div className="grid sm:grid-cols-2 sm:divide-x" style={{ borderColor: "var(--rule)" }}>
          {/* Daily column */}
          <Link
            href="/today"
            className="block group py-6 sm:pr-8 sm:py-0 transition-colors"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--accent)" }}
                />
                <span className="eyebrow">Today · ~3 min</span>
              </div>
              <RepStatus kind="daily" scopeKey={date} freshLabel="New today" />
            </div>
            <h2
              className="headline text-[1.75rem] sm:text-[2rem] mb-2 transition-colors group-hover:text-[color:var(--accent)]"
            >
              Daily rep
            </h2>
            <p className="body-prose">
              One real product moment. Notice what's interesting before you read what anyone
              said about it.
            </p>
            <div
              className="mt-5 pt-4 border-t text-sm flex items-baseline justify-between gap-3"
              style={{ borderColor: "var(--rule)" }}
            >
              <span style={{ color: "var(--ink)" }} className="font-medium">
                {daily.company}
              </span>
              <span className="text-xs" style={{ color: "var(--ink-mute)" }}>
                {daily.era}
              </span>
            </div>
          </Link>

          {/* Weekly column */}
          <Link
            href="/this-week"
            className="block group py-6 sm:pl-8 sm:py-0 border-t sm:border-t-0 transition-colors"
            style={{ borderColor: "var(--rule)" }}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--accent-2)" }}
                />
                <span className="eyebrow">This week · ~25 min</span>
              </div>
              <RepStatus
                kind="weekly"
                scopeKey={week}
                freshLabel="New this week"
                tone="accent-2"
              />
            </div>
            <h2
              className="headline text-[1.75rem] sm:text-[2rem] mb-2 transition-colors group-hover:text-[color:var(--accent-2)]"
            >
              Weekly deep rep
            </h2>
            <p className="body-prose">
              A real decision room. Write your full take across tradeoff, user, alternative,
              prediction. Then see what actually happened.
            </p>
            <div
              className="mt-5 pt-4 border-t text-sm flex items-baseline justify-between gap-3"
              style={{ borderColor: "var(--rule)" }}
            >
              <span style={{ color: "var(--ink)" }} className="font-medium">
                {weekly.company}
              </span>
              <span className="text-xs" style={{ color: "var(--ink-mute)" }}>
                {weekly.era}
              </span>
            </div>
          </Link>
        </div>
      </ScrollReveal>

      {/* How a rep works — typographic, no boxes ------------------------ */}
      <ScrollReveal as="section" className="mt-20" delay={60}>
        <div className="eyebrow mb-6">How a rep works</div>
        <ol className="grid sm:grid-cols-3 gap-x-8 gap-y-6">
          {[
            "Read a real product moment.",
            "Commit to your unfiltered take.",
            "See what actually shipped.",
          ].map((step, i) => (
            <li key={i} className="relative pl-10">
              <span
                className="absolute left-0 top-0 inline-flex items-center justify-center"
                aria-hidden
                style={{
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "999px",
                  border: "1px solid var(--rule)",
                  background: "var(--paper-raised)",
                  color: "var(--accent)",
                  fontFamily: "var(--font-display), serif",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  letterSpacing: "-0.01em",
                }}
              >
                {i + 1}
              </span>
              <p className="subhead text-lg leading-snug">{step}</p>
            </li>
          ))}
        </ol>
      </ScrollReveal>

      {/* Constraint footer — pull-quote treatment ---------------------- */}
      <ScrollReveal as="section" className="mt-20 drop-rule pt-8">
        <div className="grid sm:grid-cols-[auto,1fr] gap-x-5 gap-y-2 max-w-3xl">
          <span className="pill pill-accent-2 shrink-0 mt-0.5 self-start">A constraint</span>
          <p className="pullquote">
            Nothing here was written or scored by an LLM. Every scenario is a real decision;
            every reveal is a real quote, a real outcome, a real tradeoff. The point is to
            stay out of the model's voice long enough to find your own.
          </p>
        </div>
      </ScrollReveal>
    </main>
  );
}
