export function Masthead({
  subtitle,
  chapter,
  tone = "accent",
}: {
  subtitle: string;
  chapter?: string;
  tone?: "accent" | "accent-2";
}) {
  const isWeekly = tone === "accent-2";
  return (
    <div className="rep-masthead">
      <div className="rep-masthead-inner">
        <span className={`rep-masthead-kind ${isWeekly ? "is-weekly" : ""}`}>
          {isWeekly ? "Weekly file" : "Daily file"}
        </span>
        <span className="rep-masthead-dot" aria-hidden>·</span>
        <span className="rep-masthead-date">{subtitle.replace(/^[^·]*·\s*/, "")}</span>
        {chapter && (
          <span className="rep-masthead-chapter">{chapter}</span>
        )}
      </div>
    </div>
  );
}
