"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useUser, signOut, linkAnonTakesIfNeeded } from "@/lib/auth";
import { supabaseEnabled } from "@/lib/supabase";

function initialsFor(email: string | null | undefined): string {
  if (!email) return "?";
  const name = email.split("@")[0] ?? "";
  const parts = name.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (name.slice(0, 2) || "?").toUpperCase();
}

export function AuthButton() {
  const { user, loading } = useUser();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (user) void linkAnonTakesIfNeeded(user);
  }, [user]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

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

  async function onSignOut() {
    await signOut();
    window.location.href = "/auth/sign-out";
  }

  const initials = initialsFor(user.email);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.email ?? "your account"}`}
        title={user.email ?? ""}
        className="flex items-center justify-center transition-colors"
        style={{
          width: 30,
          height: 30,
          borderRadius: 999,
          background: open ? "var(--ink)" : "var(--paper-deep)",
          color: open ? "var(--paper)" : "var(--ink)",
          fontSize: "0.7rem",
          fontWeight: 600,
          letterSpacing: "0.04em",
          border: "1px solid var(--rule)",
        }}
      >
        {initials}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 overflow-hidden"
          style={{
            background: "var(--paper-raised)",
            border: "1px solid var(--rule)",
            borderRadius: 10,
            boxShadow: "0 12px 32px -16px rgba(10,10,10,0.25), 0 2px 6px rgba(10,10,10,0.04)",
            zIndex: 60,
          }}
        >
          <div
            className="px-4 py-3"
            style={{ borderBottom: "1px solid var(--rule)" }}
          >
            <div
              className="text-[0.65rem] uppercase"
              style={{ color: "var(--ink-mute)", letterSpacing: "0.12em" }}
            >
              Signed in as
            </div>
            <div
              className="text-sm mt-0.5 truncate"
              style={{ color: "var(--ink)" }}
              title={user.email ?? ""}
            >
              {user.email}
            </div>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={onSignOut}
            className="w-full text-left text-sm px-4 py-2.5 transition-colors"
            style={{ color: "var(--ink-soft)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--paper-deep)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-soft)";
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
