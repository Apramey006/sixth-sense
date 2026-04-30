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
        subtitle={`Weekly deep rep · ${week}`}
        chapter="A real decision room"
        tone="accent-2"
      />
      <main className="max-w-3xl mx-auto px-5 sm:px-6 pt-8 pb-20">
        <WeeklyRep scenario={scenario} />
      </main>
    </>
  );
}
