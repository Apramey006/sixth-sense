"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/lib/auth";
import { supabase, supabaseEnabled, type DailyScenario, type WeeklyScenario } from "@/lib/supabase";
import { dailySeed, weeklySeed } from "@/lib/seedScenarios";

type TakeRow = {
  id: string;
  scenario_id: string;
  scenario_type: "daily" | "weekly";
  body: Record<string, unknown>;
  created_at: string;
};

type AnyScenario = DailyScenario | WeeklyScenario;

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
    <main className="max-w-3xl mx-auto px-5 sm:px-6 pt-10 sm:pt-14 pb-24">
      <div className="mb-8">
        <Link
          href="/me"
          className="mono text-xs inline-flex items-center gap-1.5"
          style={{ color: "var(--ink-mute)", letterSpacing: "0.08em" }}
        >
          <span aria-hidden>←</span> ALL REPS
        </Link>
      </div>

      {!supabaseEnabled && (
        <p className="body-prose">Auth isn't configured.</p>
      )}
      {supabaseEnabled && authLoading && <p className="mono text-sm" style={{ color: "var(--ink-mute)" }}>Loading…</p>}
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
        <p className="mono text-sm" style={{ color: "var(--ink-mute)" }}>Loading…</p>
      )}
      {supabaseEnabled && user && done && error && (
        <div className="card p-6">
          <div className="subhead text-lg mb-1">Couldn't load this rep.</div>
          <p className="body-prose">{error}</p>
        </div>
      )}
      {supabaseEnabled && user && done && !error && take && (
        <RepReview take={take} scenario={scenario} />
      )}
    </main>
  );
}

function RepReview({
  take,
  scenario,
}: {
  take: TakeRow;
  scenario: AnyScenario | null;
}) {
  const isWeekly = take.scenario_type === "weekly";
  const tone = isWeekly ? "var(--accent-2)" : "var(--accent)";
  const kindLabel = isWeekly ? "Weekly" : "Daily";
  const dateStr = new Date(take.created_at).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <section className="fade-up">
      <header className="mb-9">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`pill ${isWeekly ? "pill-accent-2" : "pill-accent"}`}
          >
            {kindLabel} rep
          </span>
          <span className="text-xs" style={{ color: "var(--ink-mute)" }}>
            {dateStr}
          </span>
        </div>
        <h1 className="display text-[2rem] sm:text-[2.5rem]">
          {scenario?.company ?? take.scenario_id}
        </h1>
        {scenario?.era && (
          <p
            className="mono text-xs mt-2"
            style={{ color: "var(--ink-mute)", letterSpacing: "0.06em" }}
          >
            {scenario.era.toUpperCase()}
          </p>
        )}
        <p className="text-sm mt-4 max-w-2xl" style={{ color: "var(--ink-soft)" }}>
          A read-only review. The original prompt, the take you wrote, and what actually happened.
        </p>
      </header>

      {scenario === null ? (
        <div className="card p-6">
          <div className="subhead text-lg mb-1">Scenario unavailable.</div>
          <p className="body-prose">
            The original scenario for this rep couldn't be loaded. Your take is still preserved below.
          </p>
          <div className="mt-6">
            <YourTake take={take} />
          </div>
        </div>
      ) : isWeekly ? (
        <WeeklyReview take={take} scenario={scenario as WeeklyScenario} />
      ) : (
        <DailyReview take={take} scenario={scenario as DailyScenario} />
      )}
    </section>
  );
}

function YourTake({ take }: { take: TakeRow }) {
  if (take.scenario_type === "daily") {
    const note = (take.body.note as string | undefined) ?? "";
    return (
      <div className="card p-5">
        <div className="eyebrow mb-2" style={{ color: "var(--accent)" }}>
          Your take
        </div>
        <p
          className="text-[0.95rem] leading-relaxed whitespace-pre-wrap"
          style={{ color: "var(--ink)" }}
        >
          {note || <em style={{ color: "var(--ink-mute)" }}>(empty)</em>}
        </p>
      </div>
    );
  }
  return null;
}

function DailyReview({
  take,
  scenario,
}: {
  take: TakeRow;
  scenario: DailyScenario;
}) {
  const note = (take.body.note as string | undefined) ?? "";
  return (
    <div>
      <article className="card p-6">
        <div className="eyebrow mb-2" style={{ color: "var(--accent)" }}>
          The setup
        </div>
        <p
          className="text-[0.95rem] leading-relaxed"
          style={{ color: "var(--ink-soft)" }}
        >
          {scenario.context}
        </p>
        <div className="mt-6 accent-rail pl-4">
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
      </article>

      <div className="mt-8 card p-5">
        <div className="eyebrow mb-2" style={{ color: "var(--accent)" }}>
          What you wrote
        </div>
        <p
          className="text-[0.95rem] leading-relaxed whitespace-pre-wrap"
          style={{ color: "var(--ink)" }}
        >
          {note || <em style={{ color: "var(--ink-mute)" }}>(empty)</em>}
        </p>
      </div>

      <div className="mt-8">
        <div className="eyebrow mb-2">What they said</div>
        <blockquote className="pullquote">"{scenario.reveal_quote}"</blockquote>
        <div className="text-xs mt-2" style={{ color: "var(--ink-mute)" }}>
          — {scenario.reveal_quote_attribution}
        </div>
      </div>

      <div className="mt-8 drop-rule pt-6">
        <div className="eyebrow mb-2" style={{ color: "var(--accent-2)" }}>
          The choice that's easy to miss
        </div>
        <p
          className="text-[0.95rem] leading-relaxed"
          style={{ color: "var(--ink)" }}
        >
          {scenario.reveal_note}
        </p>
      </div>

      {scenario.sources && scenario.sources.length > 0 && (
        <SourcesList sources={scenario.sources} />
      )}
    </div>
  );
}

function WeeklyReview({
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

  return (
    <div>
      <article
        className="scenario card p-6 sm:p-7"
        style={{ fontSize: "1rem", lineHeight: 1.65 }}
      >
        <div className="eyebrow mb-2" style={{ color: "var(--accent-2)" }}>
          The decision room
        </div>
        <h2
          className="text-2xl sm:text-[1.625rem] mb-5"
          style={{ fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.2 }}
        >
          {scenario.company}, {scenario.era}.
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

      <div className="mt-10">
        <div className="eyebrow mb-2" style={{ color: "var(--accent)" }}>
          What shipped
        </div>
        <p
          className="text-[0.95rem] leading-relaxed"
          style={{ color: "var(--ink)" }}
        >
          {scenario.decision}
        </p>
      </div>

      <div className="mt-8 card p-5 accent-rail">
        <blockquote className="pullquote">"{scenario.pullquote}"</blockquote>
        <div className="text-xs mt-2" style={{ color: "var(--ink-mute)" }}>
          — {scenario.pullquote_attribution}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {scenario.outcomes.map((o, i) => (
          <div key={i} className="card p-4">
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
                    {body[key] || (
                      <em style={{ color: "var(--ink-mute)" }}>(empty)</em>
                    )}
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

      {scenario.sources && scenario.sources.length > 0 && (
        <SourcesList sources={scenario.sources} />
      )}
    </div>
  );
}

function SourcesList({
  sources,
}: {
  sources: { title: string; url?: string; publisher?: string }[];
}) {
  return (
    <div className="mt-12 drop-rule pt-6">
      <div
        className="mono text-xs mb-3"
        style={{ color: "var(--ink-mute)", letterSpacing: "0.12em" }}
      >
        SOURCES
      </div>
      <ul className="space-y-1.5 text-sm">
        {sources.map((s, i) => (
          <li key={i} style={{ color: "var(--ink-soft)" }}>
            {s.url ? (
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer noopener"
                className="underline"
                style={{ color: "var(--ink)" }}
              >
                {s.title}
              </a>
            ) : (
              <span style={{ color: "var(--ink)" }}>{s.title}</span>
            )}
            {s.publisher && (
              <span style={{ color: "var(--ink-mute)" }}> — {s.publisher}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
