import Link from "next/link";
import { Masthead } from "@/components/Masthead";
import { RepStatus } from "@/components/RepStatus";
import { getDailyForDate, getWeeklyForWeek } from "@/lib/scenarios";
import { todayISO, currentISOWeek } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const date = todayISO();
  const week = currentISOWeek();
  const [daily, weekly] = await Promise.all([getDailyForDate(date), getWeeklyForWeek(week)]);

  return (
    <>
      <Masthead subtitle="A practice for product taste" />
      <main className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        <div className="chapter text-base mb-4" style={{ color: "var(--ink-soft)" }}>
          A note on what this is
        </div>
        <h1
          className="serif text-4xl sm:text-5xl leading-[1.08]"
          style={{ fontWeight: 500, letterSpacing: "-0.015em" }}
        >
          Form your take before you see anyone else's.
        </h1>
        <div className="rule mt-7 mb-7" />
        <p className="serif text-lg leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          Product taste is a reflex you build by forming opinions and watching them collide with reality. Not by reading
          frameworks. Not by asking a model.
        </p>
        <p
          className="serif text-lg leading-relaxed mt-5"
          style={{ color: "var(--ink-soft)" }}
        >
          Taste Reps gives you two practices. A short daily rep — a real product decision, a real screenshot, a single
          sentence on the most interesting choice you notice. And a weekly deep rep — a full scenario where you write
          your unfiltered take across four dimensions before we show you what shipped.
        </p>

        <div className="mt-12 mb-3 smallcaps" style={{ color: "var(--ink-soft)" }}>
          How a rep works
        </div>
        <ol
          className="grid sm:grid-cols-3 gap-x-6 gap-y-3 serif text-base leading-snug"
          style={{ color: "var(--ink-soft)" }}
        >
          <li>
            <span className="field-num mr-2">i.</span>
            Read a real product moment.
          </li>
          <li>
            <span className="field-num mr-2">ii.</span>
            Commit to your unfiltered take.
          </li>
          <li>
            <span className="field-num mr-2">iii.</span>
            See what actually shipped.
          </li>
        </ol>

        <div className="grid sm:grid-cols-2 gap-5 mt-10">
          <Link
            href="/today"
            className="group block bg-white border rounded-md p-6 hover:border-ink transition"
            style={{ borderColor: "var(--rule)" }}
          >
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <div className="smallcaps" style={{ color: "var(--accent)" }}>
                Today
              </div>
              <RepStatus kind="daily" scopeKey={date} freshLabel="New today" />
            </div>
            <div className="serif text-2xl mb-2 group-hover:underline">Daily rep</div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              Three minutes. One real product moment. Notice what's interesting before you read what anyone said about
              it.
            </p>
            <div
              className="mt-4 pt-3 border-t text-sm serif italic"
              style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
            >
              Up today: {daily.company}
              <span style={{ color: "var(--ink-soft)" }}> — {daily.era}</span>
            </div>
          </Link>
          <Link
            href="/this-week"
            className="group block bg-white border rounded-md p-6 hover:border-ink transition"
            style={{ borderColor: "var(--rule)" }}
          >
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <div className="smallcaps" style={{ color: "var(--accent)" }}>
                This week
              </div>
              <RepStatus kind="weekly" scopeKey={week} freshLabel="New this week" />
            </div>
            <div className="serif text-2xl mb-2 group-hover:underline">Weekly deep rep</div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              Twenty-five minutes. A real decision room. Write your full take across tradeoff, user, alternative,
              prediction. Then see what actually happened.
            </p>
            <div
              className="mt-4 pt-3 border-t text-sm serif italic"
              style={{ borderColor: "var(--rule)", color: "var(--ink)" }}
            >
              In the room: {weekly.company}
              <span style={{ color: "var(--ink-soft)" }}> — {weekly.era}</span>
            </div>
          </Link>
        </div>

        <div className="drop-rule mt-16 pt-8 text-sm" style={{ color: "var(--ink-soft)" }}>
          <span className="smallcaps">A constraint</span>
          <p className="mt-2 leading-relaxed">
            Nothing here was written or scored by an LLM. Every scenario is a real decision; every reveal is a real
            quote, a real outcome, a real tradeoff. The point is to stay out of the model's voice long enough to find
            your own.
          </p>
        </div>
      </main>
    </>
  );
}
