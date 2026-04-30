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
      <Masthead subtitle={`Weekly Deep Rep · ${week}`} chapter="I · Scenario" />
      <main className="max-w-3xl mx-auto px-6 pt-14 pb-24">
        <WeeklyRep scenario={scenario} />
      </main>
    </>
  );
}
