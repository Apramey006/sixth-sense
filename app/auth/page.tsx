"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPassword, signUpWithPassword } from "@/lib/auth";
import { supabaseEnabled } from "@/lib/supabase";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "confirm" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [next, setNext] = useState<string>("/");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const n = params.get("next");
    if (n && n.startsWith("/")) setNext(n);
    const err = params.get("error");
    if (err) {
      setStatus("error");
      setErrorMsg(err);
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      if (mode === "signin") {
        await signInWithPassword(email, password);
        router.push(next);
        router.refresh();
      } else {
        const { needsConfirmation } = await signUpWithPassword(email, password);
        if (needsConfirmation) {
          setStatus("confirm");
        } else {
          router.push(next);
          router.refresh();
        }
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const isSignIn = mode === "signin";

  function switchMode(to: Mode) {
    if (to === mode) return;
    setMode(to);
    setStatus("idle");
    setErrorMsg("");
  }

  return (
    <main className="max-w-md mx-auto px-5 sm:px-6 pt-14 sm:pt-20 pb-20">
      <div className="mb-6">
        <span className="pill pill-accent">{isSignIn ? "Sign in" : "Create account"}</span>
      </div>

      <h1 className="display text-[2rem] sm:text-[2.25rem]">
        {isSignIn ? "Welcome back." : "Save your reps."}
      </h1>
      <p className="body-prose mt-3">
        {isSignIn
          ? "Sign in with your email and password."
          : "Create an account so your reps follow you across devices."}
      </p>

      {!supabaseEnabled && (
        <div
          className="mt-8 rounded-md p-4 text-sm"
          style={{ background: "#fef3c7", color: "#78350f" }}
        >
          Auth isn't configured in this environment. Set the Supabase env vars and reload.
        </div>
      )}

      {/* Mode toggle */}
      <div
        className="mt-8 inline-flex rounded-md p-1"
        style={{ background: "var(--rule-soft)", border: "1px solid var(--rule)" }}
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={isSignIn}
          onClick={() => switchMode("signin")}
          className="px-4 py-1.5 rounded text-sm font-medium transition-colors"
          style={{
            background: isSignIn ? "var(--paper-raised)" : "transparent",
            color: isSignIn ? "var(--ink)" : "var(--ink-soft)",
            boxShadow: isSignIn ? "var(--shadow-sm)" : "none",
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isSignIn}
          onClick={() => switchMode("signup")}
          className="px-4 py-1.5 rounded text-sm font-medium transition-colors"
          style={{
            background: !isSignIn ? "var(--paper-raised)" : "transparent",
            color: !isSignIn ? "var(--ink)" : "var(--ink-soft)",
            boxShadow: !isSignIn ? "var(--shadow-sm)" : "none",
          }}
        >
          Create account
        </button>
      </div>

      {status === "confirm" ? (
        <div className="card p-6 mt-6">
          <div className="eyebrow mb-2" style={{ color: "var(--accent)" }}>
            Confirm your email
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
            We sent a confirmation link to{" "}
            <span style={{ fontWeight: 600 }}>{email}</span>. Click it to finish setting up
            your account, then come back and sign in.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="card p-6 mt-6">
          <label className="block">
            <span className="eyebrow">Email</span>
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@somewhere.com"
              className="mt-1.5 w-full border rounded-md px-3 py-2.5"
              style={{ borderColor: "var(--rule)", background: "var(--paper)" }}
              disabled={status === "submitting" || !supabaseEnabled}
            />
          </label>

          <label className="block mt-4">
            <span className="eyebrow">Password</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete={isSignIn ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignIn ? "Your password" : "At least 8 characters"}
              className="mt-1.5 w-full border rounded-md px-3 py-2.5"
              style={{ borderColor: "var(--rule)", background: "var(--paper)" }}
              disabled={status === "submitting" || !supabaseEnabled}
            />
          </label>

          <button
            type="submit"
            disabled={status === "submitting" || !supabaseEnabled}
            className="btn-accent rounded-md px-4 py-2.5 text-sm mt-5 w-full inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {status === "submitting"
              ? isSignIn
                ? "Signing in…"
                : "Creating account…"
              : (
                <>
                  {isSignIn ? "Sign in" : "Create account"} <span aria-hidden>→</span>
                </>
              )}
          </button>

          {status === "error" && (
            <p
              className="text-sm mt-4 rounded-md px-3 py-2"
              style={{ color: "#b91c1c", background: "rgba(185, 28, 28, 0.06)" }}
            >
              {errorMsg || "Couldn't sign in. Try again?"}
            </p>
          )}
        </form>
      )}

      <p className="text-xs mt-6" style={{ color: "var(--ink-mute)" }}>
        Anonymous reps still work without signing in. An account just lets your reps follow
        you across devices.
      </p>
    </main>
  );
}
