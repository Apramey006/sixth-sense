import { Masthead } from "@/components/Masthead";
import { DailyRep } from "@/components/DailyRep";
import { getDailyForDate } from "@/lib/scenarios";
import { todayISO } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const date = todayISO();
  const scenario = await getDailyForDate(date);
  const formatted = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return (
    <>
      <Masthead subtitle={`Daily rep · ${formatted}`} tone="accent" />
      <main className="max-w-3xl mx-auto px-5 sm:px-6 pt-8 pb-20">
        <DailyRep scenario={scenario} />
      </main>
    </>
  );
}
