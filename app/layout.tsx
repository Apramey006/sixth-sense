import type { Metadata } from "next";
import { Fraunces, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/TopNav";
import { Analytics } from '@vercel/analytics/next';

// Editorial serif for headlines, titles and pull-quotes.
const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Clean, highly legible workhorse sans for body + UI.
const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sixth Sense",
  description:
    "A practice tool for product taste — daily and weekly reps on real product decisions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen antialiased">
        <TopNav />
        <div className="page-fade">{children}</div>
        <footer className="max-w-6xl mx-auto px-5 sm:px-6 py-8 text-xs opacity-60 flex gap-4">
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/terms" className="hover:underline">Terms</a>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
