import { Masthead } from "@/components/Masthead";
import { DailyRep } from "@/components/DailyRep";
import { getDailyForDate } from "@/lib/scenarios";
import { todayISO } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const date = todayISO();
  const scenario = await getDailyForDate(date);
  const formatted = new Date(date + "T00:00:00")
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
  return (
    <>
      <Masthead subtitle={`Daily rep · ${formatted}`} chapter="A three-minute rep" tone="accent" />
      <main className="rep-shell mx-auto px-4 sm:px-8 pt-10 sm:pt-14 pb-24">
        <DailyRep scenario={scenario} />
      </main>
    </>
  );
}
