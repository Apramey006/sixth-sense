"use client";

import Link from "next/link";
import { useUser } from "@/lib/auth";
import { EmailCapture } from "@/components/EmailCapture";

export function PostRepFooter({ kind }: { kind: "daily" | "weekly" }) {
  const { user, loading } = useUser();

  const next =
    kind === "daily"
      ? {
          href: "/this-week",
          label: "Try the weekly deep rep",
          help: "Twenty-five minutes. Four-dimension take. The full reveal.",
        }
      : {
          href: "/today",
          label: "Take today's daily rep",
          help: "Three minutes. One real product moment.",
        };

  return (
    <>
      {/* Quiet email-capture only for unauthenticated users. */}
      {!loading && !user && <EmailCapture context={kind} />}

      <div className="mt-12 drop-rule pt-8 flex items-baseline justify-between gap-6 flex-wrap">
        <div className="text-sm" style={{ color: "var(--ink-soft)" }}>
          <span className="smallcaps">When you're ready</span>
          <p className="mt-1 leading-relaxed">{next.help}</p>
        </div>
        <Link
          href={next.href}
          className="serif text-lg hover:underline whitespace-nowrap"
          style={{ color: "var(--ink)" }}
        >
          {next.label} →
        </Link>
      </div>
    </>
  );
}
