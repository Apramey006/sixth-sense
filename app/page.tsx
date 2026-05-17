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
    <main className="max-w-3xl mx-auto px-5 sm:px-6 pt-16 sm:pt-24 pb-24">
      <section>
        <h1 className="display text-[2.5rem] sm:text-[3.5rem]">
          When everyone can build, instinct is the edge.
        </h1>
        <p className="body-prose mt-6 max-w-2xl">
          Sixth Sense is a practice tool for the one skill AI can't hand you:
          product instinct. Two reps a week — one short, one deep — on real
          product decisions, taken before you see how they were actually solved.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-8">
          <Link
            href="/today"
            className="btn-accent rounded-md px-5 py-2.5 text-sm inline-flex items-center gap-2"
          >
            Start today's rep <span aria-hidden>→</span>
          </Link>
          <Link
            href="/this-week"
            className="btn-ghost rounded-md px-5 py-2.5 text-sm"
          >
            Open this week's deep rep
          </Link>
        </div>
      </section>

      <section className="mt-20">
        <p
          className="subhead text-xl sm:text-2xl mb-6 max-w-2xl"
          style={{ color: "var(--ink-soft)" }}
        >
          Form your take before you see anyone else's.
        </p>
        <ul className="divide-y" style={{ borderColor: "var(--rule)" }}>
          <li>
            <Link
              href="/today"
              className="group flex items-baseline justify-between gap-4 py-6 hover:opacity-80 transition-opacity"
            >
              <div className="min-w-0">
                <div className="flex items-baseline gap-3 mb-1.5 flex-wrap">
                  <span className="mono text-xs" style={{ color: "var(--ink-mute)" }}>
                    DAILY · ~3 MIN
                  </span>
                  <RepStatus kind="daily" scopeKey={date} freshLabel="New today" />
                </div>
                <h2 className="headline text-xl sm:text-2xl">
                  {daily.company}
                </h2>
                <p className="mono text-xs mt-1" style={{ color: "var(--ink-mute)" }}>
                  {daily.era}
                </p>
              </div>
              <span aria-hidden className="text-xl" style={{ color: "var(--ink-mute)" }}>
                →
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/this-week"
              className="group flex items-baseline justify-between gap-4 py-6 hover:opacity-80 transition-opacity"
            >
              <div className="min-w-0">
                <div className="flex items-baseline gap-3 mb-1.5 flex-wrap">
                  <span className="mono text-xs" style={{ color: "var(--ink-mute)" }}>
                    WEEKLY · ~25 MIN
                  </span>
                  <RepStatus
                    kind="weekly"
                    scopeKey={week}
                    freshLabel="New this week"
                    tone="accent-2"
                  />
                </div>
                <h2 className="headline text-xl sm:text-2xl">
                  {weekly.company}
                </h2>
                <p className="mono text-xs mt-1" style={{ color: "var(--ink-mute)" }}>
                  {weekly.era}
                </p>
              </div>
              <span aria-hidden className="text-xl" style={{ color: "var(--ink-mute)" }}>
                →
              </span>
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-20">
        <ol className="space-y-5 max-w-xl">
          {[
            "Read a real product moment.",
            "Commit to your unfiltered take.",
            "See what actually shipped.",
          ].map((step, i) => (
            <li key={i} className="flex items-baseline gap-4">
              <span
                className="mono text-xs shrink-0 w-6"
                style={{ color: "var(--ink-mute)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="subhead text-lg sm:text-xl">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20">
        <div
          className="max-w-2xl pl-5 sm:pl-6"
          style={{ borderLeft: "2px solid var(--ink)" }}
        >
          <p className="pullquote text-lg sm:text-xl leading-relaxed">
            The scenarios here are real. Actual product decisions, real quotes,
            real outcomes. Your take isn't graded by a model; you compare it to
            what actually shipped. The point is to stay out of the model's voice
            long enough to find your own.
          </p>
        </div>
      </section>
    </main>
  );
}
