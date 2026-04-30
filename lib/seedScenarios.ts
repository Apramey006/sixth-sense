import type { DailyScenario, WeeklyScenario } from "./supabase";

// Fallback content used when Supabase is not configured or returns no rows.
// The canonical source for production is the `scenarios` table in Supabase —
// see lib/scenarios.ts for the fetch logic. These seeds are also the input to
// `npm run seed:supabase`, which writes them into the database on initial setup.

export const dailySeed: DailyScenario[] = [
  {
    id: "linear-keyboard",
    type: "daily",
    scheduled_date: "",
    company: "Linear",
    era: "2019 — early product",
    context:
      "Linear launched into a market dominated by Jira, Asana, and ClickUp — tools that competed on configurability. Linear's first-screen experience pushed almost every action behind a keyboard shortcut, and the onboarding actively taught the shortcuts before showing the GUI.",
    prompt:
      "What is the most interesting choice the team made in this onboarding — and what's the bet beneath it?",
    reveal_quote:
      "We optimized for the daily user, not the first-time user. The cost of a steep first day is a flat curve forever after. Most tools optimize the opposite way and never recover.",
    reveal_quote_attribution: "Karri Saarinen, Linear cofounder, 2021 interview",
    reveal_note:
      "The choice that's easy to miss: Linear was willing to lose users in the first 10 minutes to win the next 10 years. Most PMs would file 'keyboard-shortcut-first onboarding' under UX risk. The team filed it under positioning — the tool selects for users who want a tool that selects for them. The shortcut is the brand.",
  },
  {
    id: "stripe-docs",
    type: "daily",
    scheduled_date: "",
    company: "Stripe",
    era: "2011 — launch",
    context:
      "Stripe's launch homepage was almost entirely code. Seven lines of Ruby, copy-pasteable. No marketing video, no enterprise CTA, no testimonials. Just the integration. PayPal's homepage at the time led with security badges and merchant logos.",
    prompt:
      "What is the most interesting choice the team made on this homepage — and who is it for?",
    reveal_quote:
      "The homepage isn't for buyers. It's for the developer who's going to recommend us to their boss. If the developer can run the code in 30 seconds, the conversation upstream is already over.",
    reveal_quote_attribution: "Patrick Collison, paraphrased from early Stripe interviews",
    reveal_note:
      "The non-obvious move: Stripe inverted the buyer. Payments was sold as a procurement decision; Stripe rebuilt it as a developer decision. The homepage is a recruiting tool aimed at the person inside the customer who will champion you. Most B2B PMs design pages for the person who signs the contract — Stripe designed for the person who picks up the API key.",
  },
  {
    id: "notion-ai-bundle",
    type: "daily",
    scheduled_date: "",
    company: "Notion",
    era: "2023 — Notion AI launch",
    context:
      "Notion launched AI in February 2023 as a $10/user/month add-on rather than baking it into the existing plans. Most competitors (including office-suite incumbents) folded AI into base pricing or made it free for paid users.",
    prompt:
      "What's the most interesting choice in pricing AI as a separate add-on — and what does it tell you about how Notion sees the feature?",
    reveal_quote:
      "If we'd bundled it, we'd never know what people would pay for it. Pricing is a measurement instrument before it's a revenue decision.",
    reveal_quote_attribution: "Notion product team, paraphrased from Lenny's Podcast, 2023",
    reveal_note:
      "What's easy to miss: bundling looks like generosity but throws away the most valuable signal in a feature launch — willingness to pay. Notion treated the $10 line as a research instrument, not a paywall. The result: AI hit $10M ARR in two months, which would have been invisible inside a bundle and would have starved the team of the conviction to invest further.",
  },
];

export const weeklySeed: WeeklyScenario[] = [
  {
    id: "meta-threads-2023",
    type: "weekly",
    iso_week: "",
    company: "Meta",
    era: "Early 2023",
    intro:
      "It is early 2023. You are a senior PM at Meta. Twitter has been acquired by Elon Musk and is in active turmoil — verification chaos, advertiser pullback, mass layoffs, and a steady exodus of the cultural-influencer cohort who made the platform sticky.\n\nMark Zuckerberg's leadership team is debating whether Meta should ship a text-based social app. Internally there is a working prototype built on the Instagram codebase. The Instagram graph is the largest social graph in the Western world (~2B MAU). A text product could in theory bootstrap on it instantly.",
    open_questions: [
      "Tightly couple to Instagram (one-tap signup, IG followers ported in), or stand alone?",
      "What ships at launch? DMs? Hashtags? A chronological feed? A web app?",
      "Is the goal to kill Twitter, complement Instagram, or defend against TikTok absorbing text-social mindshare?",
      "How big is the risk an obvious Twitter-clone gets dismissed by users and press as derivative?",
    ],
    closing: "Imagine you're in the room. You don't yet know what they decided or how it played out.",
    decision:
      "Ship as a tightly-coupled extension of Instagram. One-tap signup with IG credentials. IG followers auto-suggested. Built and shipped by the IG team in roughly five months. Deliberately omitted at launch: DMs, hashtags, trending topics, web app, chronological feed default, following-only feed, ability to delete Threads without deleting Instagram.",
    pullquote:
      "Not to replace Twitter, but to build a public square for communities on Instagram that never really embraced Twitter.",
    pullquote_attribution: "Adam Mosseri, July 2023",
    outcomes: [
      { stat: "100M", label: "signups in 5 days — fastest consumer launch ever" },
      { stat: "−80%", label: "DAU within 3 weeks of launch", accent: true },
      { stat: "12 mo", label: "deliberate slow rollout: web, search, hashtags, following feed" },
      { stat: "~150M", label: "MAU by end of 2024 — durable growth, not retention curve" },
    ],
    tradeoffs: [
      {
        title: "Speed-to-market vs. product polish",
        body:
          "Meta knew the launch product was thin. They optimized for shipping during Twitter's instability window — a market-timing call, not a product-completeness call.",
      },
      {
        title: "Growth-hack coupling vs. user trust",
        body:
          "The IG-account lock-in was a deliberate growth lever they expected to reverse. They ate the trust hit on purpose because the alternative was a much slower S-curve.",
      },
      {
        title: "'Defend' framing vs. 'kill Twitter' framing",
        body:
          "The actual goal was defensive — keep text-social inside the Meta ecosystem rather than let X or TikTok own it. The Twitter-killer narrative was press, not strategy.",
      },
      {
        title: "Retention-now vs. retention-later",
        body:
          "They explicitly tolerated the DAU collapse. The internal metric that mattered was 6-month and 12-month retained MAU, not week-1 DAU.",
      },
    ],
    per_dimension_truth: {
      tradeoff:
        "Speed-to-market and ecosystem defense vs. product depth. They sacrificed launch-week retention and user trust to ship inside Twitter's instability window.",
      user:
        "Existing Instagram users who were curious about text social but had never adopted Twitter — explicitly not the existing Twitter power-user cohort.",
      alt:
        "Decoupled launch with DMs and a web app would have shipped slower and lost the timing window. Meta chose the opposite trade.",
      predict:
        "Massive launch-week numbers, fast collapse, then slow durable growth — a 12-month bet, not a 12-week one.",
    },
  },
  {
    id: "shopify-shop-2020",
    type: "weekly",
    iso_week: "",
    company: "Shopify",
    era: "Early 2020",
    intro:
      "It is early 2020. You are a senior PM at Shopify. The company has spent a decade building infrastructure for merchants — Shopify is the picks-and-shovels of e-commerce, deliberately not consumer-facing.\n\nLeadership is debating launching Shop, a consumer mobile app for tracking orders across all Shopify merchants. It would put Shopify directly in front of end-shoppers for the first time. Some inside the company argue it's a betrayal of the merchant-first promise. Others argue Amazon is going to eat every Shopify merchant alive if shoppers don't have a unified buying surface outside Amazon.",
    open_questions: [
      "Does building a consumer app cannibalize merchant brand? The whole pitch is 'your store, not ours.'",
      "If shoppers see 'Shop' as the brand, do merchants become commoditized fulfillment behind it?",
      "Is the alternative — letting Amazon own discovery — actually worse for merchants?",
      "What does 'success' look like for a product whose users are not your customers?",
    ],
    closing: "Imagine you're in that strategy room. You don't yet know what they decide.",
    decision:
      "Ship Shop as a consumer app, but design it to elevate the merchant brand, not Shopify's. Each merchant page in the app is fully merchant-branded. Shopify's logo is nearly invisible in-app. The app's core feature is package tracking — a real shopper need that has nothing to do with merchant identity. Discovery and recommendations were added cautiously over the next two years.",
    pullquote:
      "The app doesn't make Shopify the brand. It makes Shopify invisible — which is the only way merchants will tolerate us being in front of their customers.",
    pullquote_attribution: "Tobi Lütke, paraphrased from public commentary, 2020-21",
    outcomes: [
      { stat: "100M+", label: "Shop app downloads by 2023" },
      { stat: "Low", label: "Merchant churn from Shop launch — concerns didn't materialize", accent: true },
      { stat: "2 yrs", label: "Shopify deliberately delayed building strong recommendations" },
      { stat: "$200M+", label: "GMV processed through Shop Pay weekly by 2023" },
    ],
    tradeoffs: [
      {
        title: "Brand neutrality vs. brand visibility",
        body:
          "Shopify deliberately made itself invisible inside the app. The cost: weaker direct brand recall with shoppers. The benefit: merchants didn't revolt.",
      },
      {
        title: "Tracking-as-Trojan-horse",
        body:
          "Package tracking is the most-checked feature in any shopper's life. Shopify used the most boring use case as the wedge into a consumer relationship.",
      },
      {
        title: "Defensive vs. offensive framing",
        body:
          "Externally Shop looked like aggression. Internally it was framed as defense against Amazon owning discovery. The framing shaped what got built and what didn't.",
      },
      {
        title: "Restraint as moat",
        body:
          "The team explicitly held back on personalized recommendations for two years. The discipline preserved merchant trust in a way a faster, AI-driven discovery push would have torched.",
      },
    ],
    per_dimension_truth: {
      tradeoff:
        "Defense against Amazon's discovery monopoly vs. risking the merchant-first brand promise. Resolved by making Shopify invisible inside the consumer app.",
      user:
        "Shoppers who already buy from Shopify merchants and need package tracking — not new customer acquisition. The merchant is still the brand the shopper experiences.",
      alt:
        "A heavily Shopify-branded consumer app with strong recommendations would have driven faster consumer engagement and triggered merchant revolt. They chose restraint.",
      predict:
        "Slow consumer adoption initially, durable growth as Shop Pay became the actual flywheel — payments embedded across the merchant network.",
    },
  },
];

export function hashToIndex(s: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}
