import { Masthead } from "@/components/Masthead";
import { WeeklyRep } from "@/components/WeeklyRep";
import { pickWeekly } from "@/lib/seedScenarios";
import { currentISOWeek } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default function ThisWeekPage() {
  const week = currentISOWeek();
  const scenario = pickWeekly(week);
  return (
    <>
      <Masthead subtitle={`Weekly Deep Rep · ${week}`} chapter="I · Scenario" />
      <main className="max-w-3xl mx-auto px-6 pt-14 pb-24">
        <WeeklyRep scenario={scenario} />
      </main>
    </>
  );
}
