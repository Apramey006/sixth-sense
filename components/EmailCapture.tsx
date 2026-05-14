"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpWithPassword } from "@/lib/auth";
import { supabaseEnabled } from "@/lib/supabase";

/**
 * Quiet sign-up nudge after a reveal for unauthenticated users.
 * Email + password, with a link to sign in if they already have an account.
 */
export function EmailCapture({ context }: { context?: "daily" | "weekly" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "confirm" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!supabaseEnabled) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const { needsConfirmation } = await signUpWithPassword(email, password);
      if (needsConfirmation) {
        setStatus("confirm");
      } else {
        router.refresh();
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Couldn't create your account.");
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
        Create an account so your reps follow you across devices.
      </p>

      {status === "confirm" ? (
        <div className="mt-5">
          <div className="smallcaps mb-1" style={{ color: "var(--accent)" }}>
            Confirm your email
          </div>
          <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
            We sent a confirmation link to{" "}
            <span style={{ fontWeight: 600 }}>{email}</span>. Click it to activate your
            account.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@somewhere.com"
            disabled={status === "submitting"}
            className="border rounded-md px-3 py-2 serif"
            style={{ borderColor: "var(--rule)", background: "white" }}
          />
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (8+ characters)"
            disabled={status === "submitting"}
            className="border rounded-md px-3 py-2 serif"
            style={{ borderColor: "var(--rule)", background: "white" }}
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="btn-primary px-5 py-2 rounded-md font-medium disabled:opacity-50 whitespace-nowrap"
          >
            {status === "submitting" ? "Creating…" : "Create account"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="text-sm mt-3" style={{ color: "#b91c1c" }}>
          {errorMsg}
        </p>
      )}

      <p className="text-xs mt-4" style={{ color: "var(--ink-soft)" }}>
        Already have an account?{" "}
        <Link href="/auth" className="underline" style={{ color: "var(--ink)" }}>
          Sign in
        </Link>
        .
      </p>
    </div>
  );
}
