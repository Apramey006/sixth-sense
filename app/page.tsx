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
    <main className="max-w-6xl mx-auto px-5 sm:px-6 pt-14 sm:pt-24 pb-24">
      {/* Hero — lead with the thesis -------------------------------- */}
      <section className="max-w-4xl">
        <h1 className="display text-[3rem] sm:text-[4.5rem] lg:text-[5.5rem]">
          When everyone can build,{" "}
          <span style={{ color: "var(--accent)" }}>instinct is the edge.</span>
        </h1>
        <p className="body-prose mt-7 max-w-2xl">
          Sixth Sense is a practice tool for the one skill AI can't hand you: product
          instinct. Two reps a week — one short, one deep — on real product decisions,
          taken before you see how they were actually solved.
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

      {/* Two reps — the only section that earns cards --------------- */}
      <section className="mt-28">
        <p
          className="subhead text-2xl sm:text-3xl mb-8 max-w-3xl"
          style={{ letterSpacing: "-0.02em" }}
        >
          Form your take{" "}
          <span style={{ color: "var(--accent)" }}>before</span> you see anyone
          else's.
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
          <Link href="/today" className="card card-link p-7 sm:p-8 flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-6">
              <span className="icon-disc" aria-hidden>
                <DailyIcon />
              </span>
              <RepStatus kind="daily" scopeKey={date} freshLabel="New today" />
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
                ~3 min · {daily.era}
              </span>
            </div>
          </Link>

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
                ~25 min · {weekly.era}
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* How a rep works — pure type + hairlines, no cards ----------- */}
      <section className="mt-28">
        <ol className="grid sm:grid-cols-3 sm:divide-x" style={{ borderColor: "var(--rule)" }}>
          {[
            "Read a real product moment.",
            "Commit to your unfiltered take.",
            "See what actually shipped.",
          ].map((step, i) => (
            <li
              key={i}
              className="py-6 sm:py-0 sm:px-8 first:sm:pl-0 last:sm:pr-0 border-t sm:border-t-0"
              style={{ borderColor: "var(--rule)" }}
            >
              <div
                className="mono text-sm mb-4"
                style={{ color: "var(--accent)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <p className="subhead text-xl sm:text-2xl">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Constraint — pullquote with a thick left rule, no card ----- */}
      <section className="mt-28">
        <div
          className="max-w-3xl pl-6 sm:pl-8"
          style={{ borderLeft: "3px solid var(--accent)" }}
        >
          <p className="pullquote text-[1.625rem] sm:text-[1.875rem] leading-snug">
            Nothing here was written or scored by an LLM. Every scenario is a
            real decision; every reveal is a real quote, a real outcome, a real
            tradeoff. The point is to stay out of the model's voice long enough
            to find your own.
          </p>
        </div>
      </section>
    </main>
  );
}

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
      <path
        d="M8 3v4M16 3v4M4 11h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
