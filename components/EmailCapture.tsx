"use client";

import { useState } from "react";
import { sendMagicLink } from "@/lib/auth";
import { supabaseEnabled } from "@/lib/supabase";

/**
 * Quiet email-capture, rendered after a reveal for unauthenticated users.
 * Single field, magic-link button, soft phrasing. Not a wall — an invitation.
 */
export function EmailCapture({ context }: { context?: "daily" | "weekly" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // If auth isn't configured, render nothing — no broken UI in dev.
  if (!supabaseEnabled) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const origin = window.location.origin;
      const next = typeof window !== "undefined" ? window.location.pathname : "/";
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
      await sendMagicLink(email, redirectTo);
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Couldn't send the link.");
    }
  }

  const headline =
    context === "weekly"
      ? "Save this rep — and the ones to come."
      : "Save your reps and come back tomorrow.";

  return (
    <div
      className="mt-12 rounded-md border p-6"
      style={{ borderColor: "var(--rule)", background: "white" }}
    >
      <div className="smallcaps mb-2" style={{ color: "var(--ink-soft)" }}>
        Optional
      </div>
      <p className="serif text-lg leading-snug" style={{ fontWeight: 500 }}>
        {headline}
      </p>
      <p className="text-sm mt-2" style={{ color: "var(--ink-soft)" }}>
        Drop an email and we'll send you a magic link. Your reps follow you across devices.
      </p>

      {status === "sent" ? (
        <div className="mt-5">
          <div className="smallcaps mb-1" style={{ color: "var(--accent)" }}>
            Link sent
          </div>
          <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
            Check <span style={{ fontWeight: 600 }}>{email}</span>. Click the link on this
            device and your reps will be tied to your account.
          </p>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center"
        >
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@somewhere.com"
            disabled={status === "sending"}
            className="flex-1 border rounded-md px-3 py-2 serif"
            style={{ borderColor: "var(--rule)", background: "white" }}
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-primary px-5 py-2 rounded-md font-medium disabled:opacity-50 whitespace-nowrap"
          >
            {status === "sending" ? "Sending…" : "Email me a link"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="text-sm mt-3" style={{ color: "#b91c1c" }}>
          {errorMsg}
        </p>
      )}
    </div>
  );
}
