"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithOAuth, signInWithPassword, signUpWithPassword } from "@/lib/auth";
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

  async function onOAuth(provider: "google" | "github") {
    setStatus("submitting");
    setErrorMsg("");
    try {
      await signInWithOAuth(provider, next);
      // Browser is now redirecting to the provider; no further state to set.
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Couldn't start sign-in.");
    }
  }

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
          style={{
            background: "rgba(212, 163, 65, 0.12)",
            color: "var(--accent-soft)",
            border: "1px solid rgba(212, 163, 65, 0.3)",
          }}
        >
          Auth isn't configured in this environment. Set the Supabase env vars and reload.
        </div>
      )}

      {/* Mode toggle */}
      <div
        className="mt-8 inline-flex rounded-md p-1"
        style={{ background: "var(--paper-deep)", border: "1px solid var(--rule)" }}
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={isSignIn}
          onClick={() => switchMode("signin")}
          className="px-4 py-1.5 rounded text-sm font-medium transition-colors"
          style={{
            background: isSignIn ? "var(--accent)" : "transparent",
            color: isSignIn ? "var(--paper)" : "var(--ink-soft)",
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
            background: !isSignIn ? "var(--accent)" : "transparent",
            color: !isSignIn ? "var(--paper)" : "var(--ink-soft)",
            boxShadow: !isSignIn ? "var(--shadow-sm)" : "none",
          }}
        >
          Create account
        </button>
      </div>

      {status !== "confirm" && (
        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={() => onOAuth("google")}
            disabled={status === "submitting" || !supabaseEnabled}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              borderColor: "var(--rule)",
              background: "var(--paper-raised)",
              color: "var(--ink)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615Z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.592.102-1.167.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58Z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px" style={{ background: "var(--rule)" }} />
            <span className="text-xs" style={{ color: "var(--ink-mute)" }}>
              or
            </span>
            <div className="flex-1 h-px" style={{ background: "var(--rule)" }} />
          </div>
        </div>
      )}

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
              style={{ borderColor: "var(--rule)", background: "var(--paper-deep)" }}
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
              style={{ borderColor: "var(--rule)", background: "var(--paper-deep)" }}
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
