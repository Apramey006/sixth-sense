"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser, signOut } from "@/lib/auth";
import { supabaseEnabled } from "@/lib/supabase";

export default function SettingsPage() {
  const { user, loading } = useUser();

  return (
    <main className="cabinet-shell mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-24">
      <header className="cabinet-strip">
        <span className="cabinet-strip-label">Account</span>
        <span className="dot" aria-hidden>·</span>
        <span className="dateline">Your sign-in, your emails, your data</span>
      </header>

      <section className="cabinet-hero">
        <h1 className="cabinet-title">Settings.</h1>
        <p className="cabinet-deck">
          Everything tied to your account in one place.
        </p>
      </section>

      {!supabaseEnabled && <NotConfigured />}
      {supabaseEnabled && loading && <Loading />}
      {supabaseEnabled && !loading && !user && <NeedsSignIn />}
      {supabaseEnabled && !loading && user && <Body userId={user.id} email={user.email ?? ""} createdAt={user.created_at} />}
    </main>
  );
}

function Body({ userId, email, createdAt }: { userId: string; email: string; createdAt: string }) {
  void userId;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginTop: "1.5rem" }}>
      <AccountCard email={email} createdAt={createdAt} />
      <EmailPrefsCard />
      <DangerCard email={email} />
    </div>
  );
}

function Section({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "var(--paper-raised)",
        border: "1px solid var(--rule)",
        borderRadius: 10,
        padding: "1.5rem",
      }}
    >
      <div
        className="text-[0.65rem] uppercase"
        style={{ color: "var(--ink-mute)", letterSpacing: "0.16em", marginBottom: "0.25rem" }}
      >
        {label}
      </div>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--ink)", marginBottom: "1rem" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function AccountCard({ email, createdAt }: { email: string; createdAt: string }) {
  const joined = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  async function onSignOut() {
    await signOut();
    window.location.href = "/";
  }

  return (
    <Section label="Account" title="Signed in">
      <Row label="Email" value={email} />
      <Row label="Joined" value={joined} />
      <div style={{ marginTop: "1.25rem" }}>
        <button type="button" onClick={onSignOut} className="settings-btn-secondary">
          Sign out
        </button>
      </div>
    </Section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "0.5rem 0",
        borderBottom: "1px solid var(--rule)",
        gap: "1rem",
      }}
    >
      <span style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>{label}</span>
      <span style={{ color: "var(--ink)", fontSize: "0.9rem", textAlign: "right", wordBreak: "break-all" }}>
        {value}
      </span>
    </div>
  );
}

function EmailPrefsCard() {
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/account/email-prefs");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setSubscribed(Boolean(data.subscribed));
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  async function toggle(next: boolean) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/account/email-prefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscribed: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setSubscribed(Boolean(data.subscribed));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section label="Emails" title="Daily + weekly reps">
      <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem", marginBottom: "1rem", lineHeight: 1.5 }}>
        One short rep every weekday morning and a deeper rep on Sunday for the
        week ahead. You can turn them off anytime.
      </p>
      {subscribed === null ? (
        <p className="mono text-xs" style={{ color: "var(--ink-mute)", letterSpacing: "0.14em" }}>
          Loading…
        </p>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            type="button"
            role="switch"
            aria-checked={subscribed}
            disabled={saving}
            onClick={() => toggle(!subscribed)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 999,
              background: subscribed ? "var(--ink)" : "var(--paper-deep)",
              border: "1px solid var(--rule)",
              position: "relative",
              transition: "background 0.15s",
              cursor: saving ? "wait" : "pointer",
              opacity: saving ? 0.6 : 1,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 2,
                left: subscribed ? 22 : 2,
                width: 18,
                height: 18,
                borderRadius: 999,
                background: subscribed ? "var(--paper)" : "var(--ink-soft)",
                transition: "left 0.15s",
              }}
            />
          </button>
          <span style={{ color: "var(--ink)", fontSize: "0.9rem" }}>
            {subscribed ? "Subscribed" : "Unsubscribed"}
          </span>
        </div>
      )}
      {error && (
        <p style={{ color: "#c0392b", fontSize: "0.85rem", marginTop: "0.75rem" }}>{error}</p>
      )}
    </Section>
  );
}

function DangerCard({ email }: { email: string }) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (typed !== email) return;
    setWorking(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      await signOut();
      window.location.href = "/";
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setWorking(false);
    }
  }

  return (
    <Section label="Danger zone" title="Delete account">
      <p style={{ color: "var(--ink-soft)", fontSize: "0.9rem", marginBottom: "1rem", lineHeight: 1.5 }}>
        Permanently delete your account. Your past reps stay in the system as
        anonymous (we keep aggregate counts), but they'll no longer be linked
        to you and you won't be able to see them again.
      </p>
      {!confirming ? (
        <button type="button" onClick={() => setConfirming(true)} className="settings-btn-danger">
          Delete account
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>
            Type your email to confirm:
          </label>
          <input
            type="email"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={email}
            style={{
              border: "1px solid var(--rule)",
              borderRadius: 6,
              padding: "0.5rem 0.75rem",
              background: "var(--paper-deep)",
              color: "var(--ink)",
              fontSize: "0.9rem",
            }}
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={onDelete}
              disabled={typed !== email || working}
              className="settings-btn-danger"
              style={{ opacity: typed !== email || working ? 0.5 : 1 }}
            >
              {working ? "Deleting…" : "Permanently delete"}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                setTyped("");
                setError(null);
              }}
              className="settings-btn-secondary"
            >
              Cancel
            </button>
          </div>
          {error && (
            <p style={{ color: "#c0392b", fontSize: "0.85rem" }}>{error}</p>
          )}
        </div>
      )}
    </Section>
  );
}

function NotConfigured() {
  return (
    <div className="cabinet-note">
      <div className="cabinet-note-head">Auth isn't configured.</div>
      <p>Add Supabase credentials to use this page.</p>
    </div>
  );
}

function Loading() {
  return (
    <p className="mono text-xs" style={{ color: "var(--ink-mute)", letterSpacing: "0.16em" }}>
      Loading…
    </p>
  );
}

function NeedsSignIn() {
  return (
    <div className="cabinet-note">
      <div className="cabinet-note-head">Sign in to see your settings.</div>
      <p>You'll need to be signed in to manage your account.</p>
      <Link href="/auth?next=/settings" className="rep-submit" style={{ marginTop: "1.25rem" }}>
        Sign in <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
