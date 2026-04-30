"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sendMagicLink } from "@/lib/auth";
import { supabaseEnabled } from "@/lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [next, setNext] = useState<string>("/");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const n = params.get("next");
    if (n && n.startsWith("/")) setNext(n);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
      await sendMagicLink(email, redirectTo);
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-20 fade-up">
      <div className="chapter text-base mb-4" style={{ color: "var(--ink-soft)" }}>
        Sign in
      </div>
      <h1
        className="serif text-4xl leading-tight"
        style={{ fontWeight: 500, letterSpacing: "-0.015em" }}
      >
        A magic link, nothing more.
      </h1>
      <div className="rule mt-7 mb-7" />
      <p className="serif text-lg leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        Save your reps so they're waiting for you tomorrow. No password, no account form —
        we email you a link you click once.
      </p>

      {!supabaseEnabled && (
        <div
          className="mt-8 rounded-md p-4 text-sm"
          style={{ background: "#fef3c7", color: "#78350f" }}
        >
          Auth isn't configured in this environment. Set the Supabase env vars and reload.
        </div>
      )}

      {status === "sent" ? (
        <div className="mt-10">
          <div className="smallcaps mb-2" style={{ color: "var(--accent)" }}>
            Check your email
          </div>
          <p className="serif text-lg leading-relaxed">
            We sent a link to <span style={{ fontWeight: 600 }}>{email}</span>. Click it on
            this device and you'll be signed in.
          </p>
          <p className="text-sm mt-4" style={{ color: "var(--ink-soft)" }}>
            You can close this tab. Or{" "}
            <Link href="/" className="underline">
              keep reading the site
            </Link>{" "}
            — the link will pick up wherever you are.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-10">
          <label className="block">
            <span className="smallcaps" style={{ color: "var(--ink-soft)" }}>
              Email
            </span>
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@somewhere.com"
              className="mt-2 w-full border rounded-md px-4 py-3 serif text-lg"
              style={{ borderColor: "var(--rule)", background: "white" }}
              disabled={status === "sending" || !supabaseEnabled}
            />
          </label>

          <button
            type="submit"
            disabled={status === "sending" || !supabaseEnabled}
            className="btn-primary mt-6 px-6 py-3 rounded-md font-medium disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Email me a sign-in link →"}
          </button>

          {status === "error" && (
            <p className="text-sm mt-4" style={{ color: "#b91c1c" }}>
              {errorMsg || "Couldn't send the link. Try again?"}
            </p>
          )}

          <p className="text-xs mt-6" style={{ color: "var(--ink-soft)" }}>
            Anonymous reps still work without signing in. This just lets your reps follow you
            across devices.
          </p>
        </form>
      )}
    </main>
  );
}
