"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/auth";
import { supabase, supabaseEnabled } from "@/lib/supabase";
import { startOfWeek } from "@/lib/dates";

type TakeRow = {
  id: string;
  scenario_id: string;
  scenario_type: "daily" | "weekly";
  body: Record<string, unknown>;
  created_at: string;
};

type ScenarioMeta = {
  id: string;
  type: "daily" | "weekly";
  company: string;
  era: string;
};

type EnrichedTake = TakeRow & { scenario: ScenarioMeta | null };

type KindFilter = "all" | "daily" | "weekly";

export default function MePage() {
  const { user, loading } = useUser();
  const [takes, setTakes] = useState<EnrichedTake[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<KindFilter>("all");

  useEffect(() => {
    if (loading) return;
    if (!user || !supabaseEnabled || !supabase) return;

    let active = true;
    (async () => {
      const { data: takesData, error: takesErr } = await supabase!
        .from("takes")
        .select("id, scenario_id, scenario_type, body, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (takesErr) {
        if (active) setError(takesErr.message);
        return;
      }
      const rows = (takesData ?? []) as TakeRow[];

      const ids = Array.from(new Set(rows.map((r) => r.scenario_id)));
      const metas: Record<string, ScenarioMeta> = {};
      if (ids.length > 0) {
        const { data: scenarioData } = await supabase!
          .from("scenarios")
          .select("id, type, payload")
          .in("id", ids);
        for (const s of scenarioData ?? []) {
          const payload = s.payload as { company?: string; era?: string };
          metas[s.id] = {
            id: s.id,
            type: s.type,
            company: payload.company ?? s.id,
            era: payload.era ?? "",
          };
        }
      }

      const enriched: EnrichedTake[] = rows.map((r) => ({
        ...r,
        scenario: metas[r.scenario_id] ?? null,
      }));

      if (active) setTakes(enriched);
    })();

    return () => {
      active = false;
    };
  }, [user, loading]);

  const summary = useMemo(() => {
    if (!takes) return null;
    const now = new Date();
    const weekStart = startOfWeek(now).getTime();
    const lastWeekStart = weekStart - 7 * 86_400_000;
    let thisWeek = 0;
    let lastWeek = 0;
    for (const t of takes) {
      const at = new Date(t.created_at).getTime();
      if (at >= weekStart) thisWeek += 1;
      else if (at >= lastWeekStart) lastWeek += 1;
    }
    return { thisWeek, lastWeek, total: takes.length };
  }, [takes]);

  const visibleTakes = useMemo(() => {
    if (!takes) return null;
    return filter === "all" ? takes : takes.filter((t) => t.scenario_type === filter);
  }, [takes, filter]);

  const counts = useMemo(() => {
    if (!takes) return { all: 0, daily: 0, weekly: 0 };
    return {
      all: takes.length,
      daily: takes.filter((t) => t.scenario_type === "daily").length,
      weekly: takes.filter((t) => t.scenario_type === "weekly").length,
    };
  }, [takes]);

  return (
    <main className="max-w-4xl mx-auto px-5 sm:px-6 pt-14 sm:pt-20 pb-24">
      <header className="mb-10">
        <h1 className="display text-[2.5rem] sm:text-[3.5rem]">Your reps.</h1>
        <p className="body-prose mt-4 max-w-2xl">
          Every rep you've taken, with what you wrote and what you saw.
        </p>
        {summary && (
          <p
            className="mono text-xs mt-5"
            style={{ color: "var(--ink-mute)", letterSpacing: "0.06em" }}
          >
            {summary.thisWeek} THIS WEEK · {summary.lastWeek} LAST WEEK ·{" "}
            {summary.total} TOTAL
          </p>
        )}
      </header>

      {!supabaseEnabled && <NotConfigured />}
      {supabaseEnabled && loading && <Loading />}
      {supabaseEnabled && !loading && !user && <NeedsSignIn />}
      {supabaseEnabled && user && error && <ErrorState message={error} />}
      {supabaseEnabled && user && !error && takes === null && <Loading />}
      {supabaseEnabled && user && takes !== null && takes.length === 0 && <Empty />}
      {supabaseEnabled && user && visibleTakes && takes && takes.length > 0 && (
        <>
          <Tabs filter={filter} setFilter={setFilter} counts={counts} />
          {visibleTakes.length === 0 ? (
            <FilteredEmpty filter={filter} />
          ) : (
            <TakesList takes={visibleTakes} />
          )}
        </>
      )}
    </main>
  );
}

function Tabs({
  filter,
  setFilter,
  counts,
}: {
  filter: KindFilter;
  setFilter: (f: KindFilter) => void;
  counts: { all: number; daily: number; weekly: number };
}) {
  const items: { key: KindFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "daily", label: "Daily" },
    { key: "weekly", label: "Weekly" },
  ];
  return (
    <div
      className="flex items-center gap-6 mb-2 border-b"
      style={{ borderColor: "var(--rule)" }}
      role="tablist"
    >
      {items.map((it) => {
        const active = filter === it.key;
        return (
          <button
            key={it.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setFilter(it.key)}
            className="relative pb-3 text-sm transition-colors"
            style={{
              color: active ? "var(--ink)" : "var(--ink-soft)",
              fontWeight: active ? 600 : 500,
            }}
          >
            <span>{it.label}</span>
            <span
              className="mono text-xs ml-1.5"
              style={{ color: "var(--ink-mute)" }}
            >
              {counts[it.key]}
            </span>
            <span
              aria-hidden
              className="absolute left-0 right-0 -bottom-px h-[2px]"
              style={{
                background: "var(--accent)",
                transform: active ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "left center",
                transition: "transform 0.25s cubic-bezier(0.2, 0.6, 0.2, 1)",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="card p-6">
      <div className="subhead text-lg mb-1">Auth isn't configured.</div>
      <p className="body-prose">
        Add Supabase credentials to <code className="mono">.env.local</code> to
        use this page.
      </p>
    </div>
  );
}

function Loading() {
  return (
    <div className="mono text-sm" style={{ color: "var(--ink-mute)" }}>
      Loading…
    </div>
  );
}

function NeedsSignIn() {
  return (
    <div className="card p-7 sm:p-8">
      <div className="subhead text-xl sm:text-2xl mb-2">
        Sign in to see your reps.
      </div>
      <p className="body-prose mb-6 max-w-xl">
        Once you sign in, anything you've written on this device gets linked to
        your account, so you can read your past takes from anywhere.
      </p>
      <Link
        href="/auth?next=/me"
        className="btn-accent rounded-full px-5 py-2.5 text-sm inline-flex items-center gap-2"
      >
        Sign in <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="card p-6">
      <div className="subhead text-lg mb-1">Couldn't load your reps.</div>
      <p className="body-prose">{message}</p>
    </div>
  );
}

function Empty() {
  return (
    <div className="card p-8 text-center">
      <div className="subhead text-xl mb-2">No reps yet.</div>
      <p className="body-prose mb-6">
        Start with today's daily — three minutes.
      </p>
      <Link
        href="/today"
        className="btn-accent rounded-full px-5 py-2.5 text-sm inline-flex items-center gap-2"
      >
        Take today's rep <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

function FilteredEmpty({ filter }: { filter: KindFilter }) {
  return (
    <p
      className="text-sm mt-8"
      style={{ color: "var(--ink-mute)" }}
    >
      No {filter === "all" ? "" : filter + " "}reps yet.
    </p>
  );
}

function TakesList({ takes }: { takes: EnrichedTake[] }) {
  return (
    <ul className="divide-y" style={{ borderColor: "var(--rule)" }}>
      {takes.map((t) => (
        <TakeRow key={t.id} take={t} />
      ))}
    </ul>
  );
}

function TakeRow({ take }: { take: EnrichedTake }) {
  const dateStr = new Date(take.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const isWeekly = take.scenario_type === "weekly";
  const kindLabel = isWeekly ? "WEEKLY" : "DAILY";
  const kindColor = isWeekly ? "var(--accent-2)" : "var(--accent)";
  const company = take.scenario?.company ?? take.scenario_id;
  const era = take.scenario?.era ?? "";

  return (
    <li
      className="py-7 first:pt-5"
      style={{ borderColor: "var(--rule)" }}
    >
      <div className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span
            className="mono text-xs"
            style={{ color: kindColor, letterSpacing: "0.14em" }}
          >
            {kindLabel}
          </span>
          <div className="font-semibold tracking-tight">{company}</div>
          {era && (
            <span className="mono text-xs" style={{ color: "var(--ink-mute)" }}>
              {era}
            </span>
          )}
        </div>
        <span className="mono text-xs" style={{ color: "var(--ink-mute)" }}>
          {dateStr}
        </span>
      </div>

      {isWeekly ? <WeeklyBody body={take.body} /> : <DailyBody body={take.body} />}
    </li>
  );
}

function DailyBody({ body }: { body: Record<string, unknown> }) {
  const note = (body.note as string | undefined) ?? "";
  return (
    <p
      className="text-sm leading-relaxed whitespace-pre-wrap"
      style={{ color: "var(--ink-soft)" }}
    >
      {note || <em style={{ color: "var(--ink-mute)" }}>(empty)</em>}
    </p>
  );
}

function WeeklyBody({ body }: { body: Record<string, unknown> }) {
  const fields: { key: keyof typeof labels }[] = [
    { key: "tradeoff" },
    { key: "user" },
    { key: "alt" },
    { key: "predict" },
  ];
  return (
    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
      {fields.map(({ key }) => (
        <div key={key as string}>
          <div
            className="mono text-xs mb-1.5"
            style={{
              color: "var(--ink-mute)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {labels[key]}
          </div>
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: "var(--ink-soft)" }}
          >
            {(body[key as string] as string) || (
              <em style={{ color: "var(--ink-mute)" }}>(empty)</em>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}

const labels = {
  tradeoff: "Tradeoff",
  user: "Target user",
  alt: "Alternative",
  predict: "Prediction",
} as const;
