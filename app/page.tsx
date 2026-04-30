import Link from "next/link";
import { Masthead } from "@/components/Masthead";

export default function HomePage() {
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

        <div className="grid sm:grid-cols-2 gap-5 mt-12">
          <Link
            href="/today"
            className="group block bg-white border rounded-md p-6 hover:border-ink transition"
            style={{ borderColor: "var(--rule)" }}
          >
            <div className="smallcaps mb-3" style={{ color: "var(--accent)" }}>
              Today
            </div>
            <div className="serif text-2xl mb-2 group-hover:underline">Daily rep</div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              Three minutes. One real product moment. Notice what's interesting before you read what anyone said about
              it.
            </p>
          </Link>
          <Link
            href="/this-week"
            className="group block bg-white border rounded-md p-6 hover:border-ink transition"
            style={{ borderColor: "var(--rule)" }}
          >
            <div className="smallcaps mb-3" style={{ color: "var(--accent)" }}>
              This week
            </div>
            <div className="serif text-2xl mb-2 group-hover:underline">Weekly deep rep</div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              Twenty-five minutes. A real decision room. Write your full take across tradeoff, user, alternative,
              prediction. Then see what actually happened.
            </p>
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
