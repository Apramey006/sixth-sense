import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms · Sixth Sense",
};

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-5 sm:px-6 py-12 prose-sm">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm opacity-70 mb-8">Last updated: 2026-05-17</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">What this is</h2>
      <p className="text-[0.95rem]">
        Sixth Sense is a personal product-taste practice tool. You read a scenario, write
        your call, and see what actually happened. It is provided as-is for personal,
        non-commercial use.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Acceptable use</h2>
      <ul className="list-disc pl-5 space-y-1 text-[0.95rem]">
        <li>Don&apos;t submit illegal, harassing, or abusive content.</li>
        <li>Don&apos;t attempt to scrape, overload, or reverse-engineer the service.</li>
        <li>Don&apos;t use the service to spam, phish, or impersonate others.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">Your content</h2>
      <p className="text-[0.95rem]">
        You retain ownership of the reps you write. By submitting them, you grant us a
        limited license to store and display them back to you. We do not publish your
        reps to other users.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">No warranty</h2>
      <p className="text-[0.95rem]">
        The service is provided &quot;as is&quot; without warranties of any kind. We are
        not liable for any losses arising from use of, or inability to use, the service.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Termination</h2>
      <p className="text-[0.95rem]">
        We may suspend or terminate accounts that violate these terms. You may delete
        your account at any time by emailing{" "}
        <a className="underline" href="mailto:aprameyakkiraju@gmail.com">
          aprameyakkiraju@gmail.com
        </a>
        .
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Changes</h2>
      <p className="text-[0.95rem]">
        We may update these terms. Material changes will be reflected in the &quot;Last
        updated&quot; date above.
      </p>
    </main>
  );
}
