"use client";

import { useMemo, useState } from "react";
import { ScenarioCard } from "./ScenarioCard";

type Item = {
  id: string;
  kind: "daily" | "weekly";
  company: string;
  era: string;
  excerpt: string;
  featured?: boolean;
};

type Filter = "all" | "daily" | "weekly";

export function LibraryGrid({ items }: { items: Item[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.kind === filter)),
    [items, filter],
  );

  const counts = useMemo(
    () => ({
      all: items.length,
      daily: items.filter((i) => i.kind === "daily").length,
      weekly: items.filter((i) => i.kind === "weekly").length,
    }),
    [items],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-7">
        <Chip label={`All (${counts.all})`} active={filter === "all"} onClick={() => setFilter("all")} />
        <Chip
          label={`Daily (${counts.daily})`}
          active={filter === "daily"}
          onClick={() => setFilter("daily")}
        />
        <Chip
          label={`Weekly (${counts.weekly})`}
          active={filter === "weekly"}
          onClick={() => setFilter("weekly")}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="serif italic" style={{ color: "var(--ink-soft)" }}>
          No scenarios in this view yet.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {filtered.map((item) => (
            <ScenarioCard
              key={`${item.kind}:${item.id}`}
              kind={item.kind}
              company={item.company}
              era={item.era}
              excerpt={item.excerpt}
              featured={item.featured}
            />
          ))}
        </div>
      )}
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
      className="smallcaps px-3 py-1.5 rounded-full border transition"
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
