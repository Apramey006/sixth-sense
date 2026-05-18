"use client";

import { useEffect, useState } from "react";
import type { WeeklyScenario } from "@/lib/supabase";
import { supabase, supabaseEnabled } from "@/lib/supabase";
import { submitTake } from "@/lib/submit";
import { isCompleted, markCompleted } from "@/lib/anonId";
import { useUser } from "@/lib/auth";
import { AlreadyDone } from "@/components/DailyRep";
import { PostRepFooter } from "@/components/PostRepFooter";

type Take = { tradeoff: string; user: string; alt: string; predict: string };

const FIELDS: {
  key: keyof Take;
  label: string;
  help: string;
  example: string;
}[] = [
  {
    key: "tradeoff",
    label: "What's the core tradeoff?",
    help: "What's the real tension this decision sits on top of?",
    example:
      "e.g. They're trading launch-week credibility for long-term retention — willing to look unfinished to ship inside a market window.",
  },
  {
    key: "user",
    label: "Who is the actual target user?",
    help: "Not 'everyone.' Who specifically — and who are they stealing time from?",
    example:
      "e.g. Existing IG users curious about text social, not the Twitter power-user cohort. Stealing time from passive scrolling, not from X.",
  },
  {
    key: "alt",
    label: "What would you do differently?",
    help: "Pick one real alternative path and commit to it.",
    example:
      "e.g. Decoupled launch with DMs from day one, slower S-curve but durable trust — accept losing the Twitter timing window.",
  },
  {
    key: "predict",
    label: "What do you predict will happen?",
    help: "Concrete prediction. Big launch then collapse? Slow burn? Why?",
    example:
      "e.g. Massive launch-week numbers, fast collapse to 20% of peak, then slow recovery on the back of patient feature work.",
  },
];

export function WeeklyRep({ scenario }: { scenario: WeeklyScenario }) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [take, setTake] = useState<Take>({ tradeoff: "", user: "", alt: "", predict: "" });
  const [submitting, setSubmitting] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const { user, loading: authLoading } = useUser();
  const [prior, setPrior] = useState<
    { id: string | null; note: string } | null | undefined
  >(undefined);

  const draftKey = `sixth-sense:weekly-draft:${scenario.id}`;

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    (async () => {
      if (supabaseEnabled && supabase && user) {
        const { data } = await supabase
          .from("takes")
          .select("id, body")
          .eq("scenario_id", scenario.id)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!active) return;
        if (data) {
          const body = data.body as Take;
          const first =
            (body.tradeoff || body.user || body.alt || body.predict || "").trim();
          setPrior({ id: data.id as string, note: first });
        } else if (isCompleted("weekly", scenario.iso_week)) {
          setPrior({ id: null, note: "" });
        } else {
          setPrior(null);
        }
      } else {
        if (!active) return;
        setPrior(
          isCompleted("weekly", scenario.iso_week)
            ? { id: null, note: "" }
            : null
        );
      }
    })();
    return () => {
      active = false;
    };
  }, [authLoading, user, scenario.id, scenario.iso_week]);

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
      alert("Write something for all four — even rough one-liners. The rep only works if you commit.");
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

  if (step === 0 && prior === undefined) {
    return (
      <section className="fade-up">
        <p
          className="mono text-xs"
          style={{ color: "var(--ink-mute)", letterSpacing: "0.16em" }}
        >
          Loading…
        </p>
      </section>
    );
  }

  if (step === 0 && prior) {
    return (
      <AlreadyDone
        kind="weekly"
        scenario={{ company: scenario.company, era: scenario.era }}
        prior={prior}
        nextHref="/today"
        nextLabel="Take today's daily rep"
      />
    );
  }

  if (step === 0) {
    return (
      <section className="fade-up">
        <Stepper active={1} />

        <div className="rep-header-eyebrow">
          <span className="line" aria-hidden />
          <span className="accent" style={{ color: "var(--accent-2)" }}>The decision room</span>
          <span>· Not yet decided</span>
        </div>
        <h1 className="rep-title">
          {scenario.company}, <em style={{ fontStyle: "italic", fontWeight: 700 }}>{scenario.era}.</em>
        </h1>

        <div className="scenario-article" style={{ marginTop: "2rem" }}>
          {scenario.intro.split("\n\n").map((para, i) => (
            <p key={i} className={i === 0 ? "lede" : ""}>
              {para}
            </p>
          ))}

          {scenario.open_questions && scenario.open_questions.length > 0 && (
            <div className="open-q-table">
              <div className="open-q-head">Open questions on the table</div>
              <ul>
                {scenario.open_questions.map((q, i) => (
                  <li key={i}>
                    <span className="num">Q{(i + 1).toString().padStart(2, "0")}</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="closing">{scenario.closing}</p>
        </div>

        <div className="afterview">
          <span className="afterview-eyebrow">After you submit, you'll see</span>
          <div className="afterview-grid">
            {[
              { t: "What shipped", b: "The actual decision and the public reasoning behind it." },
              { t: "Real outcomes", b: "Numbers from the months and years after — not predictions." },
              { t: "Your take vs. reality", b: "A side-by-side, dimension by dimension. The point of the rep." },
            ].map((c, i) => (
              <div key={i} className="afterview-cell">
                <div className="t">{c.t}</div>
                <p className="b">{c.b}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rep-action-row">
          <button onClick={() => setStep(1)} className="rep-submit">
            I've read it — write my take <span aria-hidden>→</span>
          </button>
          <p className="rep-action-hint">~25 minutes. No editing for a model. Your raw read.</p>
        </div>
      </section>
    );
  }

  if (step === 1) {
    return (
      <section className="fade-up">
        <Stepper active={2} />

        <div className="rep-header-eyebrow">
          <span className="line" aria-hidden />
          <span className="accent" style={{ color: "var(--accent-2)" }}>Your take, on the record</span>
        </div>
        <h2 className="rep-title" style={{ fontSize: "clamp(1.8rem, 4.5vw, 2.6rem)" }}>
          Write what you actually think.
        </h2>
        <p
          className="dossier-precis"
          style={{ marginTop: "0.85rem", maxWidth: "34rem" }}
        >
          No editing for a model, no looking things up. The point is your raw
          instinct, dimension by dimension.
        </p>

        {draftRestored && (
          <div className="draft-pill" style={{ marginTop: "1.5rem" }}>
            <span aria-hidden>↺</span> Draft restored from your last visit
          </div>
        )}

        <div style={{ marginTop: "2rem" }}>
          {FIELDS.map((f, i) => (
            <div key={f.key} className="field-chapter">
              <span className="field-chapter-num">{(i + 1).toString().padStart(2, "0")}</span>
              <div>
                <h3 className="field-chapter-label">{f.label}</h3>
                <p className="field-chapter-help">{f.help}</p>
                <textarea
                  rows={3}
                  className="rep-textarea"
                  placeholder={f.example}
                  value={take[f.key]}
                  onChange={(e) => setTake({ ...take, [f.key]: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rep-action-row">
          <button onClick={submitAndReveal} disabled={submitting} className="rep-submit">
            {submitting ? "Filing…" : (
              <>
                Submit and reveal <span aria-hidden>→</span>
              </>
            )}
          </button>
          <p className="rep-action-hint">Once you reveal, you can't un-see it. That's the point.</p>
        </div>
      </section>
    );
  }

  // Step 2: reveal
  return (
    <section className="reveal-stage">
      <Stepper active={3} />

      <div className="rep-header-eyebrow">
        <span className="line" aria-hidden />
        <span className="accent">Reveal</span>
        <span>· What shipped</span>
      </div>
      <h2 className="rep-title">{scenario.company}, <em style={{ fontStyle: "italic", fontWeight: 700 }}>{scenario.era}.</em></h2>

      <div className="section-marker" style={{ marginTop: "2.5rem" }}>
        <span className="roman">§ I</span>
        <span className="label">The decision they made</span>
      </div>
      <p className="shipped-decision">{scenario.decision}</p>
      <div className="shipped-pull">
        <blockquote>"{scenario.pullquote}"</blockquote>
        <p className="attr">— {scenario.pullquote_attribution}</p>
      </div>
      <StatBand outcomes={scenario.outcomes} />

      {scenario.tradeoffs && scenario.tradeoffs.length > 0 && (
        <>
          <div className="section-marker">
            <span className="roman">§ II</span>
            <span className="label">The interesting tradeoffs</span>
          </div>
          <ol className="tradeoff-run">
            {scenario.tradeoffs.map((t, i) => (
              <li key={i} className="tradeoff-item">
                <h4>{t.title}</h4>
                <p>{t.body}</p>
              </li>
            ))}
          </ol>
        </>
      )}

      <div className="section-marker">
        <span className="roman">§ III</span>
        <span className="label">Read against reality</span>
      </div>
      <div className="compare-set">
        {(["tradeoff", "user", "alt", "predict"] as const).map((k, i) => (
          <section key={k} className="compare-chapter">
            <h4>
              <span className="num">{["I", "II", "III", "IV"][i]}</span>
              <span className="title">{
                k === "tradeoff" ? "The core tradeoff" :
                k === "user" ? "The target user" :
                k === "alt" ? "The road not taken" :
                "Your prediction"
              }</span>
            </h4>
            <div className="compare-split">
              <div className="compare-col you">
                <div className="tag">You wrote</div>
                <p>{take[k] || <em style={{ color: "var(--ink-mute)" }}>(left blank)</em>}</p>
              </div>
              <div className="rule-col" aria-hidden />
              <div className="compare-col them">
                <div className="tag">What they did</div>
                <p>{scenario.per_dimension_truth[k]}</p>
              </div>
            </div>
          </section>
        ))}
      </div>

      <aside className="coda" style={{ marginTop: "3.5rem" }}>
        <div className="coda-eyebrow">A note for next time</div>
        <p className="coda-body">
          Where did your read diverge most from what actually happened — and is
          that gap a blind spot, or a real disagreement you'd defend? The rep
          is the noticing. Close the tab and let it sit.
        </p>
      </aside>

      <PostRepFooter kind="weekly" />
    </section>
  );
}

function Stepper({ active }: { active: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Scenario" },
    { n: 2, label: "Your take" },
    { n: 3, label: "Reveal" },
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

function StatBand({
  outcomes,
}: {
  outcomes: { stat: string; label: string; accent?: boolean }[];
}) {
  const rows: typeof outcomes[] = [];
  for (let i = 0; i < outcomes.length; i += 4) rows.push(outcomes.slice(i, i + 4));
  return (
    <div className="stat-band">
      {rows.map((row, rIdx) => (
        <div key={rIdx} className="stat-band-row">
          {row.map((o, i) => (
            <div key={i} className="stat-band-cell">
              <div className={`num ${o.accent ? "is-accent" : ""}`}>{o.stat}</div>
              <div className="label">{o.label}</div>
            </div>
          ))}
          {row.length < 4 &&
            Array.from({ length: 4 - row.length }).map((_, i) => (
              <div key={`pad-${i}`} className="stat-band-cell is-empty" aria-hidden />
            ))}
        </div>
      ))}
    </div>
  );
}
