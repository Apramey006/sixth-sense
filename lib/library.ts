import { supabase, supabaseEnabled, type DailyScenario, type WeeklyScenario } from "./supabase";
import { dailySeed, weeklySeed } from "./seedScenarios";
import { getDailyMeta, getWeeklyMeta } from "./scenarioPriorities";

// Library-specific fetch: returns the entire pool of scenarios per type, ordered
// by priority (Tier 1 first, then Tier 2, then everything else alphabetically).
// Mirrors the supabase-first / TS-seed fallback pattern from lib/scenarios.ts.

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
  return {
    daily: orderByPriority(daily, "daily"),
    weekly: orderByPriority(weekly, "weekly"),
  };
}

function orderByPriority<T extends DailyScenario | WeeklyScenario>(
  pool: T[],
  type: "daily" | "weekly",
): T[] {
  const getMeta = type === "daily" ? getDailyMeta : getWeeklyMeta;
  return [...pool].sort((a, b) => {
    const pa = getMeta(a.id).priority;
    const pb = getMeta(b.id).priority;
    if (pa !== pb) return pa - pb;
    return a.id.localeCompare(b.id);
  });
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
