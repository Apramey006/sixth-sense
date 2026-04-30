import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && anonKey);

// Browser client — persists auth session in localStorage so magic-link sign-in
// survives reloads. Safe to import server-side; we only call its methods from
// "use client" components or route handlers (which create their own clients).
export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        storageKey: "taste-reps:auth",
      },
    })
  : null;

export const supabaseConfig = {
  url: url ?? "",
  anonKey: anonKey ?? "",
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
};
