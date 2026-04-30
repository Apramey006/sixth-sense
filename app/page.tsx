import Link from "next/link";
import { RepStatus } from "@/components/RepStatus";
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
    <main className="max-w-5xl mx-auto px-5 sm:px-6 pt-10 sm:pt-14 pb-20">
      {/* Hero */}
      <section className="max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="pill pill-accent">A practice for product taste</span>
        </div>
        <h1 className="display text-[2.25rem] sm:text-[2.75rem]">
          Form your take before you see anyone else's.
        </h1>
        <p className="body-prose mt-4 max-w-2xl">
          Product taste is a reflex you build by forming opinions and watching them collide
          with reality. Two reps a week — one short, one deep — on real product decisions.
          No frameworks. No model-graded answers.
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-5">
          <Link href="/today" className="btn-accent rounded-md px-4 py-2 text-sm inline-flex items-center gap-1.5">
            Start today's rep <span aria-hidden>→</span>
          </Link>
          <Link href="/this-week" className="btn-ghost rounded-md px-4 py-2 text-sm">
            Open this week's deep rep
          </Link>
        </div>
      </section>

      {/* The two reps */}
      <section className="grid sm:grid-cols-2 gap-4 mt-10">
        <Link
          href="/today"
          className="card card-link block p-5 group"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: "var(--accent)" }}
              />
              <span className="eyebrow">Today · ~3 min</span>
            </div>
            <RepStatus kind="daily" scopeKey={date} freshLabel="New today" />
          </div>
          <div className="subhead text-xl mb-1.5 group-hover:text-[color:var(--accent)] transition-colors">
            Daily rep
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            One real product moment. Notice what's interesting before you read what anyone
            said about it.
          </p>
          <div
            className="mt-4 pt-3 border-t text-sm flex items-baseline justify-between gap-3"
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

        <Link
          href="/this-week"
          className="card card-link block p-5 group"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="inline-block w-2 h-2 rounded-full"
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
          <div
            className="subhead text-xl mb-1.5 transition-colors group-hover:text-[color:var(--accent-2)]"
          >
            Weekly deep rep
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            A real decision room. Write your full take across tradeoff, user, alternative,
            prediction. Then see what actually happened.
          </p>
          <div
            className="mt-4 pt-3 border-t text-sm flex items-baseline justify-between gap-3"
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
      </section>

      {/* How a rep works */}
      <section className="mt-12">
        <div className="eyebrow mb-3">How a rep works</div>
        <ol className="grid sm:grid-cols-3 gap-3">
          {[
            "Read a real product moment.",
            "Commit to your unfiltered take.",
            "See what actually shipped.",
          ].map((step, i) => (
            <li
              key={i}
              className="card p-4 flex items-start gap-3"
            >
              <span className="step-num shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-sm leading-snug" style={{ color: "var(--ink)" }}>
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Constraint footer */}
      <section className="mt-12 drop-rule pt-6">
        <div className="flex items-start gap-3 max-w-2xl">
          <span className="pill pill-accent-2 shrink-0 mt-0.5">A constraint</span>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Nothing here was written or scored by an LLM. Every scenario is a real decision;
            every reveal is a real quote, a real outcome, a real tradeoff. The point is to
            stay out of the model's voice long enough to find your own.
          </p>
        </div>
      </section>
    </main>
  );
}
