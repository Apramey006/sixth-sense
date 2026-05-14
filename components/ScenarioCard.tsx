import Link from "next/link";

type CardProps = {
  kind: "daily" | "weekly";
  company: string;
  era: string;
  excerpt: string;
  featured?: boolean;
};

function truncate(s: string, n = 180): string {
  const flat = s.replace(/\s+/g, " ").trim();
  if (flat.length <= n) return flat;
  return flat.slice(0, n - 1).replace(/[ ,;:.!?-]+$/, "") + "…";
}

export function ScenarioCard({ kind, company, era, excerpt, featured }: CardProps) {
  const href = kind === "daily" ? "/today" : "/this-week";
  const cta = kind === "daily" ? "Take today's daily" : "Take this week's deep rep";
  const badge = kind === "daily" ? "Daily · ~3 min" : "Weekly · ~25 min";
  const badgeColor = kind === "daily" ? "var(--accent)" : "var(--ink)";

  return (
    <article
      className="border rounded-md p-5 flex flex-col h-full"
      style={{
        borderColor: featured ? "var(--accent)" : "var(--rule)",
        background: "var(--paper-raised)",
      }}
    >
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="smallcaps" style={{ color: badgeColor }}>
            {badge}
          </span>
          {featured && (
            <span
              className="smallcaps px-2 py-0.5 rounded-full"
              style={{
                background: "var(--accent)",
                color: "#fafaf9",
                fontSize: "0.65rem",
              }}
            >
              Featured
            </span>
          )}
        </div>
        <span className="smallcaps" style={{ color: "var(--ink-soft)" }}>
          {era}
        </span>
      </div>
      <h3 className="serif text-2xl leading-tight mb-2" style={{ fontWeight: 500 }}>
        {company}
      </h3>
      <p
        className="serif text-base leading-relaxed flex-1"
        style={{ color: "var(--ink-soft)" }}
      >
        {truncate(excerpt)}
      </p>
      <div
        className="mt-4 pt-3 border-t flex items-center justify-between"
        style={{ borderColor: "var(--rule)" }}
      >
        <Link
          href={href}
          className="smallcaps hover:underline"
          style={{ color: "var(--ink)" }}
        >
          {cta} →
        </Link>
      </div>
    </article>
  );
}
