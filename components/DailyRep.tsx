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
        <Stepper active={1} />

        <div className="rep-header-eyebrow">
          <span className="line" aria-hidden />
          <span className="accent">Today's moment</span>
          <span>· {scenario.era}</span>
        </div>
        <h1 className="rep-title">{scenario.company}</h1>

        <div className="scenario-article" style={{ marginTop: "1.75rem" }}>
          <p className="lede">{scenario.context}</p>
        </div>

        <div className="rep-prompt-block">
          <span className="rep-prompt-eyebrow">The prompt</span>
          <p className="rep-prompt-text">{scenario.prompt}</p>
        </div>

        <div className="rep-write-block">
          <label htmlFor="daily-take" className="rep-write-label">Your take, on the record</label>
          <textarea
            id="daily-take"
            rows={4}
            className="rep-textarea"
            placeholder="e.g. Pricing AI separately tells me Notion thinks it's a power-user feature, not a default — they're choosing measurement over adoption."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="rep-write-hint">One sentence is fine · Don't edit · Don't look it up</p>
        </div>

        <div className="rep-action-row">
          <button
            onClick={submitAndReveal}
            disabled={submitting}
            className="rep-submit"
          >
            {submitting ? "Filing…" : (
              <>
                Submit and reveal <span aria-hidden>→</span>
              </>
            )}
          </button>
          <p className="rep-action-hint">
            Once you reveal, you can't un-see it. That's the point.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="reveal-stage">
      <Stepper active={2} />

      <div className="rep-header-eyebrow">
        <span className="line" aria-hidden />
        <span className="accent">Reveal</span>
        <span>· {scenario.era}</span>
      </div>
      <h1 className="rep-title">{scenario.company}</h1>

      <div className="section-marker" style={{ marginTop: "2.5rem" }}>
        <span className="roman">§ I</span>
        <span className="label">Your read, on the record</span>
      </div>
      <div className="your-take-block">
        <p className="your-take-quote">"{text}"</p>
        <p className="your-take-attr">— You, just now</p>
      </div>

      <div className="section-marker">
        <span className="roman">§ II</span>
        <span className="label">What they actually said</span>
      </div>
      <div className="shipped-pull">
        <blockquote>"{scenario.reveal_quote}"</blockquote>
        <p className="attr">— {scenario.reveal_quote_attribution}</p>
      </div>

      <div className="section-marker">
        <span className="roman">§ III</span>
        <span className="label">The choice that's easy to miss</span>
      </div>
      <div className="reveal-note">
        <p>{scenario.reveal_note}</p>
      </div>

      <aside className="coda" style={{ marginTop: "3rem" }}>
        <div className="coda-eyebrow">The rep is the noticing</div>
        <p className="coda-body">
          You don't need to type an answer to this. Sit with the gap between
          what you noticed and what they were thinking. Come back tomorrow.
        </p>
      </aside>

      <PostRepFooter kind="daily" />
    </section>
  );
}

function Stepper({ active }: { active: 1 | 2 }) {
  const steps = [
    { n: 1, label: "Read & write" },
    { n: 2, label: "Reveal" },
  ];
  return (
    <div className="rep-stepper">
      {steps.map((s, i) => {
        const state =
          s.n === active ? "is-active" : s.n < active ? "is-done" : "";
        return (
          <span key={s.n} style={{ display: "inline-flex", alignItems: "center" }}>
            <span className={`step ${state}`}>
              <span className="num">{s.n}</span>
              <span>{s.label}</span>
            </span>
            {i < steps.length - 1 && <span className="sep" aria-hidden />}
          </span>
        );
      })}
    </div>
  );
}
