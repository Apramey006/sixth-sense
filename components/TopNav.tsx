"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/AuthButton";

const links = [
  { href: "/today", label: "Today" },
  { href: "/this-week", label: "This week" },
  { href: "/me", label: "Your reps" },
];

export function TopNav() {
  const pathname = usePathname() || "/";

  return (
    <header className="nav-shell">
      <div className="nav-inner">
        <Link href="/" className="wordmark-link" aria-label="Sixth Sense — home">
          <span className="wordmark">Sixth Sense</span>
        </Link>

        <nav className="nav-links hidden sm:flex" aria-label="Primary">
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

        <div className="nav-right">
          <nav className="nav-links flex sm:hidden" aria-label="Primary (mobile)">
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
        </div>
      </div>
    </header>
  );
}
