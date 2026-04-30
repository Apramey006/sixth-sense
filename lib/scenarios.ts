import { supabase, supabaseEnabled, type DailyScenario, type WeeklyScenario } from "./supabase";
import { dailySeed, weeklySeed, hashToIndex } from "./seedScenarios";

// Source of truth is Supabase. Falls back to TS seeds when:
//   - Supabase isn't configured (local dev without .env.local)
//   - The scenarios table is empty
//   - The fetch fails for any reason
//
// Rotation is deterministic by hash of date / ISO week, so the experience is stable
// even if scenarios are added live without explicit scheduling.

export async function getDailyForDate(date: string): Promise<DailyScenario> {
  const pool = await fetchPool<DailyScenario>("daily", dailySeed);
  const idx = hashToIndex(date, pool.length);
  return { ...pool[idx], scheduled_date: date };
}

export async function getWeeklyForWeek(week: string): Promise<WeeklyScenario> {
  const pool = await fetchPool<WeeklyScenario>("weekly", weeklySeed);
  const idx = hashToIndex(week, pool.length);
  return { ...pool[idx], iso_week: week };
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
      if (error) console.warn(`scenarios fetch (${type}) failed, using seed:`, error.message);
      return fallback;
    }

    return data.map((row) => row.payload as T);
  } catch (e) {
    console.warn(`scenarios fetch (${type}) threw, using seed:`, e);
    return fallback;
  }
}
