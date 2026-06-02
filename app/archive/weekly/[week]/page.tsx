import { notFound, redirect } from "next/navigation";
import { Masthead } from "@/components/Masthead";
import { WeeklyRep } from "@/components/WeeklyRep";
import { getWeeklyForWeek } from "@/lib/scenarios";
import { currentISOWeek, recentISOWeeks, WEEKLY_ARCHIVE_WEEKS } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function ArchiveWeeklyPage({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const { week } = await params;

  // This week's rep lives on its own live page.
  if (week === currentISOWeek()) redirect("/this-week");
  // Only weeks inside the archive window are doable — same set the list shows.
  if (!recentISOWeeks(WEEKLY_ARCHIVE_WEEKS).includes(week)) notFound();

  const scenario = await getWeeklyForWeek(week);

  return (
    <>
      <Masthead
        subtitle={`Weekly rep · ${week}`}
        chapter="A decision room you missed"
        tone="accent-2"
      />
      <main className="rep-shell mx-auto px-4 sm:px-8 pt-10 sm:pt-14 pb-24">
        <WeeklyRep scenario={scenario} />
      </main>
    </>
  );
}
