import { Masthead } from "@/components/Masthead";
import { WeeklyRep } from "@/components/WeeklyRep";
import { getWeeklyForWeek } from "@/lib/scenarios";
import { currentISOWeek } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function ThisWeekPage() {
  const week = currentISOWeek();
  const scenario = await getWeeklyForWeek(week);
  return (
    <>
      <Masthead
        subtitle={`Weekly rep · ${week}`}
        chapter="A real decision room"
        tone="accent-2"
      />
      <main className="rep-shell mx-auto px-4 sm:px-8 pt-10 sm:pt-14 pb-24">
        <WeeklyRep scenario={scenario} />
      </main>
    </>
  );
}
