import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy · Sixth Sense",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-5 sm:px-6 py-12 prose-sm">
      <h1 className="text-3xl font-bold mb-2">Privacy</h1>
      <p className="text-sm opacity-70 mb-8">Last updated: 2026-05-17</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">What we collect</h2>
      <ul className="list-disc pl-5 space-y-1 text-[0.95rem]">
        <li>
          <strong>Email address</strong> — only if you sign in. Used to send you the
          daily/weekly rep and to associate your reps with your account.
        </li>
        <li>
          <strong>Your reps</strong> — the text you write in response to each scenario,
          stored alongside an anonymous device ID and (if signed in) your user ID.
        </li>
        <li>
          <strong>Anonymous device ID</strong> — a random UUID stored in your browser&apos;s
          localStorage. Used to attribute reps before sign-in. No tracking across sites.
        </li>
      </ul>
      <p className="text-[0.95rem] mt-3">
        We do not use third-party analytics, advertising trackers, or cookies beyond what
        is required for authentication.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Where it&apos;s stored</h2>
      <p className="text-[0.95rem]">
        Authentication and rep data are stored in Supabase (Postgres, hosted on AWS).
        Transactional email is sent via Resend. Hosting is on Vercel.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Your rights</h2>
      <ul className="list-disc pl-5 space-y-1 text-[0.95rem]">
        <li>You can unsubscribe from emails via the link in every email.</li>
        <li>
          You can request deletion of your account and reps by emailing{" "}
          <a className="underline" href="mailto:aprameyakkiraju@gmail.com">
            aprameyakkiraju@gmail.com
          </a>
          . We will action it within 30 days.
        </li>
        <li>EU/UK residents: you have GDPR rights of access, rectification, and erasure.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">Contact</h2>
      <p className="text-[0.95rem]">
        Questions:{" "}
        <a className="underline" href="mailto:aprameyakkiraju@gmail.com">
          aprameyakkiraju@gmail.com
        </a>
        .
      </p>
    </main>
  );
}
