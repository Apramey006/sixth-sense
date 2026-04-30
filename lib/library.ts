import { supabase, supabaseEnabled, type DailyScenario, type WeeklyScenario } from "./supabase";
import { dailySeed, weeklySeed } from "./seedScenarios";

// Library-specific fetch: returns the entire pool of scenarios per type, not
// the date-rotated single scenario. Mirrors the supabase-first / TS-seed
// fallback pattern from lib/scenarios.ts so the library page works whether or
// not Supabase is configured (or populated). Kept separate from
// lib/scenarios.ts on purpose to avoid stepping on parallel work.

export type LibraryEntry =
  | { kind: "daily"; scenario: DailyScenario }
  | { kind: "weekly"; scenario: WeeklyScenario };

export async function getAllScenarios(): Promise<{
  daily: DailyScenario[];
  weekly: WeeklyScenario[];
}> {
  const [daily, weekly] = await Promise.all([
    fetchPool<DailyScenario>("daily", dailySeed),
    fetchPool<WeeklyScenario>("weekly", weeklySeed),
  ]);
  return { daily, weekly };
}

async function fetchPool<T extends DailyScenario | WeeklyScenario>(
  type: "daily" | "weekly",
  fallback: T[],
): Promise<T[]> {
  if (!supabaseEnabled || !supabase) return fallback;

  try {
    const { data, error } = await supabase
      .from("scenarios")
      .select("payload")
      .eq("type", type);

    if (error || !data || data.length === 0) {
      if (error) console.warn(`library scenarios fetch (${type}) failed, using seed:`, error.message);
      return fallback;
    }

    return data.map((row) => row.payload as T);
  } catch (e) {
    console.warn(`library scenarios fetch (${type}) threw, using seed:`, e);
    return fallback;
  }
}
