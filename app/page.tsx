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
    <main className="max-w-6xl mx-auto px-5 sm:px-6 pt-14 sm:pt-24 pb-24">
      {/* Hero ---------------------------------------------------------- */}
      <section className="max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="pill pill-accent">A practice for product taste</span>
        </div>
        <h1 className="display text-[3rem] sm:text-[4.5rem] lg:text-[5.5rem]">
          Form your take{" "}
          <span style={{ color: "var(--accent)" }}>before</span> you see anyone
          else's.
        </h1>
        <p className="body-prose mt-7 max-w-2xl">
          Product taste is a reflex you build by forming opinions and watching them
          collide with reality. Two reps a week — one short, one deep — on real
          product decisions. No frameworks. No model-graded answers.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-9">
          <Link
            href="/today"
            className="btn-accent rounded-full px-6 py-3 text-sm inline-flex items-center gap-2"
          >
            Start today's rep <span aria-hidden>→</span>
          </Link>
          <Link
            href="/this-week"
            className="btn-ghost rounded-full px-6 py-3 text-sm"
          >
            Open this week's deep rep
          </Link>
        </div>
      </section>

      {/* Two reps — large cards with gold icon discs ------------------ */}
      <ScrollReveal as="section" className="mt-20">
        <div className="flex items-baseline justify-between mb-6">
          <span className="mono text-xs" style={{ color: "var(--ink-mute)" }}>
            01 — The two reps
          </span>
          <span className="mono text-xs" style={{ color: "var(--ink-mute)" }}>
            ✦ ✦
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Daily card */}
          <Link href="/today" className="card card-link p-7 sm:p-8 flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-6">
              <span className="icon-disc" aria-hidden>
                <DailyIcon />
              </span>
              <RepStatus kind="daily" scopeKey={date} freshLabel="New today" />
            </div>
            <div
              className="mono text-xs mb-2"
              style={{ color: "var(--ink-mute)" }}
            >
              TODAY · ~3 MIN
            </div>
            <h2 className="headline text-3xl sm:text-4xl mb-3">Daily rep</h2>
            <p className="body-prose">
              One real product moment. Notice what's interesting before you read
              what anyone said about it.
            </p>
            <div
              className="mt-7 pt-5 border-t flex items-baseline justify-between"
              style={{ borderColor: "var(--rule)" }}
            >
              <span className="font-semibold">{daily.company}</span>
              <span
                className="mono text-xs"
                style={{ color: "var(--ink-mute)" }}
              >
                {daily.era}
              </span>
            </div>
          </Link>

          {/* Weekly card */}
          <Link
            href="/this-week"
            className="card card-link p-7 sm:p-8 flex flex-col"
            data-tone="accent-2"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <span className="icon-disc icon-disc-2" aria-hidden>
                <WeeklyIcon />
              </span>
              <RepStatus
                kind="weekly"
                scopeKey={week}
                freshLabel="New this week"
                tone="accent-2"
              />
            </div>
            <div
              className="mono text-xs mb-2"
              style={{ color: "var(--ink-mute)" }}
            >
              THIS WEEK · ~25 MIN
            </div>
            <h2 className="headline text-3xl sm:text-4xl mb-3">
              Weekly deep rep
            </h2>
            <p className="body-prose">
              A real decision room. Write your full take across tradeoff, user,
              alternative, prediction. Then see what actually happened.
            </p>
            <div
              className="mt-7 pt-5 border-t flex items-baseline justify-between"
              style={{ borderColor: "var(--rule)" }}
            >
              <span className="font-semibold">{weekly.company}</span>
              <span
                className="mono text-xs"
                style={{ color: "var(--ink-mute)" }}
              >
                {weekly.era}
              </span>
            </div>
          </Link>
        </div>
      </ScrollReveal>

      {/* How a rep works ---------------------------------------------- */}
      <ScrollReveal as="section" className="mt-24" delay={60}>
        <div className="flex items-baseline justify-between mb-6">
          <span className="mono text-xs" style={{ color: "var(--ink-mute)" }}>
            02 — How a rep works
          </span>
          <span className="mono text-xs" style={{ color: "var(--ink-mute)" }}>
            ✦ ✦
          </span>
        </div>
        <ol className="grid sm:grid-cols-3 gap-5">
          {[
            "Read a real product moment.",
            "Commit to your unfiltered take.",
            "See what actually shipped.",
          ].map((step, i) => (
            <li key={i} className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="field-num">{String(i + 1).padStart(2, "0")}</span>
                <span
                  className="mono text-xs"
                  style={{ color: "var(--ink-mute)" }}
                >
                  STEP
                </span>
              </div>
              <p className="subhead text-lg">{step}</p>
            </li>
          ))}
        </ol>
      </ScrollReveal>

      {/* Constraint footer — pullquote in card ------------------------ */}
      <ScrollReveal as="section" className="mt-24">
        <div className="flex items-baseline justify-between mb-6">
          <span className="mono text-xs" style={{ color: "var(--ink-mute)" }}>
            03 — A constraint
          </span>
          <span className="mono text-xs" style={{ color: "var(--ink-mute)" }}>
            ✦ ✦
          </span>
        </div>
        <div className="card p-8 sm:p-10">
          <div className="flex items-start gap-5">
            <span className="icon-disc icon-disc-2 shrink-0" aria-hidden>
              <ConstraintIcon />
            </span>
            <p className="pullquote">
              Nothing here was written or scored by an LLM. Every scenario is a
              real decision; every reveal is a real quote, a real outcome, a real
              tradeoff. The point is to stay out of the model's voice long enough
              to find your own.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </main>
  );
}

/* Inline gold-disc icons — kept here so the page is self-contained ------ */

function DailyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WeeklyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="4"
        y="6"
        width="16"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M8 3v4M16 3v4M4 11h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ConstraintIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l9 5v6c0 4.5-3.5 7-9 7s-9-2.5-9-7V8l9-5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
