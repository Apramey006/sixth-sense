"use client";

import { useEffect, useState } from "react";
import { isCompleted } from "@/lib/anonId";

export function RepStatus({
  kind,
  scopeKey,
  freshLabel = "New today",
  tone = "accent",
}: {
  kind: "daily" | "weekly";
  scopeKey: string;
  freshLabel?: string;
  tone?: "accent" | "accent-2";
}) {
  const [status, setStatus] = useState<"loading" | "done" | "fresh">("loading");

  useEffect(() => {
    setStatus(isCompleted(kind, scopeKey) ? "done" : "fresh");
  }, [kind, scopeKey]);

  if (status === "loading") {
    return (
      <span className="pill pill-mute" style={{ opacity: 0 }}>
        ·
      </span>
    );
  }

  if (status === "done") {
    return (
      <span className="pill pill-mute">
        <span aria-hidden>✓</span> Done
      </span>
    );
  }

  return (
    <span className={tone === "accent-2" ? "pill pill-accent-2" : "pill pill-accent"}>
      {freshLabel}
    </span>
  );
}
