import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && anonKey);

// On the client we use createBrowserClient from @supabase/ssr so the PKCE
// verifier lives in cookies — that way the /auth/callback server route can
// finish the OAuth + email-confirmation handshake. On the server (RSC, route
// handlers reading scenarios) we use a plain createClient since these reads
// don't need an authed session.
export const supabase: SupabaseClient | null = supabaseEnabled
  ? typeof window !== "undefined"
    ? (createBrowserClient(url!, anonKey!) as SupabaseClient)
    : createClient(url!, anonKey!, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
  : null;

export const supabaseConfig = {
  url: url ?? "",
  anonKey: anonKey ?? "",
};

// Metadata shared by every scenario. Required so the validation pipeline can
// run source-presence and diversity checks against the full pool.
export type ScenarioSource = {
  title: string;
  url: string;
  publisher?: string;
  year?: number;
  type:
    | "interview"
    | "podcast"
    | "article"
    | "book"
    | "blog"
    | "talk"
    | "filing"
    | "tweet"
    | "video"
    | "documentation"
    | "press-release";
};

export type ScenarioRegion = "us" | "uk" | "eu" | "asia" | "latam" | "africa" | "anz" | "global";
export type ScenarioDecade = "1990s" | "2000s" | "2010s" | "2020s";

export type ScenarioTags = {
  // Free string against an allowlist enforced by scripts/validate-scenarios.ts.
  industry: string;
  region: ScenarioRegion;
  decade: ScenarioDecade;
};

export type DailyScenario = {
  id: string;
  type: "daily";
  scheduled_date: string;
  company: string;
  era: string;
  context: string;
  prompt: string;
  reveal_quote: string;
  reveal_quote_attribution: string;
  reveal_note: string;
  quote_type: "verbatim" | "paraphrased";
  sources: ScenarioSource[];
  tags: ScenarioTags;
  priority?: number;
  featured?: boolean;
};

export type WeeklyScenario = {
  id: string;
  type: "weekly";
  iso_week: string;
  company: string;
  era: string;
  intro: string;
  open_questions: string[];
  closing: string;
  decision: string;
  pullquote: string;
  pullquote_attribution: string;
  outcomes: { stat: string; label: string; accent?: boolean }[];
  tradeoffs: { title: string; body: string }[];
  per_dimension_truth: { tradeoff: string; user: string; alt: string; predict: string };
  quote_type: "verbatim" | "paraphrased";
  sources: ScenarioSource[];
  tags: ScenarioTags;
  priority?: number;
  featured?: boolean;
};
