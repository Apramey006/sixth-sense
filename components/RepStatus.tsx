"use client";

import { useEffect, useState } from "react";
import { isCompleted } from "@/lib/anonId";

export function RepStatus({
  kind,
  scopeKey,
  freshLabel = "New today",
}: {
  kind: "daily" | "weekly";
  scopeKey: string;
  freshLabel?: string;
}) {
  const [status, setStatus] = useState<"loading" | "done" | "fresh">("loading");

  useEffect(() => {
    setStatus(isCompleted(kind, scopeKey) ? "done" : "fresh");
  }, [kind, scopeKey]);

  if (status === "loading") {
    return <span className="smallcaps" style={{ color: "var(--ink-soft)", opacity: 0 }}>·</span>;
  }

  if (status === "done") {
    return (
      <span className="smallcaps" style={{ color: "var(--ink-soft)" }}>
        ✓ Done
      </span>
    );
  }

  return (
    <span className="smallcaps" style={{ color: "var(--accent)" }}>
      {freshLabel}
    </span>
  );
}
