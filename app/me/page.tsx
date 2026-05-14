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
type SortOrder = "newest" | "oldest" | "company";

export default function MePage() {
  const { user, loading } = useUser();
  const [takes, setTakes] = useState<EnrichedTake[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<KindFilter>("all");
  const [sort, setSort] = useState<SortOrder>("newest");

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
    const filtered =
      filter === "all" ? takes : takes.filter((t) => t.scenario_type === filter);
    const sorted = [...filtered];
    if (sort === "newest") {
      sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    } else if (sort === "oldest") {
      sorted.sort((a, b) => a.created_at.localeCompare(b.created_at));
    } else {
      sorted.sort((a, b) => {
        const ca = a.scenario?.company ?? a.scenario_id;
        const cb = b.scenario?.company ?? b.scenario_id;
        return ca.localeCompare(cb);
      });
    }
    return sorted;
  }, [takes, filter, sort]);

  return (
    <main className="max-w-4xl mx-auto px-5 sm:px-6 pt-14 sm:pt-20 pb-24">
      <header className="mb-10">
        <h1 className="display text-[2.5rem] sm:text-[3.5rem]">Your reps.</h1>
        <p className="body-prose mt-4 max-w-2xl">
          Every rep you've taken, with what you wrote and what you saw.
        </p>
      </header>

      {!supabaseEnabled && <NotConfigured />}
      {supabaseEnabled && loading && <Loading />}
      {supabaseEnabled && !loading && !user && <NeedsSignIn />}
      {supabaseEnabled && user && error && <ErrorState message={error} />}
      {supabaseEnabled && user && !error && takes === null && <Loading />}
      {supabaseEnabled && user && takes !== null && takes.length === 0 && <Empty />}
      {supabaseEnabled && user && visibleTakes && takes && takes.length > 0 && summary && (
        <>
          <SummaryBar summary={summary} />
          <Controls filter={filter} setFilter={setFilter} sort={sort} setSort={setSort} takes={takes} />
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

function SummaryBar({ summary }: { summary: { thisWeek: number; lastWeek: number; total: number } }) {
  const { thisWeek, lastWeek, total } = summary;
  return (
    <div
      className="rounded-md border px-5 py-4 mb-6 flex items-center justify-between gap-4 flex-wrap"
      style={{ borderColor: "var(--rule)", background: "var(--paper-raised)" }}
    >
      <div>
        <div className="text-sm" style={{ color: "var(--ink)" }}>
          <span style={{ fontWeight: 600 }}>{thisWeek}</span>{" "}
          {thisWeek === 1 ? "rep" : "reps"} this week
        </div>
        <div className="text-xs mt-0.5" style={{ color: "var(--ink-mute)" }}>
          Last week: {lastWeek}  ·  Total: {total}
        </div>
      </div>
      <Link
        href="/today"
        className="btn-accent rounded-full px-4 py-2 text-xs inline-flex items-center gap-1.5"
      >
        Take today's rep <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

function Controls({
  filter,
  setFilter,
  sort,
  setSort,
  takes,
}: {
  filter: KindFilter;
  setFilter: (f: KindFilter) => void;
  sort: SortOrder;
  setSort: (s: SortOrder) => void;
  takes: EnrichedTake[];
}) {
  const dailyCount = takes.filter((t) => t.scenario_type === "daily").length;
  const weeklyCount = takes.filter((t) => t.scenario_type === "weekly").length;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div className="flex flex-wrap items-center gap-2">
        <Chip label={`All (${takes.length})`} active={filter === "all"} onClick={() => setFilter("all")} />
        <Chip label={`Daily (${dailyCount})`} active={filter === "daily"} onClick={() => setFilter("daily")} />
        <Chip label={`Weekly (${weeklyCount})`} active={filter === "weekly"} onClick={() => setFilter("weekly")} />
      </div>
      <label className="text-xs flex items-center gap-2" style={{ color: "var(--ink-mute)" }}>
        Sort:
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOrder)}
          className="text-xs border rounded-md px-2 py-1"
          style={{ borderColor: "var(--rule)", background: "var(--paper)" }}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="company">By company</option>
        </select>
      </label>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="smallcaps px-3 py-1.5 rounded-full border transition text-xs"
      style={{
        borderColor: active ? "var(--ink)" : "var(--rule)",
        background: active ? "var(--ink)" : "transparent",
        color: active ? "#fafaf9" : "var(--ink-soft)",
      }}
    >
      {label}
    </button>
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
    <div className="card p-6">
      <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
        No {filter === "all" ? "" : filter + " "}reps match this filter yet.
      </p>
    </div>
  );
}

function TakesList({ takes }: { takes: EnrichedTake[] }) {
  return (
    <div className="space-y-4">
      {takes.map((t) => (
        <TakeCard key={t.id} take={t} />
      ))}
    </div>
  );
}

function TakeCard({ take }: { take: EnrichedTake }) {
  const dateStr = new Date(take.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const isWeekly = take.scenario_type === "weekly";
  const company = take.scenario?.company ?? take.scenario_id;
  const era = take.scenario?.era ?? "";

  return (
    <article className="card p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`pill ${isWeekly ? "pill-accent-2" : "pill-accent"}`}>
            {isWeekly ? "Weekly" : "Daily"}
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
    </article>
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
    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
      {fields.map(({ key }) => (
        <div key={key as string}>
          <div className="eyebrow mb-1.5">{labels[key]}</div>
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
