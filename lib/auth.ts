"use client";

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, supabaseEnabled } from "./supabase";
import { getAnonId } from "./anonId";

const LINKED_KEY = "sixth-sense:anon-linked";

/**
 * React hook: returns the current Supabase user (or null) and a loading flag.
 * Subscribes to auth state changes so the UI updates after sign-in.
 */
export function useUser(): { user: User | null; loading: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!supabaseEnabled || !supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session: Session | null) => {
      setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

/**
 * Sign in an existing user with email + password. Session is set immediately.
 * If Supabase has CAPTCHA protection enabled, the caller must pass a
 * captchaToken from the hCaptcha widget on /auth.
 */
export async function signInWithPassword(
  email: string,
  password: string,
  captchaToken?: string,
): Promise<void> {
  if (!supabaseEnabled || !supabase) {
    throw new Error("Auth is not configured.");
  }
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
    options: captchaToken ? { captchaToken } : undefined,
  });
  if (error) throw error;
}

/**
 * Create a new account with email + password. If Supabase email confirmation
 * is disabled, the user is signed in immediately; otherwise the returned
 * session is null until they confirm.
 */
export async function signUpWithPassword(
  email: string,
  password: string,
  captchaToken?: string,
  subscribe: boolean = true,
): Promise<{ needsConfirmation: boolean }> {
  if (!supabaseEnabled || !supabase) {
    throw new Error("Auth is not configured.");
  }
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      ...(captchaToken ? { captchaToken } : {}),
      // Stashed in user_metadata so /auth/callback can honor the choice when
      // the confirmation link is clicked.
      data: { subscribe },
    },
  });
  if (error) throw error;
  return { needsConfirmation: !data.session };
}

/**
 * Start an OAuth sign-in flow. The browser is redirected to the provider, then
 * back to /auth/callback?next=... once Supabase exchanges the code.
 */
export async function signInWithOAuth(
  provider: "google" | "github",
  next: string = "/"
): Promise<void> {
  if (!supabaseEnabled || !supabase) {
    throw new Error("Auth is not configured.");
  }
  const safeNext = next.startsWith("/") ? next : "/";
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  if (!supabaseEnabled || !supabase) return;
  await supabase.auth.signOut();
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(LINKED_KEY);
  }
}

/**
 * One-time hook for newly-signed-in users: link any anon takes captured before
 * sign-in to the new auth user. Idempotent — uses a localStorage flag so we
 * only run the migration once per device per user.
 *
 * Server-side, the SQL function `link_anon_takes_to_user(anon uuid)` updates
 * `takes.user_id` for all rows where `anon_id = anon` and the caller is the
 * owning auth user. Falls back to a direct update if the RPC isn't installed.
 */
export async function linkAnonTakesIfNeeded(user: User): Promise<void> {
  if (!supabaseEnabled || !supabase) return;
  if (typeof window === "undefined") return;

  const anonId = getAnonId();
  if (!anonId) return;

  const flag = `${LINKED_KEY}:${user.id}:${anonId}`;
  if (window.localStorage.getItem(flag)) return;

  try {
    const { error: rpcError } = await supabase.rpc("link_anon_takes_to_user", {
      anon: anonId,
    });
    if (rpcError) {
      // Fallback: direct update. RLS policy "user can claim their anon takes"
      // allows this when user_id is null and the caller is authenticated.
      await supabase
        .from("takes")
        .update({ user_id: user.id })
        .eq("anon_id", anonId)
        .is("user_id", null);
    }
  } catch (e) {
    // Non-fatal: future takes will still attribute correctly.
    console.warn("linkAnonTakesToUser failed", e);
  } finally {
    window.localStorage.setItem(flag, "1");
  }
}
