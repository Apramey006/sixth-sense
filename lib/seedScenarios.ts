import type { DailyScenario, WeeklyScenario } from "./supabase";

// Fallback content used when Supabase is not configured or returns no rows.
// The canonical source for production is the `scenarios` table in Supabase —
// see lib/scenarios.ts for the fetch logic. These seeds are also the input to
// `npm run seed:supabase`, which writes them into the database on initial setup.
//
// Every scenario MUST carry: `quote_type` ("verbatim" | "paraphrased"),
// at least one `sources` entry with a real URL, and `tags` {industry, region, decade}.
// Run `npm run validate:scenarios` to verify structural integrity, source presence,
// and diversity before regenerating supabase/seed.sql with `npm run gen:seed`.

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
    reveal_quote_attribution:
      "Karri Saarinen, Linear cofounder/CEO — paraphrased from public interviews",
    reveal_note:
      "The choice that's easy to miss: Linear was willing to lose users in the first 10 minutes to win the next 10 years. Most PMs would file 'keyboard-shortcut-first onboarding' under UX risk. The team filed it under positioning — the tool selects for users who want a tool that selects for them. The shortcut is the brand.",
    quote_type: "paraphrased",
    sources: [
      {
        title: "Inside Linear: Building with taste, craft, and focus | Karri Saarinen",
        url: "https://www.lennysnewsletter.com/p/inside-linear-building-with-taste",
        publisher: "Lenny's Newsletter",
        year: 2024,
        type: "podcast",
      },
      {
        title: "How Linear became the new Jira",
        url: "https://www.runtime.news/how-linear-became-the-new-jira/",
        publisher: "Runtime",
        type: "article",
      },
    ],
    tags: { industry: "devtools", region: "us", decade: "2010s" },
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
    reveal_quote_attribution:
      "Patrick Collison — paraphrased from early Stripe interviews and coverage",
    reveal_note:
      "The non-obvious move: Stripe inverted the buyer. Payments was sold as a procurement decision; Stripe rebuilt it as a developer decision. The homepage is a recruiting tool aimed at the person inside the customer who will champion you. Most B2B PMs design pages for the person who signs the contract — Stripe designed for the person who picks up the API key.",
    quote_type: "paraphrased",
    sources: [
      {
        title: "How Two Brothers Turned Seven Lines of Code Into a $9.2 Billion Startup",
        url: "https://www.bloomberg.com/news/features/2017-08-01/how-two-brothers-turned-seven-lines-of-code-into-a-9-2-billion-startup",
        publisher: "Bloomberg",
        year: 2017,
        type: "article",
      },
      {
        title: "How the Collison brothers turned 'seven lines of code' into Stripe",
        url: "https://news.ycombinator.com/item?id=14902696",
        publisher: "Hacker News",
        year: 2017,
        type: "article",
      },
    ],
    tags: { industry: "fintech", region: "us", decade: "2010s" },
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
    reveal_quote_attribution:
      "Notion product team — paraphrased from public commentary around the Notion AI launch",
    reveal_note:
      "What's easy to miss: bundling looks like generosity but throws away the most valuable signal in a feature launch — willingness to pay. Notion treated the $10 line as a research instrument, not a paywall. The output isn't 'is this feature profitable' — it's 'which users care enough to switch from free AI tools to a paid integrated one,' which then tells you whether to invest more or retreat.",
    quote_type: "paraphrased",
    sources: [
      {
        title:
          "Notion's lost years, near collapse during Covid, the joy and suffering of building horizontal | Ivan Zhao",
        url: "https://www.lennysnewsletter.com/p/inside-notion-ivan-zhao",
        publisher: "Lenny's Podcast",
        year: 2025,
        type: "podcast",
      },
      {
        title: "Notion launches AI agent as it crosses $500 million in annual revenue",
        url: "https://www.cnbc.com/2025/09/18/notion-launches-ai-agent-as-it-crosses-500-million-in-annual-revenue.html",
        publisher: "CNBC",
        year: 2025,
        type: "article",
      },
    ],
    tags: { industry: "productivity", region: "us", decade: "2020s" },
  },
  {
    id: "dropbox-demo-video",
    type: "daily",
    scheduled_date: "",
    company: "Dropbox",
    era: "2008 — pre-private-beta",
    context:
      "Spring 2008. Dropbox has ~5,000 beta signups and a product that's still flaky. Instead of polishing the funnel, Drew Houston posts a 4-minute screencast on Digg and Hacker News — a deadpan demo with deliberate inside-jokes aimed at the Digg and Reddit crowd. There's no marketing copy, no testimonials. The video shows the product solving a problem the audience has, in their own language.",
    prompt:
      "Why ship a demo video to Digg before the product even works for the audience watching — and what is the video actually testing?",
    reveal_quote:
      "We weren't trying to sell the product, we were trying to find out if the product was worth building. The video was the cheapest version of the product we could ship.",
    reveal_quote_attribution:
      "Drew Houston, Dropbox cofounder/CEO — paraphrased from Y Combinator and Lenny's Newsletter retellings",
    reveal_note:
      "The non-obvious move: a demo video is a free MVP. The product wasn't ready; the demand was the thing being tested. The result — the beta waitlist jumped from 5,000 to 75,000 overnight — wasn't growth, it was a market signal. The lesson: when you can't ship the product, ship the smallest artifact that lets the market vote with intent, not opinion. Surveys ask people what they want; a signup form asks them to pay (in attention) to want it.",
    quote_type: "paraphrased",
    sources: [
      {
        title: "Behind the founder: Drew Houston (Dropbox)",
        url: "https://www.lennysnewsletter.com/p/behind-the-founder-drew-houston-dropbox",
        publisher: "Lenny's Newsletter",
        type: "podcast",
      },
      {
        title: "Drew Houston on the original Dropbox HN post",
        url: "https://x.com/drewhouston/status/1904948248961315299",
        publisher: "X / Drew Houston",
        type: "tweet",
      },
      {
        title: "Dropbox doing things that don't scale",
        url: "https://www.alexanderjarvis.com/dropbox-doing-things-that-dont-scale/",
        type: "blog",
      },
    ],
    tags: { industry: "saas", region: "us", decade: "2000s" },
  },
  {
    id: "airbnb-photographers",
    type: "daily",
    scheduled_date: "",
    company: "Airbnb",
    era: "Summer 2009",
    context:
      "Airbnb has been stuck at about $200/week in revenue for eight months. The founders are running out of money. Looking at their worst-performing listings, they notice a pattern: the photos are terrible — flip-phone snapshots, blurry, badly lit. The 'obvious' fix is to write better seller guides, or build a UI that nudges hosts to upload more photos. Instead Brian Chesky and Joe Gebbia fly to New York, borrow professional cameras, and personally photograph 24 hosts' apartments. Revenue doubles to $400 that week.",
    prompt:
      "Why fly to New York and become photographers themselves, when there are obviously cheaper ways to fix listing photos?",
    reveal_quote:
      "Do things that don't scale. Until you've talked to your users in their kitchens, you don't actually know what's broken. Software is the last step, not the first.",
    reveal_quote_attribution:
      "Paul Graham / Brian Chesky — paraphrased from 'Do Things That Don't Scale' (essay and retellings)",
    reveal_note:
      "The choice that's easy to miss: founders solving the problem with their hands generates a kind of insight that a dashboard cannot. The photo issue was symptomatic — what they actually learned in those apartments was that hosts didn't understand they were running a hospitality business, not renting a room. That insight became the entire 'Belong Anywhere' brand and the design of the host onboarding. The lesson is not 'send photographers'; it's that low-leverage in-person work in the early days is often the only way to find the high-leverage product changes.",
    quote_type: "paraphrased",
    sources: [
      {
        title: "How Airbnb doubled revenue in one week",
        url: "https://strategybreakdowns.com/p/airbnb-photography",
        publisher: "Strategy Breakdowns",
        type: "article",
      },
      {
        title: "Do Things That Don't Scale",
        url: "http://paulgraham.com/ds.html",
        publisher: "Paul Graham",
        year: 2013,
        type: "blog",
      },
      {
        title: "When Airbnb was young: the early years",
        url: "https://vator.tv/2016-02-26-when-airbnb-was-young-the-early-years/",
        publisher: "VatorNews",
        year: 2016,
        type: "article",
      },
    ],
    tags: { industry: "marketplace", region: "us", decade: "2000s" },
  },
  {
    id: "spotify-free-tier",
    type: "daily",
    scheduled_date: "",
    company: "Spotify",
    era: "October 2008 — launch in Sweden/UK/France",
    context:
      "Spotify launches in 2008 with a free, ad-supported tier alongside a paid premium tier. The major labels hate it. Apple iTunes is selling tracks at 99¢. Pandora has built a US business on free streaming. Spotify's wager is more aggressive: any song, on demand, free forever, with ads — and a frictionless upgrade to ad-free paid. Internally, the metric to beat is not Apple's revenue per user. It's the BitTorrent download.",
    prompt:
      "Why give the catalog away free, in a market where the dominant legal alternative is a 99¢ paid download — and who is Spotify actually competing with?",
    reveal_quote:
      "The enemy was not the free listener. The enemy was piracy. If we could give people something legal that was as easy as stealing, the free tier was a cost of doing business, not a revenue leak.",
    reveal_quote_attribution:
      "Daniel Ek, Spotify cofounder/CEO — paraphrased from public interviews",
    reveal_note:
      "The non-obvious move: Spotify mis-identified its competitor on purpose. iTunes was the surface comp; BitTorrent was the real one. Once you frame the competitor as piracy, every product decision flips — free is a feature not a leak, ads are a tax cheaper than theft, and the upgrade to premium is not 'pay for music' but 'pay to remove the ad inserted to compete with free piracy.' Most PMs benchmark to the visible competitor in the same category. The win was benchmarking to the invisible one.",
    quote_type: "paraphrased",
    sources: [
      {
        title: "Spotify just turned 20 — how Daniel Ek built a $100B music empire",
        url: "https://fortune.com/article/spotify-20-year-anniversary-daniel-ek-founder-ceo-music-industry-least-powerful-person/",
        publisher: "Fortune",
        year: 2026,
        type: "article",
      },
      {
        title: "Spotify — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Spotify",
        type: "article",
      },
    ],
    tags: { industry: "media", region: "eu", decade: "2000s" },
  },
  {
    id: "slack-internal-tool",
    type: "daily",
    scheduled_date: "",
    company: "Slack",
    era: "2013 — pivot from Glitch",
    context:
      "Tiny Speck spent three years and ~$17M of investor money building Glitch, a browser MMO. The game flops. The team has burned most of the runway. But they have one asset: an internal IRC-like chat tool they built so the distributed team could ship the game. The 'rational' play is to wind the company down and return remaining capital. Instead Stewart Butterfield tells investors he's pivoting to ship the internal tool — to other companies — as a product.",
    prompt:
      "What's the non-obvious bet in pivoting to your own internal tool — and what makes the bet defensible against the dozens of existing chat products?",
    reveal_quote:
      "If our team can't live without it, that's the strongest demand signal you can have. The competition wasn't HipChat, it was email. Email is what we replaced for ourselves; that's what we'd replace for other teams.",
    reveal_quote_attribution:
      "Stewart Butterfield, Slack cofounder/CEO — paraphrased from launch-era interviews",
    reveal_note:
      "What's easy to miss: 'dogfooding' is usually framed as a quality lever — you use it, so you fix the bugs. Slack used it as a positioning lever. The product didn't need to beat HipChat (a similar tool); it needed to beat email (a totally different category). Reframing the competitor turned a crowded chat market into an underserved replacement-for-email market, and made every email-style feature (threads, search, archives) a wedge instead of a parity feature. Internal tools that become products tend to inherit a positioning insight, not just a feature set.",
    quote_type: "paraphrased",
    sources: [
      {
        title: "The Slack origin story",
        url: "https://techcrunch.com/2019/05/30/the-slack-origin-story/",
        publisher: "TechCrunch",
        year: 2019,
        type: "article",
      },
      {
        title: "Stewart Butterfield's letter: We Don't Sell Saddles Here",
        url: "https://medium.com/@stewart/we-dont-sell-saddles-here-4c59524d650d",
        publisher: "Medium / Stewart Butterfield",
        year: 2014,
        type: "blog",
      },
    ],
    tags: { industry: "saas", region: "us", decade: "2010s" },
  },
  {
    id: "figma-browser-bet",
    type: "daily",
    scheduled_date: "",
    company: "Figma",
    era: "2012–2016 — pre-launch",
    context:
      "Sketch dominates UI design in the early 2010s. The category-defining tool is a native macOS app — single user, single machine, .sketch files passed around in Slack. Dylan Field and Evan Wallace take ~$4M of seed money and spend four years building a design tool from scratch — in the browser, with multiplayer editing, before launching anything in public. Most designers hate the demos. Browsers are seen as too slow for serious creative work.",
    prompt:
      "Why bet four years on a browser-based, multiplayer design tool when designers — your users — are openly skeptical of the technology?",
    reveal_quote:
      "We bet on a thing nobody wanted yet because the thing they did want — desktop files, single-player — was structurally incapable of doing what design teams were going to need next.",
    reveal_quote_attribution:
      "Dylan Field, Figma cofounder/CEO — paraphrased from public interviews and the Index Ventures retrospective",
    reveal_note:
      "The choice that's easy to miss: users tell you what they want from inside the current paradigm. Designers in 2013 wanted faster Sketch, not browser-Sketch. Figma's bet was that the latent need — design as a team activity, with handoff baked in — would only become visible once the artifact (the .sketch file) was no longer the unit of work. The technology was a wedge for a workflow change, not a feature upgrade. Listening to users would have built a better single-player tool. Listening to the trajectory built the multiplayer one.",
    quote_type: "paraphrased",
    sources: [
      {
        title: "Designers hated Figma at first, but grew to love it",
        url: "https://techcrunch.com/2023/06/25/figma-design-tool-history/",
        publisher: "TechCrunch",
        year: 2023,
        type: "article",
      },
      {
        title: "Figma Goes Public: Thirteen Unforgettable Years with Dylan Field",
        url: "https://www.indexventures.com/perspectives/figma-goes-public-thirteen-unforgettable-years-with-dylan-field/",
        publisher: "Index Ventures",
        year: 2025,
        type: "blog",
      },
      {
        title: "Design Meet the Internet | Figma Blog",
        url: "https://www.figma.com/blog/design-meet-the-internet/",
        publisher: "Figma",
        type: "blog",
      },
    ],
    tags: { industry: "devtools", region: "us", decade: "2010s" },
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
    pullquote_attribution:
      "Adam Mosseri, Head of Instagram, July 2023 — paraphrased / compressed from his public statements",
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
    quote_type: "paraphrased",
    sources: [
      {
        title: "Instagram Head Says Threads Isn't Trying to 'Replace' Twitter",
        url: "https://www.thewrap.com/threads-replace-twitter-goal-adam-mosseri-instagram/",
        publisher: "TheWrap",
        year: 2023,
        type: "article",
      },
      {
        title: "Birth of Threads: Mark Zuckerberg called up Adam Mosseri to discuss the 'Twitter-killer'",
        url: "https://www.businesstoday.in/technology/news/story/birth-of-threads-mark-zuckerberg-called-up-instagram-head-adam-mosseri-late-at-night-to-discuss-the-twitter-killer-392003-2023-07-31",
        publisher: "Business Today",
        year: 2023,
        type: "article",
      },
      {
        title: "Instagram head says Threads is 'not going to amplify news on the platform'",
        url: "https://techcrunch.com/2023/10/11/instagram-head-says-threads-is-not-going-to-amplify-news-on-the-platform/",
        publisher: "TechCrunch",
        year: 2023,
        type: "article",
      },
    ],
    tags: { industry: "consumer-social", region: "us", decade: "2020s" },
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
    pullquote_attribution:
      "Tobi Lütke, Shopify CEO — paraphrased from public commentary around the Shop launch (2020–21)",
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
    quote_type: "paraphrased",
    sources: [
      {
        title: "Shopify launches consumer-facing shopping assistant app",
        url: "https://betakit.com/shopify-launches-consumer-facing-shopping-assistant-app/",
        publisher: "BetaKit",
        year: 2020,
        type: "article",
      },
      {
        title: "Shopify — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Shopify",
        type: "article",
      },
      {
        title: "Masters of Scale: Be a platform, with Tobi Lütke",
        url: "https://mastersofscale.com/tobi-lutke-be-a-platform/",
        publisher: "Masters of Scale",
        type: "podcast",
      },
    ],
    tags: { industry: "ecommerce", region: "anz", decade: "2020s" },
  },
  {
    id: "airbnb-covid-2020",
    type: "weekly",
    iso_week: "",
    company: "Airbnb",
    era: "March–May 2020",
    intro:
      "It is March 2020. You are a senior PM at Airbnb. COVID-19 has closed borders. Travel demand has fallen off a cliff — revenue is down roughly 80% in eight weeks, and the company is burning about $250M/month. The IPO that was supposed to land in 2020 is dead on arrival. The company has about 7,500 employees globally and a sprawling roadmap: Airbnb Experiences, Luxe, Plus, hotels, transportation.\n\nLeadership has to make three calls in parallel: how deep to cut, what to cut from the product portfolio, and how to position the company that emerges. The 'rational' play is to cut everything that isn't core stays and ride out the pandemic.",
    open_questions: [
      "How deep to cut on headcount — enough to survive 12 months of zero recovery, or shallower bets on a faster rebound?",
      "Kill Experiences/Luxe/Plus and refocus on core stays, or keep optionality across the portfolio?",
      "How transparent to be publicly about the cuts and the rationale — does that help or hurt the long brand?",
      "Is the IPO dead permanently, or just delayed — and how should the runway decision reflect each?",
    ],
    closing:
      "Imagine you're in the executive room in early April 2020. The data is bad, the recovery curve is unknown, and the team is watching to see what cut you make.",
    decision:
      "Cut deep, cut once, and refocus. In May 2020 Airbnb laid off 1,900 employees — about 25% of staff. Leadership killed or paused most of the non-stays product portfolio (Experiences, Luxe, Plus, hotels, transportation work) and explicitly refocused the company on hosts and stays. Severance was 14 weeks + healthcare + an internal alumni hiring database; the layoff letter was published openly. Airbnb's IPO landed in December 2020 — eight months after the cuts.",
    pullquote:
      "I have a deep feeling of love for all of you. We have a more focused business, and we are going to emerge stronger.",
    pullquote_attribution:
      "Brian Chesky, Airbnb cofounder/CEO — from his publicly-published May 2020 letter to staff",
    outcomes: [
      { stat: "1,900", label: "employees laid off (25% of staff) in one cut", accent: true },
      { stat: "14 wks", label: "severance + healthcare + alumni placement program" },
      { stat: "$250M/mo", label: "burn rate at the time of decision" },
      { stat: "Dec 2020", label: "IPO — 8 months after the cuts" },
      { stat: "$100B+", label: "market cap at peak following IPO" },
    ],
    tradeoffs: [
      {
        title: "Cut deep once vs. cut shallow twice",
        body:
          "Chesky chose a single deep cut over staged smaller ones. The internal logic: two rounds of layoffs destroys trust faster than one. The cost is over-cutting if recovery is fast; the benefit is one trauma instead of two.",
      },
      {
        title: "Refocus vs. preserve optionality",
        body:
          "Killing Experiences/Luxe/Plus meant abandoning years of investment. Leadership decided focus was a survival asset — narrow surface area, faster decisions, clearer story for hosts and shareholders.",
      },
      {
        title: "Public transparency vs. quiet handling",
        body:
          "The published letter and alumni database were a brand bet. They turned a layoff (usually a brand-negative event) into a hiring tailwind for the laid-off staff and a recruiting story for the survivors.",
      },
      {
        title: "Host-first vs. shareholder-first framing",
        body:
          "The IPO was the obvious 2020 metric. Chesky de-prioritized it explicitly and built the cut around the host relationship instead. The IPO arrived anyway because the host network held.",
      },
    ],
    per_dimension_truth: {
      tradeoff:
        "Speed and depth of cut vs. preserving optionality and trust. Resolved by cutting once, deeply, transparently — even though that closed off entire product lines they'd invested years in.",
      user:
        "Hosts, not guests, were the user the decision optimized for. Hosts carry the supply; without supply, demand recovery is meaningless. Refocusing on stays was a supply-side bet, not a demand-side one.",
      alt:
        "A shallower first cut + portfolio preservation would have looked safer in April 2020 and forced a second cut by year-end. Airbnb chose the opposite: one trauma, deep refocus.",
      predict:
        "Short-term pain (mass layoffs, killed product lines), faster-than-expected recovery driven by domestic / longer-stay travel, and an IPO landing inside the same calendar year as the cuts.",
    },
    quote_type: "verbatim",
    sources: [
      {
        title: "A Message from Co-Founder and CEO Brian Chesky",
        url: "https://news.airbnb.com/a-message-from-co-founder-and-ceo-brian-chesky/",
        publisher: "Airbnb Newsroom",
        year: 2020,
        type: "press-release",
      },
      {
        title: "Airbnb Cuts 1,900 Jobs, 25% Of Its Workforce, As Pandemic Freezes Travel",
        url: "https://www.npr.org/sections/coronavirus-live-updates/2020/05/05/850986054/airbnb-cuts-1-900-jobs-25-of-its-workforce-as-pandemic-freezes-travel",
        publisher: "NPR",
        year: 2020,
        type: "article",
      },
      {
        title:
          "Airbnb CEO Brian Chesky Tells Adam Grant the Right Way to Do Mass Layoffs: 'Cut Deep'",
        url: "https://www.inc.com/nick-hobson/airbnb-ceo-brian-chesky-tells-adam-grant-right-way-to-do-mass-layoffs-cut-deep.html",
        publisher: "Inc.",
        type: "interview",
      },
    ],
    tags: { industry: "marketplace", region: "us", decade: "2020s" },
  },
];

export function hashToIndex(s: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}
