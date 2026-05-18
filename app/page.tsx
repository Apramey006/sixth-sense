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

  const filed = new Date(date + "T00:00:00")
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
  const weekNo = week.split("-W")[1] ?? "";
  const year = week.split("-")[0] ?? "";

  return (
    <main className="home-shell mx-auto px-4 sm:px-8 pb-24">
      {/* Issue masthead */}
      <header className="issue-strip">
        <span className="issue-no">Issue Nº {weekNo}</span>
        <span className="dot" aria-hidden>·</span>
        <span>{year}</span>
        <span className="dot" aria-hidden>·</span>
        <span>Filed {filed}</span>
        <span className="dateline">A practice paper for product taste</span>
      </header>

      {/* Hero */}
      <section className="home-hero reveal-stage">
        <div className="home-hero-eyebrow">
          <span className="line" aria-hidden />
          <span>The thesis</span>
        </div>
        <h1 className="home-display">
          When everyone can build,
          <br />
          <em className="home-display-em">instinct</em> is the edge.
        </h1>
        <p className="home-deck">
          Sixth Sense is a practice paper for the one skill AI can't hand you:
          <em> product instinct.</em> Two reps a week — one short, one deep — on
          real product decisions, taken before you see how they were actually
          solved.
        </p>
        <div className="home-cta-row">
          <Link href="/today" className="home-cta-primary">
            Begin today's rep <span aria-hidden>→</span>
          </Link>
          <Link href="/this-week" className="home-cta-ghost">
            Read the weekly decision room
          </Link>
        </div>
      </section>

      {/* Today's dispatch */}
      <section className="dispatch-section">
        <div className="section-banner">
          <span className="section-banner-num">§ I</span>
          <span className="section-banner-label">Today's dispatch</span>
          <span className="section-banner-meta">Two files open</span>
        </div>

        <ul className="dispatch-list">
          <li>
            <Link href="/today" className="dispatch-row">
              <div className="dispatch-col-kind">
                <span className="kind-tag">Daily</span>
                <span className="kind-len">~3 min</span>
              </div>
              <div className="dispatch-col-body">
                <div className="dispatch-status">
                  <RepStatus kind="daily" scopeKey={date} freshLabel="New today" />
                </div>
                <h2 className="dispatch-headline">{daily.company}</h2>
                <p className="dispatch-era">{daily.era}</p>
              </div>
              <span className="dispatch-arrow" aria-hidden>→</span>
            </Link>
          </li>
          <li>
            <Link href="/this-week" className="dispatch-row">
              <div className="dispatch-col-kind">
                <span className="kind-tag is-weekly">Weekly</span>
                <span className="kind-len">~25 min</span>
              </div>
              <div className="dispatch-col-body">
                <div className="dispatch-status">
                  <RepStatus
                    kind="weekly"
                    scopeKey={week}
                    freshLabel="New this week"
                    tone="accent-2"
                  />
                </div>
                <h2 className="dispatch-headline">{weekly.company}</h2>
                <p className="dispatch-era">{weekly.era}</p>
              </div>
              <span className="dispatch-arrow" aria-hidden>→</span>
            </Link>
          </li>
        </ul>
      </section>

      {/* Method */}
      <section className="method-section">
        <div className="section-banner">
          <span className="section-banner-num">§ II</span>
          <span className="section-banner-label">The method</span>
          <span className="section-banner-meta">Three steps, twice a week</span>
        </div>

        <ol className="method-list">
          {[
            {
              t: "Read a real product moment",
              b: "A real company, a real era, a real fork in the road. No textbook, no synthesized prompts.",
            },
            {
              t: "Commit to your unfiltered take",
              b: "No editing for the model. No looking things up. Your raw read, on the record.",
            },
            {
              t: "See what actually shipped",
              b: "What they did, what came out, what they wished they'd known. The rep is the gap between your read and reality.",
            },
          ].map((step, i) => (
            <li key={i} className="method-item">
              <span className="method-num">{String(i + 1).padStart(2, "0")}</span>
              <div className="method-body">
                <h3 className="method-title">{step.t}</h3>
                <p className="method-blurb">{step.b}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Manifesto / endquote */}
      <section className="manifesto-section">
        <div className="section-banner">
          <span className="section-banner-num">§ III</span>
          <span className="section-banner-label">A note from the editors</span>
        </div>
        <blockquote className="manifesto-quote">
          <span className="manifesto-mark" aria-hidden>"</span>
          The scenarios here are real. Actual product decisions, real quotes,
          real outcomes. Your take isn't graded by a model; you compare it to
          what actually shipped. The point is to stay out of the model's voice
          long enough to find your own.
        </blockquote>
        <p className="manifesto-attr">— The editors</p>
      </section>

      <footer className="home-signoff">
        <span aria-hidden>—— ⁂ ——</span>
        <p>New daily rep filed each morning · Weekly deep rep every Sunday.</p>
      </footer>
    </main>
  );
}
