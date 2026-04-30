"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useUser, signOut, linkAnonTakesIfNeeded } from "@/lib/auth";
import { supabaseEnabled } from "@/lib/supabase";

/**
 * Self-contained nav button. Renders nothing while loading or when auth is
 * not configured. The visual agent will place this in the masthead.
 */
export function AuthButton() {
  const { user, loading } = useUser();

  // On first sign-in, link any pre-existing anon takes to the new user.
  useEffect(() => {
    if (user) {
      void linkAnonTakesIfNeeded(user);
    }
  }, [user]);

  if (!supabaseEnabled) return null;
  if (loading) return null;

  if (!user) {
    return (
      <Link
        href="/auth"
        className="text-sm hover:underline whitespace-nowrap"
        style={{ color: "var(--ink-soft)" }}
      >
        Sign in
      </Link>
    );
  }

  async function onSignOut(e: React.MouseEvent) {
    e.preventDefault();
    await signOut();
    // Hit the route too so server cookies are cleared.
    window.location.href = "/auth/sign-out";
  }

  return (
    <div className="flex items-center gap-3 text-sm" style={{ color: "var(--ink-soft)" }}>
      <span className="hidden sm:inline" title={user.email ?? ""}>
        {user.email}
      </span>
      <button
        type="button"
        onClick={onSignOut}
        className="hover:underline whitespace-nowrap"
        style={{ color: "var(--ink-soft)" }}
      >
        Sign out
      </button>
    </div>
  );
}
