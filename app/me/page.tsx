"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/auth";
import { supabase, supabaseEnabled } from "@/lib/supabase";
import { TopNav } from "@/components/TopNav";

type TakeRow = {
  id: string;
  scenario_id: string;
  scenario_type: "daily" | "weekly";
  body: Record<string, unknown>;
  created_at: string;
};

type ScenarioMeta = {
  id: string;
  type: "daily" | "weekly";
  company: string;
  era: string;
};

type EnrichedTake = TakeRow & { scenario: ScenarioMeta | null };

export default function MePage() {
  const { user, loading } = useUser();
  const [takes, setTakes] = useState<EnrichedTake[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user || !supabaseEnabled || !supabase) return;

    let active = true;
    (async () => {
      const { data: takesData, error: takesErr } = await supabase!
        .from("takes")
        .select("id, scenario_id, scenario_type, body, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (takesErr) {
        if (active) setError(takesErr.message);
        return;
      }
      const rows = (takesData ?? []) as TakeRow[];

      const ids = Array.from(new Set(rows.map((r) => r.scenario_id)));
      let metas: Record<string, ScenarioMeta> = {};
      if (ids.length > 0) {
        const { data: scenarioData } = await supabase!
          .from("scenarios")
          .select("id, type, payload")
          .in("id", ids);
        for (const s of scenarioData ?? []) {
          const payload = s.payload as { company?: string; era?: string };
          metas[s.id] = {
            id: s.id,
            type: s.type,
            company: payload.company ?? s.id,
            era: payload.era ?? "",
          };
        }
      }

      const enriched: EnrichedTake[] = rows.map((r) => ({
        ...r,
        scenario: metas[r.scenario_id] ?? null,
      }));

      if (active) setTakes(enriched);
    })();

    return () => {
      active = false;
    };
  }, [user, loading]);

  return (
    <>
      <TopNav />
      <main className="max-w-4xl mx-auto px-6 pt-12 pb-24">
        <div className="mb-10">
          <div className="smallcaps mb-2" style={{ color: "var(--ink-soft)" }}>
            Your reps
          </div>
          <h1 className="text-4xl font-semibold tracking-tight" style={{ color: "var(--ink)" }}>
            Everything you've written.
          </h1>
          <p className="mt-3 text-base leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            Each rep, with what you wrote, and what you saw. Sorted newest first.
          </p>
        </div>

        {!supabaseEnabled && <NotConfigured />}
        {supabaseEnabled && loading && <Loading />}
        {supabaseEnabled && !loading && !user && <NeedsSignIn />}
        {supabaseEnabled && user && error && <ErrorState message={error} />}
        {supabaseEnabled && user && !error && takes === null && <Loading />}
        {supabaseEnabled && user && takes !== null && takes.length === 0 && <Empty />}
        {supabaseEnabled && user && takes && takes.length > 0 && <TakesList takes={takes} />}
      </main>
    </>
  );
}

function NotConfigured() {
  return (
    <div
      className="rounded-md p-6 border"
      style={{ borderColor: "var(--rule)", background: "var(--paper-raised)" }}
    >
      <div className="font-medium mb-1">Auth isn't configured.</div>
      <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
        Add Supabase credentials to <code>.env.local</code> to use this page.
      </p>
    </div>
  );
}

function Loading() {
  return (
    <div className="text-sm" style={{ color: "var(--ink-soft)" }}>
      Loading…
    </div>
  );
}

function NeedsSignIn() {
  return (
    <div
      className="rounded-md p-8 border"
      style={{ borderColor: "var(--rule)", background: "var(--paper-raised)" }}
    >
      <div className="text-lg font-semibold mb-2">Sign in to see your reps.</div>
      <p className="text-sm mb-5 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
        Once you sign in, anything you've written on this device gets linked to your account, so you can read your past
        takes from anywhere.
      </p>
      <Link
        href="/auth?next=/me"
        className="btn-accent inline-block px-5 py-2.5 rounded-md text-sm font-medium"
      >
        Sign in with email →
      </Link>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div
      className="rounded-md p-6 border"
      style={{ borderColor: "var(--rule)", background: "var(--paper-raised)" }}
    >
      <div className="font-medium mb-1">Couldn't load your reps.</div>
      <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
        {message}
      </p>
    </div>
  );
}

function Empty() {
  return (
    <div
      className="rounded-md p-8 border text-center"
      style={{ borderColor: "var(--rule)", background: "var(--paper-raised)" }}
    >
      <div className="text-lg font-semibold mb-1">No reps yet.</div>
      <p className="text-sm mb-5" style={{ color: "var(--ink-soft)" }}>
        Start with today's daily — three minutes.
      </p>
      <Link href="/today" className="btn-accent inline-block px-5 py-2.5 rounded-md text-sm font-medium">
        Take today's rep →
      </Link>
    </div>
  );
}

function TakesList({ takes }: { takes: EnrichedTake[] }) {
  return (
    <div className="space-y-4">
      {takes.map((t) => (
        <TakeCard key={t.id} take={t} />
      ))}
    </div>
  );
}

function TakeCard({ take }: { take: EnrichedTake }) {
  const dateStr = new Date(take.created_at).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const isWeekly = take.scenario_type === "weekly";
  const company = take.scenario?.company ?? take.scenario_id;
  const era = take.scenario?.era ?? "";

  return (
    <article
      className="rounded-md border p-5"
      style={{ borderColor: "var(--rule)", background: "var(--paper-raised)" }}
    >
      <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-baseline gap-3">
          <span
            className={isWeekly ? "pill-accent-2" : "pill-accent"}
            aria-label={isWeekly ? "Weekly deep rep" : "Daily rep"}
          >
            {isWeekly ? "Weekly" : "Daily"}
          </span>
          <div className="text-base font-semibold tracking-tight">{company}</div>
          {era && (
            <div className="smallcaps" style={{ color: "var(--ink-soft)" }}>
              {era}
            </div>
          )}
        </div>
        <div className="text-xs" style={{ color: "var(--ink-soft)" }}>
          {dateStr}
        </div>
      </div>

      {isWeekly ? <WeeklyBody body={take.body} /> : <DailyBody body={take.body} />}
    </article>
  );
}

function DailyBody({ body }: { body: Record<string, unknown> }) {
  const note = (body.note as string | undefined) ?? "";
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--ink)" }}>
      {note || <em style={{ color: "var(--ink-soft)" }}>(empty)</em>}
    </p>
  );
}

function WeeklyBody({ body }: { body: Record<string, unknown> }) {
  const fields: { key: keyof typeof labels; }[] = [
    { key: "tradeoff" },
    { key: "user" },
    { key: "alt" },
    { key: "predict" },
  ];
  return (
    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 mt-2">
      {fields.map(({ key }) => (
        <div key={key as string}>
          <div className="smallcaps mb-1" style={{ color: "var(--ink-soft)" }}>
            {labels[key]}
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {(body[key as string] as string) || <em style={{ color: "var(--ink-soft)" }}>(empty)</em>}
          </p>
        </div>
      ))}
    </div>
  );
}

const labels = {
  tradeoff: "Tradeoff",
  user: "Target user",
  alt: "Alternative",
  predict: "Prediction",
} as const;
