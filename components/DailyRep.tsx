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
        <div className="chapter text-base mb-4" style={{ color: "var(--ink-soft)" }}>
          Today's moment
        </div>
        <h1 className="serif text-4xl leading-tight" style={{ fontWeight: 500, letterSpacing: "-0.015em" }}>
          {scenario.company}
        </h1>
        <div className="smallcaps mt-2" style={{ color: "var(--ink-soft)" }}>
          {scenario.era}
        </div>
        <div className="rule mt-7 mb-7" />

        <p className="serif text-lg leading-relaxed">{scenario.context}</p>

        <div className="mt-10 accent-rail pl-5 py-1">
          <div className="smallcaps mb-2" style={{ color: "var(--accent)" }}>
            The prompt
          </div>
          <p className="serif text-xl leading-snug">{scenario.prompt}</p>
        </div>

        <div className="mt-8">
          <textarea
            rows={5}
            className="w-full border rounded-md px-4 py-3"
            style={{ borderColor: "var(--rule)", background: "white" }}
            placeholder="e.g. Pricing AI separately tells me Notion thinks it's a power-user feature, not a default — they're choosing measurement over adoption."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="text-xs mt-2 italic" style={{ color: "var(--ink-soft)" }}>
            One sentence is fine. Two is fine. Don't edit.
          </p>
        </div>

        <button
          onClick={submitAndReveal}
          disabled={submitting}
          className="btn-primary mt-6 px-6 py-3 rounded-md font-medium disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit and reveal →"}
        </button>
        <p className="text-xs mt-3" style={{ color: "var(--ink-soft)" }}>
          Once you submit, you'll see what the team actually said. You can't un-see it.
        </p>
      </section>
    );
  }

  return (
    <section className="reveal-stage">
      <div>
        <div className="smallcaps mb-2" style={{ color: "var(--accent)" }}>
          Your note
        </div>
        <p className="serif text-lg leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>

      <div className="mt-10">
        <div className="smallcaps mb-2" style={{ color: "var(--ink-soft)" }}>
          What they said
        </div>
        <blockquote className="pullquote">"{scenario.reveal_quote}"</blockquote>
        <div className="smallcaps mt-3" style={{ color: "var(--ink-soft)" }}>
          — {scenario.reveal_quote_attribution}
        </div>
      </div>

      <div className="mt-10 drop-rule pt-8">
        <div className="smallcaps mb-2" style={{ color: "var(--accent)" }}>
          The choice that's easy to miss
        </div>
        <p className="serif text-lg leading-relaxed">{scenario.reveal_note}</p>
      </div>

      <div className="mt-12 rounded-md p-8" style={{ background: "var(--ink)", color: "#e7e5e4" }}>
        <div className="smallcaps mb-2" style={{ color: "#a8a29e" }}>
          The rep is the noticing
        </div>
        <p className="serif text-lg leading-relaxed">
          You don't need to type an answer to this. Sit with the gap between what you noticed and what they were
          thinking. Come back tomorrow.
        </p>
      </div>

      <PostRepFooter kind="daily" />
    </section>
  );
}
