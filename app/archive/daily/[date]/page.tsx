import { notFound, redirect } from "next/navigation";
import { Masthead } from "@/components/Masthead";
import { DailyRep } from "@/components/DailyRep";
import { getDailyForDate } from "@/lib/scenarios";
import { todayISO, recentDates, DAILY_ARCHIVE_DAYS } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function ArchiveDailyPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  // Today's rep lives on its own live page.
  if (date === todayISO()) redirect("/today");
  // Only days inside the archive window are doable — same set the list shows.
  if (!recentDates(DAILY_ARCHIVE_DAYS).includes(date)) notFound();

  const scenario = await getDailyForDate(date);
  const formatted = new Date(date + "T00:00:00")
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();

  return (
    <>
      <Masthead
        subtitle={`Daily rep · ${formatted}`}
        chapter="A rep you missed"
        tone="accent"
      />
      <main className="rep-shell mx-auto px-4 sm:px-8 pt-10 sm:pt-14 pb-24">
        <DailyRep scenario={scenario} />
      </main>
    </>
  );
}
