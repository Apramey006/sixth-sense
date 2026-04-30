import Link from "next/link";

export function Masthead({ subtitle, chapter }: { subtitle: string; chapter?: string }) {
  return (
    <div className="border-b" style={{ borderColor: "var(--rule)" }}>
      <div className="max-w-3xl mx-auto px-6 py-5 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <Link href="/" className="serif text-lg font-medium hover:opacity-70 transition">
            Taste Reps
          </Link>
          <div className="smallcaps" style={{ color: "var(--ink-soft)" }}>
            {subtitle}
          </div>
        </div>
        {chapter && (
          <div className="smallcaps hidden sm:block" style={{ color: "var(--ink-soft)" }}>
            {chapter}
          </div>
        )}
      </div>
    </div>
  );
}
