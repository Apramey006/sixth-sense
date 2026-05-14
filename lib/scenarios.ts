import { supabase, supabaseEnabled, type DailyScenario, type WeeklyScenario } from "./supabase";
import { dailySeed, weeklySeed, hashToIndex } from "./seedScenarios";
import { getDailyMeta, getWeeklyMeta } from "./scenarioPriorities";

// Source of truth is Supabase. Falls back to TS seeds when Supabase isn't
// configured, the table is empty, or the fetch fails.
//
// Selection: if a Tier 1 scenario is scheduled for today (or this ISO week),
// surface it. Otherwise rotate deterministically by hash so the experience is
// stable even without explicit scheduling.

export async function getDailyForDate(date: string): Promise<DailyScenario> {
  const pool = await fetchPool<DailyScenario>("daily", dailySeed);

  const scheduled = pool.find((s) => {
    const meta = getDailyMeta(s.id);
    return meta.scheduled_date === date;
  });
  if (scheduled) return { ...scheduled, scheduled_date: date };

  const idx = hashToIndex(date, pool.length);
  return { ...pool[idx], scheduled_date: date };
}

export async function getWeeklyForWeek(week: string): Promise<WeeklyScenario> {
  const pool = await fetchPool<WeeklyScenario>("weekly", weeklySeed);

  const scheduled = pool.find((s) => {
    const meta = getWeeklyMeta(s.id);
    return meta.iso_week === week;
  });
  if (scheduled) return { ...scheduled, iso_week: week };

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
