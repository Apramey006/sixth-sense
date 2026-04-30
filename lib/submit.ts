"use client";

import { supabase, supabaseEnabled } from "./supabase";
import { getAnonId } from "./anonId";

type SubmitArgs = {
  scenario_id: string;
  scenario_type: "daily" | "weekly";
  body: Record<string, unknown>;
};

export async function submitTake(args: SubmitArgs): Promise<void> {
  if (!supabaseEnabled || !supabase) {
    // No backend configured — keep the rep working offline.
    // We still store the take locally so the user gets the side-by-side reveal.
    const stash = `taste-reps:take:${args.scenario_type}:${args.scenario_id}`;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(stash, JSON.stringify({ ...args.body, at: new Date().toISOString() }));
    }
    return;
  }

  const anon_id = getAnonId();
  const { error } = await supabase.from("takes").insert({
    anon_id,
    scenario_id: args.scenario_id,
    scenario_type: args.scenario_type,
    body: args.body,
  });
  if (error) {
    console.error("submitTake error", error);
  }
}
