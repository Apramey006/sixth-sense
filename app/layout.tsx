import type { Metadata } from "next";
import { Inter, Fraunces, Newsreader } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/TopNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sixth Sense",
  description:
    "A practice tool for product taste — daily and weekly reps on real product decisions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${newsreader.variable}`}
    >
      <body className="min-h-screen antialiased">
        {/* Subtle paper grain — fixed overlay, doesn't scroll, doesn't catch clicks */}
        <div aria-hidden className="paper-grain" />
        <TopNav />
        <div className="page-fade">{children}</div>
      </body>
    </html>
  );
}
