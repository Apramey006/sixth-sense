"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase, supabaseEnabled } from "@/lib/supabase";
import { isCompleted } from "@/lib/anonId";
import { useUser } from "@/lib/auth";

export type ArchiveItem = {
  kind: "daily" | "weekly";
  key: string; // date (YYYY-MM-DD) for daily, iso_week (YYYY-Wnn) for weekly
  target_date: string;
  scenario_id: string;
  company: string;
  era: string;
  href: string;
};

type Tab = "daily" | "weekly";
type Filter = "all" | "missed" | "done";
type DoneInfo = { retroactive: boolean };

function formatDaily(date: string): string {
  return new Date(date + "T00:00:00")
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
}

function formatWeekly(week: string, monday: string): string {
  const [, w] = week.split("-W");
  const mon = new Date(monday + "T00:00:00").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
  return `WEEK ${w} · ${mon.toUpperCase()}`;
}

export function ArchiveBoard({
  daily,
  weekly,
}: {
  daily: ArchiveItem[];
  weekly: ArchiveItem[];
}) {
  const { user, loading } = useUser();
  const [tab, setTab] = useState<Tab>("daily");
  const [filter, setFilter] = useState<Filter>("all");

  // Reps the signed-in user filed, keyed precisely by the day/week they were
  // FOR (`${kind}:${target_date}`) so a scenario that recurs across weeks can't
  // mark the wrong row done. byScenario is a legacy fallback for reps filed
  // before target_date existed.
  const [doneByTarget, setDoneByTarget] = useState<Record<string, DoneInfo>>({});
  const [doneByScenario, setDoneByScenario] = useState<Record<string, DoneInfo>>({});
  // Local fallback so anonymous + offline reps still read as done.
  const [localDone, setLocalDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    const done = new Set<string>();
    for (const it of [...daily, ...weekly]) {
      if (isCompleted(it.kind, it.key)) done.add(`${it.kind}:${it.key}`);
    }
    setLocalDone(done);
  }, [daily, weekly]);

  useEffect(() => {
    if (loading || !user || !supabaseEnabled || !supabase) return;
    let active = true;
    (async () => {
      // Prefer precise target_date matching; fall back gracefully if those
      // columns (retroactive_migration.sql) haven't been applied yet.
      type Row = {
        scenario_id: string;
        scenario_type?: "daily" | "weekly";
        target_date?: string | null;
        retroactive?: boolean;
      };
      let rows: Row[] = [];
      const full = await supabase!
        .from("takes")
        .select("scenario_id, scenario_type, target_date, retroactive")
        .eq("user_id", user.id);
      if (full.error) {
        const basic = await supabase!
          .from("takes")
          .select("scenario_id")
          .eq("user_id", user.id);
        rows = (basic.data ?? []) as Row[];
      } else {
        rows = (full.data ?? []) as Row[];
      }
      if (!active) return;
      const byTarget: Record<string, DoneInfo> = {};
      const byScenario: Record<string, DoneInfo> = {};
      for (const r of rows) {
        const info = { retroactive: Boolean(r.retroactive) };
        byScenario[r.scenario_id] = info;
        if (r.scenario_type && r.target_date) {
          byTarget[`${r.scenario_type}:${r.target_date}`] = info;
        }
      }
      setDoneByTarget(byTarget);
      setDoneByScenario(byScenario);
    })();
    return () => {
      active = false;
    };
  }, [user, loading]);

  const statusFor = (it: ArchiveItem): { done: boolean; retroactive: boolean } => {
    const byTarget = doneByTarget[`${it.kind}:${it.target_date}`];
    if (byTarget) return { done: true, retroactive: byTarget.retroactive };
    const byScenario = doneByScenario[it.scenario_id];
    if (byScenario) return { done: true, retroactive: byScenario.retroactive };
    if (localDone.has(`${it.kind}:${it.key}`)) return { done: true, retroactive: false };
    return { done: false, retroactive: false };
  };

  const items = tab === "daily" ? daily : weekly;

  const counts = useMemo(() => {
    let done = 0;
    for (const it of items) if (statusFor(it).done) done += 1;
    return { all: items.length, done, missed: items.length - done };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, doneByTarget, doneByScenario, localDone]);

  const visible = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((it) => {
      const done = statusFor(it).done;
      return filter === "done" ? done : !done;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, filter, doneByTarget, doneByScenario, localDone]);

  return (
    <>
      <div className="cabinet-tabs" role="tablist" style={{ marginTop: "2.25rem" }}>
        {(["daily", "weekly"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            data-active={tab === t}
            className="cabinet-tab"
            onClick={() => {
              setTab(t);
              setFilter("all");
            }}
          >
            <span>{t === "daily" ? "Daily" : "Weekly"}</span>
            <span className="cabinet-tab-count">
              {(t === "daily" ? daily : weekly).length}
            </span>
          </button>
        ))}
      </div>

      <div className="archive-filters" role="tablist" aria-label="Filter by status">
        {(
          [
            { key: "all", label: "All", n: counts.all },
            { key: "missed", label: "Missed", n: counts.missed },
            { key: "done", label: "Done", n: counts.done },
          ] as { key: Filter; label: string; n: number }[]
        ).map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={filter === f.key}
            data-active={filter === f.key}
            className="archive-filter"
            onClick={() => setFilter(f.key)}
          >
            {f.label} <span className="archive-filter-count">{f.n}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p
          className="mono text-xs"
          style={{ color: "var(--ink-mute)", marginTop: "1.75rem", letterSpacing: "0.14em" }}
        >
          {filter === "missed"
            ? "Nothing missed here — you're all caught up."
            : filter === "done"
              ? "Nothing done in this stretch yet."
              : "Nothing in the archive yet."}
        </p>
      ) : (
        <ul className="cabinet-rows archive-rows">
          {visible.map((it) => {
            const { done, retroactive } = statusFor(it);
            const when =
              it.kind === "daily"
                ? formatDaily(it.key)
                : formatWeekly(it.key, it.target_date);
            return (
              <li key={it.key} className="cabinet-row">
                <Link href={it.href} className="archive-row-link">
                  <span className="archive-row-when">{when}</span>
                  <div className="archive-row-body">
                    <h3 className="cabinet-row-title">{it.company}</h3>
                    {it.era && <p className="cabinet-row-era">{it.era}</p>}
                  </div>
                  <span
                    className="archive-status"
                    data-done={done}
                    data-late={done && retroactive}
                  >
                    {done ? (retroactive ? "Caught up" : "Done") : "Not yet"}
                  </span>
                  <span className="cabinet-row-arrow" aria-hidden>
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
