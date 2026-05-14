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

  return (
    <main className="mx-auto max-w-xl px-6 py-20 fade-up">
      <div className="chapter text-base mb-4" style={{ color: "var(--ink-soft)" }}>
        {isSignIn ? "Sign in" : "Create account"}
      </div>
      <h1
        className="serif text-4xl leading-tight"
        style={{ fontWeight: 500, letterSpacing: "-0.015em" }}
      >
        {isSignIn ? "Welcome back." : "Save your reps."}
      </h1>
      <div className="rule mt-7 mb-7" />
      <p className="serif text-lg leading-relaxed" style={{ color: "var(--ink-soft)" }}>
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

      {status === "confirm" ? (
        <div className="mt-10">
          <div className="smallcaps mb-2" style={{ color: "var(--accent)" }}>
            Confirm your email
          </div>
          <p className="serif text-lg leading-relaxed">
            We sent a confirmation link to{" "}
            <span style={{ fontWeight: 600 }}>{email}</span>. Click it to finish setting up
            your account, then come back and sign in.
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
              disabled={status === "submitting" || !supabaseEnabled}
            />
          </label>

          <label className="block mt-5">
            <span className="smallcaps" style={{ color: "var(--ink-soft)" }}>
              Password
            </span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete={isSignIn ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignIn ? "Your password" : "At least 8 characters"}
              className="mt-2 w-full border rounded-md px-4 py-3 serif text-lg"
              style={{ borderColor: "var(--rule)", background: "white" }}
              disabled={status === "submitting" || !supabaseEnabled}
            />
          </label>

          <button
            type="submit"
            disabled={status === "submitting" || !supabaseEnabled}
            className="btn-primary mt-6 px-6 py-3 rounded-md font-medium disabled:opacity-50"
          >
            {status === "submitting"
              ? isSignIn
                ? "Signing in…"
                : "Creating account…"
              : isSignIn
                ? "Sign in →"
                : "Create account →"}
          </button>

          {status === "error" && (
            <p className="text-sm mt-4" style={{ color: "#b91c1c" }}>
              {errorMsg || "Couldn't sign in. Try again?"}
            </p>
          )}

          <p className="text-sm mt-6" style={{ color: "var(--ink-soft)" }}>
            {isSignIn ? "No account yet?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(isSignIn ? "signup" : "signin");
                setStatus("idle");
                setErrorMsg("");
              }}
              className="underline"
              style={{ color: "var(--ink)" }}
            >
              {isSignIn ? "Create one" : "Sign in"}
            </button>
          </p>

          <p className="text-xs mt-6" style={{ color: "var(--ink-soft)" }}>
            Anonymous reps still work without signing in. This just lets your reps follow you
            across devices.
          </p>
        </form>
      )}
    </main>
  );
}
