import { dailySeed, weeklySeed } from "../lib/seedScenarios";
import type {
  DailyScenario,
  ScenarioSource,
  ScenarioTags,
  WeeklyScenario,
} from "../lib/supabase";

// Validation pipeline for the scenario pool. Three independent checks:
//   1. Structural lint   — required fields, length bounds, ID format, no placeholders.
//   2. Source presence   — every scenario has ≥1 well-formed source URL + recognised type.
//   3. Diversity report  — flags over-representation of any industry/region/decade
//                          against the configured share thresholds.
//
// Exit code is non-zero if any structural or source error is found. Diversity is
// reported as warnings only — the pool will frequently fail diversity early in
// the rollout, but should never fail it at launch.

// ─── allowlists ──────────────────────────────────────────────────────────────

const INDUSTRY_ALLOWLIST = new Set([
  "saas",
  "consumer-social",
  "consumer-mobile",
  "fintech",
  "marketplace",
  "ecommerce",
  "hardware",
  "infra",
  "devtools",
  "ai-tools",
  "media",
  "gaming",
  "productivity",
  "search",
  "logistics",
  "transportation",
  "food-delivery",
  "travel",
  "health",
  "education",
  "enterprise",
  "creator-economy",
  "music",
  "video",
  "communication",
  "security",
  "robotics",
  "biotech",
  "energy",
]);

const REGION_ALLOWLIST = new Set(["us", "uk", "eu", "asia", "latam", "africa", "anz", "global"]);
const DECADE_ALLOWLIST = new Set(["1990s", "2000s", "2010s", "2020s"]);
const QUOTE_TYPE_ALLOWLIST = new Set(["verbatim", "paraphrased"]);
const SOURCE_TYPE_ALLOWLIST = new Set([
  "interview",
  "podcast",
  "article",
  "book",
  "blog",
  "talk",
  "filing",
  "tweet",
  "video",
  "documentation",
  "press-release",
]);

// ─── thresholds ──────────────────────────────────────────────────────────────

// Any single industry / region / decade above this share triggers a warning.
// US-heavy and 2010s/2020s-heavy is the editorial preference — most relevant
// product-decisions the audience will encounter happen there. Diversity is a
// floor (some non-US, some pre-2010s for foundational examples), not a ceiling.
const DIVERSITY_MAX_SHARE = {
  industry: 0.35,
  region: 0.9,
  decade: 0.85,
};

// Field length bounds. Tight enough to catch slop, loose enough not to thrash.
const BOUNDS = {
  company: { min: 2, max: 60 },
  era: { min: 4, max: 80 },
  daily: {
    context: { min: 120, max: 800 },
    prompt: { min: 20, max: 240 },
    reveal_quote: { min: 30, max: 600 },
    reveal_quote_attribution: { min: 5, max: 200 },
    reveal_note: { min: 120, max: 900 },
  },
  weekly: {
    intro: { min: 200, max: 2000 },
    open_questions_each: { min: 20, max: 280 },
    closing: { min: 20, max: 300 },
    decision: { min: 100, max: 1200 },
    pullquote: { min: 20, max: 400 },
    pullquote_attribution: { min: 5, max: 200 },
    tradeoff_title: { min: 6, max: 80 },
    tradeoff_body: { min: 80, max: 600 },
    per_dim_each: { min: 60, max: 500 },
    outcome_stat: { min: 1, max: 16 },
    outcome_label: { min: 6, max: 120 },
  },
  weekly_counts: {
    open_questions: { min: 3, max: 5 },
    tradeoffs: { min: 3, max: 5 },
    outcomes: { min: 3, max: 6 },
  },
};

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PLACEHOLDER_PATTERNS = [/\bTODO\b/i, /\bTBD\b/i, /Lorem ipsum/i, /\bFIXME\b/i, /\bXXX\b/];

// ─── result accumulator ──────────────────────────────────────────────────────

type Issue = { scenarioId: string; field: string; message: string };

class Report {
  errors: Issue[] = [];
  warnings: Issue[] = [];
  err(scenarioId: string, field: string, message: string) {
    this.errors.push({ scenarioId, field, message });
  }
  warn(scenarioId: string, field: string, message: string) {
    this.warnings.push({ scenarioId, field, message });
  }
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function checkString(
  report: Report,
  id: string,
  field: string,
  value: unknown,
  bounds: { min: number; max: number },
) {
  if (typeof value !== "string") {
    report.err(id, field, `expected string, got ${typeof value}`);
    return;
  }
  if (value.length < bounds.min) {
    report.err(id, field, `length ${value.length} < min ${bounds.min}`);
  }
  if (value.length > bounds.max) {
    report.err(id, field, `length ${value.length} > max ${bounds.max}`);
  }
  for (const pat of PLACEHOLDER_PATTERNS) {
    if (pat.test(value)) {
      report.err(id, field, `placeholder text matched: ${pat}`);
    }
  }
}

function checkTags(report: Report, id: string, tags: ScenarioTags | undefined) {
  if (!tags || typeof tags !== "object") {
    report.err(id, "tags", "missing tags object");
    return;
  }
  if (!INDUSTRY_ALLOWLIST.has(tags.industry)) {
    report.err(
      id,
      "tags.industry",
      `"${tags.industry}" not in allowlist (add to INDUSTRY_ALLOWLIST if intentional)`,
    );
  }
  if (!REGION_ALLOWLIST.has(tags.region)) {
    report.err(id, "tags.region", `"${tags.region}" not in allowlist`);
  }
  if (!DECADE_ALLOWLIST.has(tags.decade)) {
    report.err(id, "tags.decade", `"${tags.decade}" not in allowlist`);
  }
}

function checkSources(report: Report, id: string, sources: ScenarioSource[] | undefined) {
  if (!Array.isArray(sources) || sources.length === 0) {
    report.err(id, "sources", "must include at least one source");
    return;
  }
  sources.forEach((src, i) => {
    const where = `sources[${i}]`;
    if (!src.title || typeof src.title !== "string" || src.title.length < 3) {
      report.err(id, `${where}.title`, "missing or too short");
    }
    if (!src.url || typeof src.url !== "string") {
      report.err(id, `${where}.url`, "missing");
      return;
    }
    try {
      const u = new URL(src.url);
      if (u.protocol !== "https:" && u.protocol !== "http:") {
        report.err(id, `${where}.url`, `unsupported protocol ${u.protocol}`);
      }
    } catch {
      report.err(id, `${where}.url`, `malformed URL: ${src.url}`);
    }
    if (!SOURCE_TYPE_ALLOWLIST.has(src.type)) {
      report.err(id, `${where}.type`, `"${src.type}" not in allowlist`);
    }
    if (src.year !== undefined) {
      if (!Number.isInteger(src.year) || src.year < 1990 || src.year > 2030) {
        report.err(id, `${where}.year`, `implausible year ${src.year}`);
      }
    }
  });
}

function checkQuoteType(report: Report, id: string, quoteType: string | undefined) {
  if (!quoteType || !QUOTE_TYPE_ALLOWLIST.has(quoteType)) {
    report.err(id, "quote_type", `must be "verbatim" or "paraphrased", got "${quoteType}"`);
  }
}

// ─── per-format checks ───────────────────────────────────────────────────────

function checkDaily(report: Report, s: DailyScenario) {
  if (!ID_PATTERN.test(s.id)) report.err(s.id, "id", `does not match ${ID_PATTERN}`);
  if (s.type !== "daily") report.err(s.id, "type", `expected "daily", got "${s.type}"`);
  checkString(report, s.id, "company", s.company, BOUNDS.company);
  checkString(report, s.id, "era", s.era, BOUNDS.era);
  checkString(report, s.id, "context", s.context, BOUNDS.daily.context);
  checkString(report, s.id, "prompt", s.prompt, BOUNDS.daily.prompt);
  if (typeof s.prompt === "string" && !s.prompt.trim().endsWith("?")) {
    report.err(s.id, "prompt", "must end with '?'");
  }
  checkString(report, s.id, "reveal_quote", s.reveal_quote, BOUNDS.daily.reveal_quote);
  checkString(
    report,
    s.id,
    "reveal_quote_attribution",
    s.reveal_quote_attribution,
    BOUNDS.daily.reveal_quote_attribution,
  );
  checkString(report, s.id, "reveal_note", s.reveal_note, BOUNDS.daily.reveal_note);
  checkQuoteType(report, s.id, s.quote_type);
  checkSources(report, s.id, s.sources);
  checkTags(report, s.id, s.tags);

  // Paraphrased quotes must say so in the attribution to avoid implying verbatim.
  if (s.quote_type === "paraphrased" && typeof s.reveal_quote_attribution === "string") {
    if (!/paraphras/i.test(s.reveal_quote_attribution)) {
      report.err(
        s.id,
        "reveal_quote_attribution",
        "paraphrased quote_type but attribution does not mention 'paraphrased'",
      );
    }
  }
}

function checkWeekly(report: Report, s: WeeklyScenario) {
  if (!ID_PATTERN.test(s.id)) report.err(s.id, "id", `does not match ${ID_PATTERN}`);
  if (s.type !== "weekly") report.err(s.id, "type", `expected "weekly", got "${s.type}"`);
  checkString(report, s.id, "company", s.company, BOUNDS.company);
  checkString(report, s.id, "era", s.era, BOUNDS.era);
  checkString(report, s.id, "intro", s.intro, BOUNDS.weekly.intro);
  checkString(report, s.id, "closing", s.closing, BOUNDS.weekly.closing);
  checkString(report, s.id, "decision", s.decision, BOUNDS.weekly.decision);
  checkString(report, s.id, "pullquote", s.pullquote, BOUNDS.weekly.pullquote);
  checkString(
    report,
    s.id,
    "pullquote_attribution",
    s.pullquote_attribution,
    BOUNDS.weekly.pullquote_attribution,
  );

  if (
    !Array.isArray(s.open_questions) ||
    s.open_questions.length < BOUNDS.weekly_counts.open_questions.min ||
    s.open_questions.length > BOUNDS.weekly_counts.open_questions.max
  ) {
    report.err(
      s.id,
      "open_questions",
      `length ${s.open_questions?.length} outside [${BOUNDS.weekly_counts.open_questions.min}, ${BOUNDS.weekly_counts.open_questions.max}]`,
    );
  } else {
    s.open_questions.forEach((q, i) =>
      checkString(report, s.id, `open_questions[${i}]`, q, BOUNDS.weekly.open_questions_each),
    );
  }

  if (
    !Array.isArray(s.tradeoffs) ||
    s.tradeoffs.length < BOUNDS.weekly_counts.tradeoffs.min ||
    s.tradeoffs.length > BOUNDS.weekly_counts.tradeoffs.max
  ) {
    report.err(
      s.id,
      "tradeoffs",
      `length ${s.tradeoffs?.length} outside [${BOUNDS.weekly_counts.tradeoffs.min}, ${BOUNDS.weekly_counts.tradeoffs.max}]`,
    );
  } else {
    s.tradeoffs.forEach((t, i) => {
      checkString(report, s.id, `tradeoffs[${i}].title`, t.title, BOUNDS.weekly.tradeoff_title);
      checkString(report, s.id, `tradeoffs[${i}].body`, t.body, BOUNDS.weekly.tradeoff_body);
    });
  }

  if (
    !Array.isArray(s.outcomes) ||
    s.outcomes.length < BOUNDS.weekly_counts.outcomes.min ||
    s.outcomes.length > BOUNDS.weekly_counts.outcomes.max
  ) {
    report.err(
      s.id,
      "outcomes",
      `length ${s.outcomes?.length} outside [${BOUNDS.weekly_counts.outcomes.min}, ${BOUNDS.weekly_counts.outcomes.max}]`,
    );
  } else {
    s.outcomes.forEach((o, i) => {
      checkString(report, s.id, `outcomes[${i}].stat`, o.stat, BOUNDS.weekly.outcome_stat);
      checkString(report, s.id, `outcomes[${i}].label`, o.label, BOUNDS.weekly.outcome_label);
    });
  }

  if (!s.per_dimension_truth || typeof s.per_dimension_truth !== "object") {
    report.err(s.id, "per_dimension_truth", "missing");
  } else {
    (["tradeoff", "user", "alt", "predict"] as const).forEach((k) =>
      checkString(
        report,
        s.id,
        `per_dimension_truth.${k}`,
        s.per_dimension_truth[k],
        BOUNDS.weekly.per_dim_each,
      ),
    );
  }

  checkQuoteType(report, s.id, s.quote_type);
  checkSources(report, s.id, s.sources);
  checkTags(report, s.id, s.tags);

  if (s.quote_type === "paraphrased" && typeof s.pullquote_attribution === "string") {
    if (!/paraphras/i.test(s.pullquote_attribution)) {
      report.err(
        s.id,
        "pullquote_attribution",
        "paraphrased quote_type but attribution does not mention 'paraphrased'",
      );
    }
  }
}

// ─── cross-cutting checks ────────────────────────────────────────────────────

function checkUniqueIds(report: Report, all: { id: string }[]) {
  const seen = new Map<string, number>();
  for (const s of all) {
    seen.set(s.id, (seen.get(s.id) ?? 0) + 1);
  }
  for (const [id, count] of seen) {
    if (count > 1) report.err(id, "id", `duplicated ${count} times`);
  }
}

// ─── diversity ───────────────────────────────────────────────────────────────

function diversityReport(
  label: string,
  scenarios: { id: string; tags?: ScenarioTags }[],
): { warnings: string[]; summary: string } {
  const tally = (key: keyof ScenarioTags) => {
    const counts = new Map<string, number>();
    for (const s of scenarios) {
      const v = s.tags?.[key] ?? "(missing)";
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    return counts;
  };

  const lines: string[] = [`\n${label} diversity (${scenarios.length} scenarios):`];
  const warnings: string[] = [];

  for (const key of ["industry", "region", "decade"] as const) {
    const counts = tally(key);
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const max = DIVERSITY_MAX_SHARE[key];
    lines.push(`  ${key}:`);
    for (const [v, n] of sorted) {
      const share = n / scenarios.length;
      const pct = (share * 100).toFixed(1);
      const flag = share > max ? "  ⚠ over share threshold" : "";
      lines.push(`    ${v.padEnd(20)} ${String(n).padStart(3)}  (${pct}%)${flag}`);
      if (share > max) {
        warnings.push(`${label}.${key}: "${v}" is ${pct}% of pool (max ${(max * 100).toFixed(0)}%)`);
      }
    }
  }
  return { warnings, summary: lines.join("\n") };
}

// ─── main ────────────────────────────────────────────────────────────────────

function main() {
  const report = new Report();

  dailySeed.forEach((s) => checkDaily(report, s));
  weeklySeed.forEach((s) => checkWeekly(report, s));
  checkUniqueIds(report, [...dailySeed, ...weeklySeed]);

  const dailyDiv = diversityReport("daily", dailySeed);
  const weeklyDiv = diversityReport("weekly", weeklySeed);

  console.log(`Scenario validation`);
  console.log(`───────────────────`);
  console.log(`Daily:  ${dailySeed.length} scenarios`);
  console.log(`Weekly: ${weeklySeed.length} scenarios`);

  if (report.errors.length === 0) {
    console.log(`\n✓ Structural + source checks passed`);
  } else {
    console.log(`\n✗ ${report.errors.length} error(s):`);
    for (const e of report.errors) {
      console.log(`  [${e.scenarioId}] ${e.field}: ${e.message}`);
    }
  }

  console.log(dailyDiv.summary);
  console.log(weeklyDiv.summary);

  const divWarnings = [...dailyDiv.warnings, ...weeklyDiv.warnings];
  if (divWarnings.length > 0) {
    console.log(`\n⚠ ${divWarnings.length} diversity warning(s):`);
    for (const w of divWarnings) console.log(`  ${w}`);
  } else {
    console.log(`\n✓ Diversity within thresholds`);
  }

  // Launch readiness summary against target pool sizes.
  const DAILY_TARGET = 500;
  const WEEKLY_TARGET = 80;
  console.log(`\nLaunch readiness`);
  console.log(`  daily:  ${dailySeed.length}/${DAILY_TARGET} (${dailySeed.length - DAILY_TARGET} to go)`);
  console.log(`  weekly: ${weeklySeed.length}/${WEEKLY_TARGET} (${weeklySeed.length - WEEKLY_TARGET} to go)`);

  if (report.errors.length > 0) process.exit(1);
}

main();
