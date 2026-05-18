"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/lib/auth";
import {
  supabase,
  supabaseEnabled,
  type DailyScenario,
  type WeeklyScenario,
  type ScenarioSource,
} from "@/lib/supabase";
import { dailySeed, weeklySeed } from "@/lib/seedScenarios";

type TakeRow = {
  id: string;
  scenario_id: string;
  scenario_type: "daily" | "weekly";
  body: Record<string, unknown>;
  created_at: string;
};

type AnyScenario = DailyScenario | WeeklyScenario;

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;

export default function RepDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { user, loading: authLoading } = useUser();
  const [take, setTake] = useState<TakeRow | null>(null);
  const [scenario, setScenario] = useState<AnyScenario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!id) return;
    if (!user || !supabaseEnabled || !supabase) return;

    let active = true;
    (async () => {
      const { data: takeData, error: takeErr } = await supabase!
        .from("takes")
        .select("id, scenario_id, scenario_type, body, created_at")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (takeErr) {
        if (active) {
          setError(takeErr.message);
          setDone(true);
        }
        return;
      }
      if (!takeData) {
        if (active) {
          setError("Not found.");
          setDone(true);
        }
        return;
      }

      const t = takeData as TakeRow;
      if (active) setTake(t);

      const { data: scenarioRow } = await supabase!
        .from("scenarios")
        .select("payload")
        .eq("id", t.scenario_id)
        .maybeSingle();

      let resolved: AnyScenario | null = null;
      if (scenarioRow?.payload) {
        resolved = scenarioRow.payload as AnyScenario;
      } else {
        const pool: AnyScenario[] =
          t.scenario_type === "daily" ? dailySeed : weeklySeed;
        resolved = pool.find((s) => s.id === t.scenario_id) ?? null;
      }
      if (active) {
        setScenario(resolved);
        setDone(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [id, user, authLoading]);

  return (
    <main className="dossier-shell mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-24">
      <nav className="mb-10 sm:mb-14">
        <Link
          href="/me"
          className="mono text-[0.7rem] inline-flex items-center gap-2 hover:text-ink transition-colors"
          style={{
            color: "var(--ink-mute)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <span aria-hidden>←</span> Return to file cabinet
        </Link>
      </nav>

      {!supabaseEnabled && (
        <p className="body-prose">Auth isn't configured.</p>
      )}
      {supabaseEnabled && authLoading && (
        <p className="mono text-xs" style={{ color: "var(--ink-mute)" }}>
          Pulling file…
        </p>
      )}
      {supabaseEnabled && !authLoading && !user && (
        <div className="card p-6">
          <div className="subhead text-lg mb-2">Sign in to see this rep.</div>
          <Link
            href={`/auth?next=/me/${id ?? ""}`}
            className="btn-accent rounded-full px-5 py-2.5 text-sm inline-flex items-center gap-2"
          >
            Sign in <span aria-hidden>→</span>
          </Link>
        </div>
      )}
      {supabaseEnabled && user && !done && (
        <p className="mono text-xs" style={{ color: "var(--ink-mute)" }}>
          Pulling file…
        </p>
      )}
      {supabaseEnabled && user && done && error && (
        <div className="card p-6">
          <div className="subhead text-lg mb-1">Couldn't load this rep.</div>
          <p className="body-prose">{error}</p>
        </div>
      )}
      {supabaseEnabled && user && done && !error && take && (
        <RepDossier take={take} scenario={scenario} />
      )}
    </main>
  );
}

function caseNumber(id: string): string {
  const hex = id.replace(/[^a-f0-9]/gi, "").toUpperCase();
  return hex.slice(0, 6) || "ARCHIV";
}

function formatFiledDate(iso: string): { day: string; time: string } {
  const d = new Date(iso);
  const day = d
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
  const time = d
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .toUpperCase();
  return { day, time };
}

function RepDossier({
  take,
  scenario,
}: {
  take: TakeRow;
  scenario: AnyScenario | null;
}) {
  const isWeekly = take.scenario_type === "weekly";
  const { day, time } = formatFiledDate(take.created_at);
  const caseId = caseNumber(take.id);
  const company = scenario?.company ?? take.scenario_id;
  const era = scenario?.era ?? "";

  return (
    <article className="reveal-stage dossier">
      {/* I. Masthead */}
      <header className="dossier-masthead">
        <span className="case-no">Nº {caseId}</span>
        <span className="dot" aria-hidden>·</span>
        <span>Filed {day}</span>
        <span className="dot" aria-hidden>·</span>
        <span>{time}</span>
        <span className={`kind ${isWeekly ? "is-weekly" : ""}`}>
          {isWeekly ? "Weekly review" : "Daily review"}
        </span>
      </header>

      {/* II. Display title */}
      <div className="dossier-title-block">
        <h1 className="dossier-title">{company}</h1>
        {era && <p className="dossier-era">{era}</p>}
        <p className="dossier-precis">
          A retrospective on a decision you took a stance on. Your read, on the
          record, alongside what actually happened.
        </p>
      </div>

      {scenario === null ? (
        <FallbackUnavailable take={take} />
      ) : isWeekly ? (
        <WeeklyDossier take={take} scenario={scenario as WeeklyScenario} />
      ) : (
        <DailyDossier take={take} scenario={scenario as DailyScenario} />
      )}
    </article>
  );
}

function SectionMarker({
  num,
  label,
}: {
  num: number;
  label: string;
}) {
  return (
    <div className="section-marker">
      <span className="roman">§ {ROMAN[num - 1]}</span>
      <span className="label">{label}</span>
    </div>
  );
}

function FallbackUnavailable({ take }: { take: TakeRow }) {
  return (
    <div>
      <SectionMarker num={1} label="Your take" />
      <p
        className="mono text-xs mb-5"
        style={{ color: "var(--ink-mute)", letterSpacing: "0.1em" }}
      >
        The original case file couldn't be retrieved. Your take is preserved.
      </p>
      <pre
        className="text-sm whitespace-pre-wrap"
        style={{ color: "var(--ink)" }}
      >
        {JSON.stringify(take.body, null, 2)}
      </pre>
    </div>
  );
}

/* ──────────────────────────── DAILY ──────────────────────────── */

function DailyDossier({
  take,
  scenario,
}: {
  take: TakeRow;
  scenario: DailyScenario;
}) {
  const note = (take.body.note as string | undefined) ?? "";
  const { day } = formatFiledDate(take.created_at);

  return (
    <>
      <SectionMarker num={1} label="The setup" />
      <div className="scenario-article">
        <p className="lede">{scenario.context}</p>
        <div className="prompt-callout">
          <span className="prompt-eyebrow">The prompt put to you</span>
          <p className="prompt-body">{scenario.prompt}</p>
        </div>
      </div>

      <SectionMarker num={2} label="Your read, on the record" />
      <div className="your-take-block">
        <p className="your-take-quote">
          {note ? `"${note}"` : (
            <em style={{ color: "var(--ink-mute)" }}>(left blank)</em>
          )}
        </p>
        <p className="your-take-attr">— You, {day}</p>
      </div>

      <SectionMarker num={3} label="What they actually said" />
      <div className="shipped-pull">
        <blockquote>"{scenario.reveal_quote}"</blockquote>
        <p className="attr">— {scenario.reveal_quote_attribution}</p>
      </div>
      <div className="reveal-note">
        <span className="reveal-note-eyebrow">The choice that's easy to miss</span>
        <p>{scenario.reveal_note}</p>
      </div>

      {scenario.sources && scenario.sources.length > 0 && (
        <Endnotes sources={scenario.sources} />
      )}
    </>
  );
}

/* ──────────────────────────── WEEKLY ──────────────────────────── */

const DIMENSION_LABELS: Record<
  "tradeoff" | "user" | "alt" | "predict",
  { question: string; short: string }
> = {
  tradeoff: {
    question: "What's the core tradeoff?",
    short: "The core tradeoff",
  },
  user: {
    question: "Who is the actual target user?",
    short: "The target user",
  },
  alt: {
    question: "What would you have done differently?",
    short: "The road not taken",
  },
  predict: {
    question: "What did you predict would happen?",
    short: "Your prediction",
  },
};

function WeeklyDossier({
  take,
  scenario,
}: {
  take: TakeRow;
  scenario: WeeklyScenario;
}) {
  const body = take.body as {
    tradeoff?: string;
    user?: string;
    alt?: string;
    predict?: string;
  };
  const { day } = formatFiledDate(take.created_at);
  const dims = ["tradeoff", "user", "alt", "predict"] as const;

  return (
    <>
      <SectionMarker num={1} label="The decision room" />
      <div className="scenario-article">
        {scenario.intro.split("\n\n").map((para, i) => (
          <p key={i} className={i === 0 ? "lede" : ""}>
            {para}
          </p>
        ))}
        {scenario.open_questions && scenario.open_questions.length > 0 && (
          <div className="open-q-table">
            <div className="open-q-head">
              Open questions on the table
            </div>
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

      <SectionMarker num={2} label="Your read, on the record" />
      <p
        className="mono text-[0.7rem] mb-4"
        style={{ color: "var(--ink-mute)", letterSpacing: "0.14em", textTransform: "uppercase" }}
      >
        Filed by You · {day}
      </p>
      <div className="dimension-manifest">
        {dims.map((k, i) => (
          <div key={k} className="dimension-take">
            <span className="num">{(i + 1).toString().padStart(2, "0")}</span>
            <div>
              <p className="field-label">{DIMENSION_LABELS[k].question}</p>
              <p className="take">
                {body[k] || (
                  <em style={{ color: "var(--ink-mute)" }}>(left blank)</em>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      <SectionMarker num={3} label="What actually shipped" />
      <p className="shipped-decision">{scenario.decision}</p>
      <div className="shipped-pull">
        <blockquote>"{scenario.pullquote}"</blockquote>
        <p className="attr">— {scenario.pullquote_attribution}</p>
      </div>
      <StatBand outcomes={scenario.outcomes} />

      {scenario.tradeoffs && scenario.tradeoffs.length > 0 && (
        <>
          <SectionMarker num={4} label="The interesting tradeoffs" />
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

      <SectionMarker num={5} label="Read against reality" />
      <div className="compare-set">
        {dims.map((k, i) => (
          <section key={k} className="compare-chapter">
            <h4>
              <span className="num">{ROMAN[i]}</span>
              <span className="title">{DIMENSION_LABELS[k].short}</span>
            </h4>
            <div className="compare-split">
              <div className="compare-col you">
                <div className="tag">You wrote</div>
                <p>
                  {body[k] || (
                    <em style={{ color: "var(--ink-mute)" }}>(left blank)</em>
                  )}
                </p>
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

      <Coda />

      {scenario.sources && scenario.sources.length > 0 && (
        <Endnotes sources={scenario.sources} />
      )}
    </>
  );
}

function StatBand({
  outcomes,
}: {
  outcomes: { stat: string; label: string; accent?: boolean }[];
}) {
  // Lay out in rows of 4 (or 2 on mobile via CSS)
  const rows: typeof outcomes[] = [];
  for (let i = 0; i < outcomes.length; i += 4) {
    rows.push(outcomes.slice(i, i + 4));
  }
  return (
    <div className="stat-band">
      {rows.map((row, rIdx) => (
        <div key={rIdx} className="stat-band-row">
          {row.map((o, i) => (
            <div key={i} className="stat-band-cell">
              <div className={`num ${o.accent ? "is-accent" : ""}`}>
                {o.stat}
              </div>
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

function Coda() {
  return (
    <aside className="coda">
      <div className="coda-eyebrow">A note for next time</div>
      <p className="coda-body">
        Where did your read diverge most from what actually happened — and is
        that gap a blind spot, or a real disagreement you'd defend? The rep is
        the noticing. Close the tab and let it sit.
      </p>
    </aside>
  );
}

function Endnotes({ sources }: { sources: ScenarioSource[] }) {
  return (
    <footer className="endnotes">
      <h4>Endnotes</h4>
      <ol>
        {sources.map((s, i) => (
          <li key={i}>
            <span>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noreferrer noopener">
                  {s.title}
                </a>
              ) : (
                s.title
              )}
              {s.publisher && (
                <span className="publisher"> — {s.publisher}</span>
              )}
              {s.year && (
                <span className="publisher">, {s.year}</span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </footer>
  );
}
