"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/AuthButton";

const links = [
  { href: "/today", label: "Today" },
  { href: "/this-week", label: "This week" },
];

export function TopNav() {
  const pathname = usePathname() || "/";

  return (
    <header className="nav-shell">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span
            className="text-[1.05rem]"
            style={{
              color: "var(--ink)",
              fontFamily: "var(--font-sans), sans-serif",
              fontWeight: 600,
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

        <div className="flex items-center gap-5 sm:gap-6">
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
