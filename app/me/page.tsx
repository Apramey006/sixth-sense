"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/auth";
import { supabase, supabaseEnabled } from "@/lib/supabase";

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
      const metas: Record<string, ScenarioMeta> = {};
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
    <main className="max-w-4xl mx-auto px-5 sm:px-6 pt-14 sm:pt-20 pb-24">
      <header className="mb-12">
        <h1 className="display text-[2.5rem] sm:text-[3.5rem]">Your reps.</h1>
        <p className="body-prose mt-4 max-w-2xl">
          Each rep, with what you wrote and what you saw. Sorted newest first.
        </p>
      </header>

      {!supabaseEnabled && <NotConfigured />}
      {supabaseEnabled && loading && <Loading />}
      {supabaseEnabled && !loading && !user && <NeedsSignIn />}
      {supabaseEnabled && user && error && <ErrorState message={error} />}
      {supabaseEnabled && user && !error && takes === null && <Loading />}
      {supabaseEnabled && user && takes !== null && takes.length === 0 && <Empty />}
      {supabaseEnabled && user && takes && takes.length > 0 && (
        <TakesList takes={takes} />
      )}
    </main>
  );
}

function NotConfigured() {
  return (
    <div className="card p-6">
      <div className="subhead text-lg mb-1">Auth isn't configured.</div>
      <p className="body-prose">
        Add Supabase credentials to <code className="mono">.env.local</code> to
        use this page.
      </p>
    </div>
  );
}

function Loading() {
  return (
    <div className="mono text-sm" style={{ color: "var(--ink-mute)" }}>
      Loading…
    </div>
  );
}

function NeedsSignIn() {
  return (
    <div className="card p-7 sm:p-8">
      <div className="subhead text-xl sm:text-2xl mb-2">
        Sign in to see your reps.
      </div>
      <p className="body-prose mb-6 max-w-xl">
        Once you sign in, anything you've written on this device gets linked to
        your account, so you can read your past takes from anywhere.
      </p>
      <Link
        href="/auth?next=/me"
        className="btn-accent rounded-full px-5 py-2.5 text-sm inline-flex items-center gap-2"
      >
        Sign in <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="card p-6">
      <div className="subhead text-lg mb-1">Couldn't load your reps.</div>
      <p className="body-prose">{message}</p>
    </div>
  );
}

function Empty() {
  return (
    <div className="card p-8 text-center">
      <div className="subhead text-xl mb-2">No reps yet.</div>
      <p className="body-prose mb-6">
        Start with today's daily — three minutes.
      </p>
      <Link
        href="/today"
        className="btn-accent rounded-full px-5 py-2.5 text-sm inline-flex items-center gap-2"
      >
        Take today's rep <span aria-hidden>→</span>
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
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const isWeekly = take.scenario_type === "weekly";
  const company = take.scenario?.company ?? take.scenario_id;
  const era = take.scenario?.era ?? "";

  return (
    <article className="card p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`pill ${isWeekly ? "pill-accent-2" : "pill-accent"}`}>
            {isWeekly ? "Weekly" : "Daily"}
          </span>
          <div className="font-semibold tracking-tight">{company}</div>
          {era && (
            <span className="mono text-xs" style={{ color: "var(--ink-mute)" }}>
              {era}
            </span>
          )}
        </div>
        <span className="mono text-xs" style={{ color: "var(--ink-mute)" }}>
          {dateStr}
        </span>
      </div>

      {isWeekly ? <WeeklyBody body={take.body} /> : <DailyBody body={take.body} />}
    </article>
  );
}

function DailyBody({ body }: { body: Record<string, unknown> }) {
  const note = (body.note as string | undefined) ?? "";
  return (
    <p
      className="text-sm leading-relaxed whitespace-pre-wrap"
      style={{ color: "var(--ink-soft)" }}
    >
      {note || <em style={{ color: "var(--ink-mute)" }}>(empty)</em>}
    </p>
  );
}

function WeeklyBody({ body }: { body: Record<string, unknown> }) {
  const fields: { key: keyof typeof labels }[] = [
    { key: "tradeoff" },
    { key: "user" },
    { key: "alt" },
    { key: "predict" },
  ];
  return (
    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
      {fields.map(({ key }) => (
        <div key={key as string}>
          <div className="eyebrow mb-1.5">{labels[key]}</div>
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: "var(--ink-soft)" }}
          >
            {(body[key as string] as string) || (
              <em style={{ color: "var(--ink-mute)" }}>(empty)</em>
            )}
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
