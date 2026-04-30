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

  const draftKey = `taste-reps:weekly-draft:${scenario.id}`;

  // Restore any saved draft on mount.
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

  // Persist draft as the user types (debounced via rAF-equivalent timeout).
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

  async function lockIn() {
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

  if (step === 0) {
    return (
      <section className="fade-up">
        <div className="mb-10">
          <div className="chapter text-base mb-4" style={{ color: "var(--ink-soft)" }}>
            I. The scenario
          </div>
          <h1 className="serif text-4xl sm:text-5xl leading-[1.08]" style={{ fontWeight: 500, letterSpacing: "-0.015em" }}>
            Form your take before you see anyone else's.
          </h1>
          <div className="rule mt-7 mb-7" />
          <p className="serif text-lg leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            One real product decision. Write your unfiltered take across four dimensions before we show you what shipped
            and what happened.
          </p>
        </div>

        <article className="scenario serif" style={{ fontSize: "1.125rem", lineHeight: 1.7 }}>
          <div className="smallcaps mb-2" style={{ color: "var(--accent)" }}>
            This week
          </div>
          <h2 className="serif text-3xl mb-1" style={{ fontWeight: 600, letterSpacing: "-0.01em" }}>
            {scenario.company}, {scenario.era.toLowerCase()}.
          </h2>
          <div className="smallcaps mb-8" style={{ color: "var(--ink-soft)" }}>
            A decision room, not yet decided.
          </div>

          {scenario.intro.split("\n\n").map((para, i) => (
            <p key={i} className={i === 0 ? "lede" : ""}>
              {para}
            </p>
          ))}

          <div className="my-8 accent-rail pl-5 py-1" style={{ color: "var(--ink-soft)" }}>
            <div className="smallcaps mb-3" style={{ color: "var(--accent)" }}>
              Open questions on the table
            </div>
            <ul className="space-y-2" style={{ fontSize: "1.0625rem" }}>
              {scenario.open_questions.map((q, i) => (
                <li key={i}>— {q}</li>
              ))}
            </ul>
          </div>

          <p>{scenario.closing}</p>
        </article>

        <div className="drop-rule mt-12 pt-8">
          <button onClick={() => setStep(1)} className="btn-primary px-6 py-3 rounded-md font-medium">
            I've read it — let me write my take →
          </button>
        </div>
      </section>
    );
  }

  if (step === 1) {
    return (
      <section className="fade-up">
        <div className="chapter text-base mb-4" style={{ color: "var(--ink-soft)" }}>
          II. Your take
        </div>
        <h2 className="serif text-3xl mb-2" style={{ fontWeight: 500, letterSpacing: "-0.01em" }}>
          Write what you actually think.
        </h2>
        <p className="text-sm mb-8" style={{ color: "var(--ink-soft)" }}>
          No editing for a model, no looking things up. The point is your raw instinct.
        </p>
        {draftRestored && (
          <div
            className="text-xs mb-6 -mt-4 italic"
            style={{ color: "var(--ink-soft)" }}
          >
            Draft restored from your last visit.
          </div>
        )}

        <div className="space-y-8">
          {(
            [
              { key: "tradeoff", n: "i.", label: "What's the core tradeoff?", help: "What's the real tension this decision sits on top of?" },
              { key: "user", n: "ii.", label: "Who is the actual target user?", help: "Not 'everyone.' Who specifically — and who are they stealing time from?" },
              { key: "alt", n: "iii.", label: "What would you do differently?", help: "Pick one real alternative path and commit to it." },
              { key: "predict", n: "iv.", label: "What do you predict will happen?", help: "Concrete prediction. Big launch then collapse? Slow burn? Why?" },
            ] as const
          ).map(({ key, n, label, help }) => (
            <div key={key}>
              <label className="block mb-1">
                <span className="field-num mr-2">{n}</span>
                <span className="serif text-xl" style={{ fontWeight: 500 }}>
                  {label}
                </span>
              </label>
              <p className="text-sm mb-2" style={{ color: "var(--ink-soft)" }}>
                {help}
              </p>
              <textarea
                rows={4}
                className="w-full border rounded-md px-3 py-2"
                style={{ borderColor: "var(--rule)", background: "white" }}
                value={take[key]}
                onChange={(e) => setTake({ ...take, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>

        <div className="drop-rule mt-10 pt-8">
          <button
            onClick={lockIn}
            disabled={submitting}
            className="btn-primary px-6 py-3 rounded-md font-medium disabled:opacity-50"
          >
            {submitting ? "Locking in…" : "Lock in my take → reveal what happened"}
          </button>
          <p className="text-xs mt-3" style={{ color: "var(--ink-soft)" }}>
            Once you reveal, you can't un-see it. That's the point.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="reveal-stage">
      <div>
        <div className="chapter text-base mb-4" style={{ color: "var(--ink-soft)" }}>
          III. What shipped
        </div>
        <h2 className="serif text-3xl mb-4" style={{ fontWeight: 500, letterSpacing: "-0.01em" }}>
          The decision they made.
        </h2>
        <p className="serif text-lg leading-relaxed">{scenario.decision}</p>
      </div>

      <div className="mt-12">
        <blockquote className="pullquote">"{scenario.pullquote}"</blockquote>
        <div className="smallcaps mt-3" style={{ color: "var(--ink-soft)" }}>
          — {scenario.pullquote_attribution}
        </div>
      </div>

      <div className="mt-12 grid sm:grid-cols-2 gap-x-8 gap-y-6">
        {scenario.outcomes.map((o, i) => (
          <div key={i} className="border-t pt-3" style={{ borderColor: "var(--rule)" }}>
            <div className="stat-num text-4xl" style={{ color: o.accent ? "var(--accent)" : "var(--ink)" }}>
              {o.stat}
            </div>
            <div className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
              {o.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14">
        <div className="smallcaps mb-4" style={{ color: "var(--accent)" }}>
          The interesting tradeoffs
        </div>
        <div className="space-y-5">
          {scenario.tradeoffs.map((t, i) => (
            <div key={i}>
              <div className="serif text-xl" style={{ fontWeight: 500 }}>
                {t.title}
              </div>
              <p className="serif leading-relaxed mt-1" style={{ color: "var(--ink-soft)" }}>
                {t.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14">
        <div className="smallcaps mb-4" style={{ color: "var(--accent)" }}>
          Your take, side-by-side
        </div>
        <div className="space-y-8">
          {(
            [
              { key: "tradeoff", label: "The core tradeoff" },
              { key: "user", label: "The target user" },
              { key: "alt", label: "What you'd do differently" },
              { key: "predict", label: "Your prediction" },
            ] as const
          ).map(({ key, label }) => (
            <div key={key}>
              <div className="smallcaps mb-3" style={{ color: "var(--ink-soft)" }}>
                {label}
              </div>
              <div className="compare-row">
                <div>
                  <div className="text-xs mb-1" style={{ color: "var(--ink-soft)" }}>
                    You wrote
                  </div>
                  <p className="serif leading-relaxed whitespace-pre-wrap">{take[key]}</p>
                </div>
                <div>
                  <div className="text-xs mb-1" style={{ color: "var(--ink-soft)" }}>
                    What they did
                  </div>
                  <p className="serif leading-relaxed">{scenario.per_dimension_truth[key]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-md p-10" style={{ background: "var(--ink)", color: "#e7e5e4" }}>
        <div className="smallcaps mb-3" style={{ color: "#a8a29e" }}>
          Don't type an answer
        </div>
        <p className="serif text-2xl leading-snug">
          Where did your take diverge most from what actually happened — and is that divergence a blind spot, or a real
          disagreement you'd defend?
        </p>
        <p className="text-sm mt-6" style={{ color: "#a8a29e" }}>
          The rep is the noticing. Close the tab and let it sit.
        </p>
      </div>

      <PostRepFooter kind="weekly" />
    </section>
  );
}
