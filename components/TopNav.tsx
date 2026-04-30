"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/today", label: "Today" },
  { href: "/this-week", label: "This week" },
  { href: "/library", label: "Library" },
];

export function TopNav() {
  const pathname = usePathname() || "/";

  return (
    <header className="nav-shell">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <span
            aria-hidden
            className="inline-block w-6 h-6 rounded-md"
            style={{
              background:
                "linear-gradient(135deg, var(--accent) 0%, var(--accent-soft) 60%, var(--accent-2) 100%)",
              boxShadow: "var(--shadow-sm)",
            }}
          />
          <span
            className="font-semibold tracking-tight text-[0.95rem]"
            style={{ color: "var(--ink)", letterSpacing: "-0.01em" }}
          >
            Taste Reps
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
          <button
            type="button"
            className="btn-ghost rounded-md text-sm px-3 py-1.5"
            // Placeholder — auth agent wires this up.
            aria-label="Sign in"
          >
            Sign in
          </button>
        </div>
      </div>
    </header>
  );
}
