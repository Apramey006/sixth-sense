"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabaseEnabled } from "@/lib/supabase";

/**
 * Quiet sign-up nudge rendered after a reveal for unauthenticated users.
 * Not a form — a soft invitation that bounces to /auth with the current
 * page as `next`, so they land back here after signing in.
 */
export function EmailCapture({ context }: { context?: "daily" | "weekly" }) {
  const pathname = usePathname() ?? "/";

  if (!supabaseEnabled) return null;

  const headline =
    context === "weekly"
      ? "Save this rep — and the ones to come."
      : "Save your reps and come back tomorrow.";

  const next = encodeURIComponent(pathname);

  return (
    <div className="card p-5 sm:p-6 mt-12">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="eyebrow mb-2">Optional</div>
          <p className="subhead text-lg">{headline}</p>
          <p className="text-sm mt-1.5" style={{ color: "var(--ink-soft)" }}>
            Create an account so your reps follow you across devices.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/auth?next=${next}`}
            className="btn-accent rounded-md px-4 py-2 text-sm inline-flex items-center gap-1.5"
          >
            Create account <span aria-hidden>→</span>
          </Link>
          <Link
            href={`/auth?next=${next}`}
            className="btn-ghost rounded-md px-4 py-2 text-sm"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
