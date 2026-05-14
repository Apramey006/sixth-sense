"use client";

import { useEffect, useState } from "react";
import type { WeeklyScenario } from "@/lib/supabase";
import { submitTake } from "@/lib/submit";
import { markCompleted } from "@/lib/anonId";
import { PostRepFooter } from "@/components/PostRepFooter";

type Take = { tradeoff: string; user: string; alt: string; predict: string };

export function WeeklyRep({ scenario }: { scenario: WeeklyScenario }) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [take, setTake] = useState<Take>({ tradeoff: "", user: "", alt: "", predict: "" });
  const [submitting, setSubmitting] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  const draftKey = `sixth-sense:weekly-draft:${scenario.id}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (raw) {
        const saved = JSON.parse(raw) as Take;
        if (saved && (saved.tradeoff || saved.user || saved.alt || saved.predict)) {
          setTake(saved);
          setDraftRestored(true);
        }
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setTimeout(() => {
      try {
        const hasContent = Object.values(take).some((v) => v.trim());
        if (hasContent) window.localStorage.setItem(draftKey, JSON.stringify(take));
      } catch {
        /* ignore */
      }
    }, 250);
    return () => clearTimeout(t);
  }, [take, draftKey]);

  async function submitAndReveal() {
    const empty = Object.values(take).some((v) => !v.trim());
    if (empty) {
      alert("Write something for all four — even rough one-liners. The reps only work if you commit.");
      return;
    }
    setSubmitting(true);
    await submitTake({
      scenario_id: scenario.id,
      scenario_type: "weekly",
      body: take,
    });
    markCompleted("weekly", scenario.iso_week);
    try {
      if (typeof window !== "undefined") window.localStorage.removeItem(draftKey);
    } catch {
      /* ignore */
    }
    setSubmitting(false);
    setStep(2);
  }

  // Step indicator (replaces I./II./III. roman chapters)
  const Stepper = ({ active }: { active: 1 | 2 | 3 }) => (
    <div className="flex items-center gap-1.5 mb-4">
      {[
        { n: 1, label: "Scenario" },
        { n: 2, label: "Your take" },
        { n: 3, label: "Reveal" },
      ].map((s) => {
        const isActive = s.n === active;
        const isDone = s.n < active;
        return (
          <div key={s.n} className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-md text-[0.6875rem] font-semibold"
              style={{
                background: isActive
                  ? "var(--accent-2)"
                  : isDone
                  ? "rgba(127, 160, 137, 0.18)"
                  : "var(--rule-soft)",
                color: isActive
                  ? "var(--paper)"
                  : isDone
                  ? "var(--accent-2)"
                  : "var(--ink-mute)",
              }}
            >
              {s.n}
            </span>
            <span
              className="text-xs font-medium"
              style={{
                color: isActive ? "var(--ink)" : "var(--ink-mute)",
              }}
            >
              {s.label}
            </span>
            {s.n < 3 && (
              <span
                aria-hidden
                className="inline-block w-4 h-px mx-1"
                style={{ background: "var(--rule)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  if (step === 0) {
    return (
      <section className="fade-up">
        <Stepper active={1} />

        <div className="mb-7">
          <h1 className="display text-[2rem] sm:text-[2.25rem]">
            Form your take before you see anyone else's.
          </h1>
          <p
            className="body-prose mt-3 max-w-2xl"
            style={{ color: "var(--ink-soft)" }}
          >
            One real product decision. Write your unfiltered take across four dimensions
            before we show you what shipped and what happened.
          </p>
        </div>

        <article
          className="scenario card p-6 sm:p-7"
          style={{ fontSize: "1rem", lineHeight: 1.65 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="pill pill-accent-2">This week</span>
            <span className="text-xs" style={{ color: "var(--ink-mute)" }}>
              A decision room, not yet decided.
            </span>
          </div>
          <h2
            className="text-2xl sm:text-[1.625rem] mb-5"
            style={{ fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.2 }}
          >
            {scenario.company}, {scenario.era.toLowerCase()}.
          </h2>

          <div style={{ color: "var(--ink-soft)" }}>
            {scenario.intro.split("\n\n").map((para, i) => (
              <p key={i} className={i === 0 ? "lede" : ""}>
                {para}
              </p>
            ))}
          </div>

          <div
            className="my-6 accent-rail-2 pl-4 py-1"
            style={{ color: "var(--ink-soft)" }}
          >
            <div className="eyebrow mb-2" style={{ color: "var(--accent-2)" }}>
              Open questions on the table
            </div>
            <ul className="space-y-1.5 text-[0.9375rem]">
              {scenario.open_questions.map((q, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color: "var(--accent-2)" }}>—</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <p style={{ color: "var(--ink-soft)" }}>{scenario.closing}</p>
        </article>

        <div className="mt-8 drop-rule pt-6">
          <div className="eyebrow mb-3">What you'll see after you submit</div>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                t: "What shipped",
                b: "The actual decision and the public reasoning behind it.",
              },
              {
                t: "Real outcomes",
                b: "Numbers from the months and years after — not predictions.",
              },
              {
                t: "Your take vs. reality",
                b: "A side-by-side, dimension by dimension. The point of the rep.",
              },
            ].map((c, i) => (
              <div key={i} className="card p-4">
                <div
                  className="text-sm"
                  style={{ fontWeight: 600, color: "var(--ink)" }}
                >
                  {c.t}
                </div>
                <p
                  className="text-xs mt-1 leading-relaxed"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {c.b}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7">
          <button
            onClick={() => setStep(1)}
            className="btn-accent px-4 py-2 rounded-md text-sm inline-flex items-center gap-1.5"
          >
            I've read it — write my take <span aria-hidden>→</span>
          </button>
        </div>
      </section>
    );
  }

  if (step === 1) {
    return (
      <section className="fade-up">
        <Stepper active={2} />

        <h2
          className="text-2xl sm:text-[1.75rem] mb-1.5"
          style={{ fontWeight: 600, letterSpacing: "-0.015em" }}
        >
          Write what you actually think.
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--ink-soft)" }}>
          No editing for a model, no looking things up. The point is your raw instinct.
        </p>
        {draftRestored && (
          <div
            className="text-xs mb-5 -mt-3 inline-flex items-center gap-1.5 pill pill-mute"
          >
            Draft restored from your last visit
          </div>
        )}

        <div className="space-y-5">
          {(
            [
              {
                key: "tradeoff",
                n: 1,
                label: "What's the core tradeoff?",
                help: "What's the real tension this decision sits on top of?",
                example:
                  "e.g. They're trading launch-week credibility for long-term retention — willing to look unfinished to ship inside a market window.",
              },
              {
                key: "user",
                n: 2,
                label: "Who is the actual target user?",
                help: "Not 'everyone.' Who specifically — and who are they stealing time from?",
                example:
                  "e.g. Existing IG users curious about text social, not the Twitter power-user cohort. They're stealing time from passive scrolling, not from X.",
              },
              {
                key: "alt",
                n: 3,
                label: "What would you do differently?",
                help: "Pick one real alternative path and commit to it.",
                example:
                  "e.g. Decoupled launch with DMs from day one, slower S-curve but durable trust — accept losing the Twitter timing window.",
              },
              {
                key: "predict",
                n: 4,
                label: "What do you predict will happen?",
                help: "Concrete prediction. Big launch then collapse? Slow burn? Why?",
                example:
                  "e.g. Massive launch-week numbers, fast collapse to 20% of peak, then slow recovery on the back of patient feature work.",
              },
            ] as const
          ).map(({ key, n, label, help, example }) => (
            <div key={key} className="card p-4">
              <label className="flex items-center gap-2.5 mb-1">
                <span className="field-num shrink-0">{n}</span>
                <span
                  className="text-base"
                  style={{ fontWeight: 600, letterSpacing: "-0.005em" }}
                >
                  {label}
                </span>
              </label>
              <p
                className="text-xs mb-2 ml-9"
                style={{ color: "var(--ink-soft)" }}
              >
                {help}
              </p>
              <textarea
                rows={3}
                className="w-full border rounded-md px-3 py-2 ml-0"
                style={{ borderColor: "var(--rule)", background: "var(--paper)" }}
                placeholder={example}
                value={take[key]}
                onChange={(e) => setTake({ ...take, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>

        <div className="drop-rule mt-8 pt-6 flex items-center gap-3 flex-wrap">
          <button
            onClick={submitAndReveal}
            disabled={submitting}
            className="btn-accent px-4 py-2 rounded-md text-sm disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {submitting ? "Submitting…" : (
              <>
                Submit and reveal <span aria-hidden>→</span>
              </>
            )}
          </button>
          <p className="text-xs" style={{ color: "var(--ink-mute)" }}>
            Once you reveal, you can't un-see it. That's the point.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="reveal-stage">
      <div>
        <Stepper active={3} />
        <div className="eyebrow mb-2" style={{ color: "var(--accent)" }}>
          What shipped
        </div>
        <h2
          className="text-2xl sm:text-[1.75rem] mb-3"
          style={{ fontWeight: 600, letterSpacing: "-0.015em" }}
        >
          The decision they made.
        </h2>
        <p
          className="text-[0.95rem] leading-relaxed"
          style={{ color: "var(--ink)" }}
        >
          {scenario.decision}
        </p>
      </div>

      <div className="mt-9 card p-5 accent-rail">
        <blockquote className="pullquote">"{scenario.pullquote}"</blockquote>
        <div className="text-xs mt-2" style={{ color: "var(--ink-mute)" }}>
          — {scenario.pullquote_attribution}
        </div>
      </div>

      <div className="mt-9 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {scenario.outcomes.map((o, i) => (
          <div
            key={i}
            className="card p-4"
          >
            <div
              className="stat-num text-2xl sm:text-3xl"
              style={{ color: o.accent ? "var(--accent)" : "var(--ink)" }}
            >
              {o.stat}
            </div>
            <div
              className="text-xs mt-1 leading-snug"
              style={{ color: "var(--ink-soft)" }}
            >
              {o.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="eyebrow mb-3" style={{ color: "var(--accent)" }}>
          The interesting tradeoffs
        </div>
        <div className="space-y-3">
          {scenario.tradeoffs.map((t, i) => (
            <div key={i} className="card p-4">
              <div
                className="text-base"
                style={{ fontWeight: 600, letterSpacing: "-0.005em" }}
              >
                {t.title}
              </div>
              <p
                className="text-sm leading-relaxed mt-1"
                style={{ color: "var(--ink-soft)" }}
              >
                {t.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <div className="eyebrow mb-3" style={{ color: "var(--accent-2)" }}>
          Your take, side-by-side
        </div>
        <div className="space-y-5">
          {(
            [
              { key: "tradeoff", label: "The core tradeoff" },
              { key: "user", label: "The target user" },
              { key: "alt", label: "What you'd do differently" },
              { key: "predict", label: "Your prediction" },
            ] as const
          ).map(({ key, label }) => (
            <div key={key} className="card p-4">
              <div className="eyebrow mb-3">{label}</div>
              <div className="compare-row">
                <div>
                  <div
                    className="text-[0.6875rem] mb-1 font-semibold uppercase tracking-wider"
                    style={{ color: "var(--ink-mute)" }}
                  >
                    You wrote
                  </div>
                  <p
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: "var(--ink)" }}
                  >
                    {take[key]}
                  </p>
                </div>
                <div>
                  <div
                    className="text-[0.6875rem] mb-1 font-semibold uppercase tracking-wider"
                    style={{ color: "var(--accent)" }}
                  >
                    What they did
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--ink)" }}
                  >
                    {scenario.per_dimension_truth[key]}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-12 rounded-xl p-7 border"
        style={{
          background: "var(--paper-deep)",
          color: "var(--ink-soft)",
          borderColor: "var(--rule)",
        }}
      >
        <div className="eyebrow mb-3">Don't type an answer</div>
        <p
          className="text-xl leading-snug"
          style={{ fontWeight: 600, letterSpacing: "-0.005em", color: "var(--ink)" }}
        >
          Where did your take diverge most from what actually happened — and is that
          divergence a blind spot, or a real disagreement you'd defend?
        </p>
        <p className="text-sm mt-5" style={{ color: "var(--ink-mute)" }}>
          The rep is the noticing. Close the tab and let it sit.
        </p>
      </div>

      <PostRepFooter kind="weekly" />
    </section>
  );
}
