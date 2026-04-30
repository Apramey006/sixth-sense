import { Masthead } from "@/components/Masthead";
import { LibraryGrid } from "@/components/LibraryGrid";
import { getAllScenarios } from "@/lib/library";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const { daily, weekly } = await getAllScenarios();

  const items = [
    ...daily.map((s) => ({
      id: s.id,
      kind: "daily" as const,
      company: s.company,
      era: s.era,
      excerpt: s.context,
    })),
    ...weekly.map((s) => ({
      id: s.id,
      kind: "weekly" as const,
      company: s.company,
      era: s.era,
      excerpt: s.intro,
    })),
  ];

  return (
    <>
      <Masthead subtitle="Library · the catalog" chapter="" />
      <main className="max-w-3xl mx-auto px-6 pt-12 pb-24">
        <div className="chapter text-base mb-3" style={{ color: "var(--ink-soft)" }}>
          Every rep, in one place
        </div>
        <h1
          className="serif text-4xl sm:text-5xl leading-[1.08] mb-5"
          style={{ fontWeight: 500, letterSpacing: "-0.015em" }}
        >
          The library.
        </h1>
        <p
          className="serif text-lg leading-relaxed mb-10"
          style={{ color: "var(--ink-soft)" }}
        >
          Browse the full catalog of reps — every daily moment and weekly deep scenario in
          rotation. Today's rep and this week's deep rep are picked for you; this is the index of
          what exists. Pick a rep type below to drill in.
        </p>

        <div className="rule mb-7" />

        <LibraryGrid items={items} />
      </main>
    </>
  );
}
