export function Masthead({
  subtitle,
  chapter,
  tone = "accent",
}: {
  subtitle: string;
  chapter?: string;
  tone?: "accent" | "accent-2";
}) {
  const dotColor = tone === "accent-2" ? "var(--accent-2)" : "var(--accent)";
  return (
    <div
      className="border-b"
      style={{ borderColor: "var(--rule)", background: "var(--paper)" }}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden
            className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: dotColor }}
          />
          <div
            className="text-xs font-medium truncate"
            style={{ color: "var(--ink-soft)", letterSpacing: "-0.005em" }}
          >
            {subtitle}
          </div>
        </div>
        {chapter && (
          <div className="smallcaps hidden sm:block" style={{ color: "var(--ink-mute)" }}>
            {chapter}
          </div>
        )}
      </div>
    </div>
  );
}
