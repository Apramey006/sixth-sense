"use client";

import { useState } from "react";
import type { DailyScenario } from "@/lib/supabase";
import { submitTake } from "@/lib/submit";
import { markCompleted } from "@/lib/anonId";
import { PostRepFooter } from "@/components/PostRepFooter";

export function DailyRep({ scenario }: { scenario: DailyScenario }) {
  const [step, setStep] = useState<0 | 1>(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitAndReveal() {
    if (!text.trim()) {
      alert("Even a one-line take. The rep only works if you commit.");
      return;
    }
    setSubmitting(true);
    await submitTake({
      scenario_id: scenario.id,
      scenario_type: "daily",
      body: { note: text.trim() },
    });
    markCompleted("daily", scenario.scheduled_date);
    setSubmitting(false);
    setStep(1);
  }

  if (step === 0) {
    return (
      <section className="fade-up">
        <div className="flex items-center gap-2 mb-3">
          <span className="pill pill-accent">Today's moment</span>
          <span className="text-xs" style={{ color: "var(--ink-mute)" }}>
            {scenario.era}
          </span>
        </div>
        <h1 className="headline text-3xl sm:text-[2rem]">{scenario.company}</h1>
        <div className="rule mt-5 mb-5" />

        <p className="text-[0.95rem] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          {scenario.context}
        </p>

        <div className="mt-7 card p-5 accent-rail" style={{ borderRadius: 10 }}>
          <div className="eyebrow mb-2" style={{ color: "var(--accent)" }}>
            The prompt
          </div>
          <p
            className="text-lg leading-snug"
            style={{ fontWeight: 500, letterSpacing: "-0.005em" }}
          >
            {scenario.prompt}
          </p>
        </div>

        <div className="mt-6">
          <label className="eyebrow block mb-2">Your take</label>
          <textarea
            rows={4}
            className="w-full border rounded-lg px-3.5 py-2.5"
            style={{
              borderColor: "var(--rule)",
              background: "var(--paper-raised)",
            }}
            placeholder="e.g. Pricing AI separately tells me Notion thinks it's a power-user feature, not a default — they're choosing measurement over adoption."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="text-xs mt-1.5" style={{ color: "var(--ink-mute)" }}>
            One sentence is fine. Two is fine. Don't edit.
          </p>
        </div>

        <div className="mt-5 flex items-center gap-3 flex-wrap">
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
            Once you submit, you'll see what the team actually said. You can't un-see it.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="reveal-stage">
      <div className="card p-5">
        <div className="eyebrow mb-2" style={{ color: "var(--accent)" }}>
          Your note
        </div>
        <p
          className="text-[0.95rem] leading-relaxed whitespace-pre-wrap"
          style={{ color: "var(--ink)" }}
        >
          {text}
        </p>
      </div>

      <div className="mt-7">
        <div className="eyebrow mb-2">What they said</div>
        <blockquote className="pullquote">"{scenario.reveal_quote}"</blockquote>
        <div className="text-xs mt-2" style={{ color: "var(--ink-mute)" }}>
          — {scenario.reveal_quote_attribution}
        </div>
      </div>

      <div className="mt-7 drop-rule pt-6">
        <div className="eyebrow mb-2" style={{ color: "var(--accent-2)" }}>
          The choice that's easy to miss
        </div>
        <p className="text-[0.95rem] leading-relaxed" style={{ color: "var(--ink)" }}>
          {scenario.reveal_note}
        </p>
      </div>

      <div
        className="mt-9 rounded-xl p-6"
        style={{ background: "var(--ink)", color: "#e7e1d2" }}
      >
        <div className="eyebrow mb-2" style={{ color: "#b9aa92" }}>
          The rep is the noticing
        </div>
        <p className="text-[0.95rem] leading-relaxed">
          You don't need to type an answer to this. Sit with the gap between what you
          noticed and what they were thinking. Come back tomorrow.
        </p>
      </div>

      <PostRepFooter kind="daily" />
    </section>
  );
}
