import { ArchiveBoard, type ArchiveItem } from "@/components/ArchiveBoard";
import { getDailyForDate, getWeeklyForWeek } from "@/lib/scenarios";
import {
  recentDates,
  recentISOWeeks,
  isoWeekToMonday,
  DAILY_ARCHIVE_DAYS,
  WEEKLY_ARCHIVE_WEEKS,
} from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const dates = recentDates(DAILY_ARCHIVE_DAYS);
  const weeks = recentISOWeeks(WEEKLY_ARCHIVE_WEEKS);

  const [daily, weekly] = await Promise.all([
    Promise.all(
      dates.map(async (date): Promise<ArchiveItem> => {
        const s = await getDailyForDate(date);
        return {
          kind: "daily",
          key: date,
          target_date: date,
          scenario_id: s.id,
          company: s.company,
          era: s.era,
          href: `/archive/daily/${date}`,
        };
      }),
    ),
    Promise.all(
      weeks.map(async (week): Promise<ArchiveItem> => {
        const s = await getWeeklyForWeek(week);
        return {
          kind: "weekly",
          key: week,
          target_date: isoWeekToMonday(week),
          scenario_id: s.id,
          company: s.company,
          era: s.era,
          href: `/archive/weekly/${week}`,
        };
      }),
    ),
  ]);

  return (
    <main className="cabinet-shell mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-24">
      <header className="cabinet-strip">
        <span className="cabinet-strip-label">Back issues</span>
        <span className="dot" aria-hidden>·</span>
        <span>{dates.length} days</span>
        <span className="dot" aria-hidden>·</span>
        <span>{weeks.length} weeks</span>
        <span className="dateline">The reps you missed are still doable</span>
      </header>

      <section className="cabinet-hero">
        <h1 className="cabinet-title">The archive.</h1>
        <p className="cabinet-deck">
          Forgot a day? Every past rep is here — {dates.length} daily moments and{" "}
          {weeks.length} weekly rooms. Do the ones you missed and they file
          straight into your reps.
        </p>
      </section>
      <ArchiveBoard daily={daily} weekly={weekly} />
    </main>
  );
}
