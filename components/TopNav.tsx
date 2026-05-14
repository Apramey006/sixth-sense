"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/AuthButton";

const links = [
  { href: "/today", label: "Today" },
  { href: "/this-week", label: "This week" },
  { href: "/library", label: "Library" },
];

export function TopNav() {
  const pathname = usePathname() || "/";

  return (
    <header className="nav-shell">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span
            aria-hidden
            className="inline-flex items-center justify-center w-7 h-7 rounded-full"
            style={{
              background:
                "linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)",
              color: "#1a1408",
              boxShadow: "0 4px 12px rgba(212, 168, 67, 0.28)",
              fontFamily: "var(--font-sans), sans-serif",
              fontWeight: 800,
              fontSize: "0.85rem",
              letterSpacing: "-0.02em",
            }}
          >
            VI
          </span>
          <span
            className="text-[1.05rem]"
            style={{
              color: "var(--ink)",
              fontFamily: "var(--font-sans), sans-serif",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Sixth Sense
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {links.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link key={l.href} href={l.href} className="nav-link" data-active={active}>
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <nav className="flex sm:hidden items-center gap-1">
            {links.map((l) => {
              const active =
                pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link key={l.href} href={l.href} className="nav-link" data-active={active}>
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <AuthButton />
          <Link
            href="/me"
            className="hidden sm:inline-block text-sm hover:underline whitespace-nowrap"
            style={{ color: "var(--ink-soft)" }}
          >
            Your reps
          </Link>
        </div>
      </div>
    </header>
  );
}
