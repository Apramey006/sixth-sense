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
    <main className="cabinet-shell mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-24">
      {/* Strip masthead */}
      <header className="cabinet-strip">
        <span className="cabinet-strip-label">The file cabinet</span>
        {summary && (
          <>
            <span className="dot" aria-hidden>·</span>
            <span>{summary.thisWeek} this week</span>
            <span className="dot" aria-hidden>·</span>
            <span>{summary.lastWeek} last week</span>
            <span className="dot" aria-hidden>·</span>
            <span>{summary.total} total</span>
          </>
        )}
        <span className="dateline">Every rep, with what you wrote and what you saw</span>
      </header>

      <section className="cabinet-hero">
        <h1 className="cabinet-title">Your reps.</h1>
        <p className="cabinet-deck">
          A file cabinet of every rep you've taken. Open any one to compare
          your read against what actually happened.
        </p>
      </section>

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
    <div className="cabinet-tabs" role="tablist">
      {items.map((it) => {
        const active = filter === it.key;
        return (
          <button
            key={it.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setFilter(it.key)}
            className="cabinet-tab"
            data-active={active}
          >
            <span>{it.label}</span>
            <span className="cabinet-tab-count">{counts[it.key]}</span>
          </button>
        );
      })}
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="cabinet-note">
      <div className="cabinet-note-head">Auth isn't configured.</div>
      <p>
        Add Supabase credentials to <code className="mono">.env.local</code> to use this page.
      </p>
    </div>
  );
}

function Loading() {
  return (
    <p className="mono text-xs" style={{ color: "var(--ink-mute)", letterSpacing: "0.16em" }}>
      Pulling files…
    </p>
  );
}

function NeedsSignIn() {
  return (
    <div className="cabinet-note">
      <div className="cabinet-note-head">Sign in to see your reps.</div>
      <p>
        Once you sign in, anything you've written on this device gets linked to
        your account, so you can read your past takes from anywhere.
      </p>
      <Link href="/auth?next=/me" className="rep-submit" style={{ marginTop: "1.25rem" }}>
        Sign in <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="cabinet-note">
      <div className="cabinet-note-head">Couldn't load your reps.</div>
      <p>{message}</p>
    </div>
  );
}

function Empty() {
  return (
    <div className="cabinet-note">
      <div className="cabinet-note-head">No files yet.</div>
      <p>Start with today's daily — three minutes.</p>
      <Link href="/today" className="rep-submit" style={{ marginTop: "1.25rem" }}>
        Take today's rep <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

function FilteredEmpty({ filter }: { filter: KindFilter }) {
  return (
    <p className="mono text-xs" style={{ color: "var(--ink-mute)", marginTop: "1.5rem", letterSpacing: "0.14em" }}>
      No {filter === "all" ? "" : filter + " "}reps yet.
    </p>
  );
}

function groupByDate(takes: EnrichedTake[]) {
  const today = new Date();
  const todayKey = today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = yesterday.toDateString();

  const groups: { key: string; label: string; takes: EnrichedTake[] }[] = [];
  for (const t of takes) {
    const d = new Date(t.created_at);
    const key = d.toDateString();
    let label: string;
    if (key === todayKey) label = "Today";
    else if (key === yesterdayKey) label = "Yesterday";
    else {
      label = d
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: d.getFullYear() === today.getFullYear() ? undefined : "numeric",
        })
        .toUpperCase();
    }
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.takes.push(t);
    else groups.push({ key, label, takes: [t] });
  }
  return groups;
}

function TakesList({ takes }: { takes: EnrichedTake[] }) {
  const groups = useMemo(() => groupByDate(takes), [takes]);
  return (
    <div className="cabinet-list">
      {groups.map((g) => (
        <section key={g.key} className="cabinet-group">
          <div className="cabinet-group-head">
            <h2>{g.label}</h2>
            <span>{g.takes.length} {g.takes.length === 1 ? "file" : "files"}</span>
          </div>
          <ul className="cabinet-rows">
            {g.takes.map((t) => (
              <TakeRow key={t.id} take={t} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function caseNumber(id: string): string {
  const hex = id.replace(/[^a-f0-9]/gi, "").toUpperCase();
  return hex.slice(0, 6) || "ARCHIV";
}

function TakeRow({ take }: { take: EnrichedTake }) {
  const time = new Date(take.created_at).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const isWeekly = take.scenario_type === "weekly";
  const kindLabel = isWeekly ? "Weekly" : "Daily";
  const company = take.scenario?.company ?? take.scenario_id;
  const era = take.scenario?.era ?? "";
  const caseId = caseNumber(take.id);

  // Snippet of body for preview row
  const body = take.body as Record<string, string | undefined>;
  const snippet = isWeekly
    ? (body.tradeoff || body.user || body.alt || body.predict || "").trim()
    : (body.note || "").trim();
  const snippetDisplay =
    snippet.length > 140 ? snippet.slice(0, 140).trimEnd() + "…" : snippet;

  return (
    <li className="cabinet-row">
      <Link
        href={`/me/${take.id}`}
        aria-label={`Review ${kindLabel} rep — ${company}`}
        className="cabinet-row-link"
      >
        <span className="cabinet-row-case">Nº {caseId}</span>
        <div className="cabinet-row-meta">
          <span className={`kind-tag ${isWeekly ? "is-weekly" : ""}`}>
            {kindLabel}
          </span>
          <span className="cabinet-row-time">{time}</span>
        </div>
        <div className="cabinet-row-body">
          <h3 className="cabinet-row-title">{company}</h3>
          {era && <p className="cabinet-row-era">{era}</p>}
          {snippetDisplay && (
            <p className="cabinet-row-snippet">{snippetDisplay}</p>
          )}
        </div>
        <span className="cabinet-row-arrow" aria-hidden>→</span>
      </Link>
    </li>
  );
}
