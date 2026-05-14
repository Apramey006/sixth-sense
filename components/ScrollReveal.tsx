"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Wraps children with a fade-and-rise reveal that fires when the element
 * enters the viewport. Uses IntersectionObserver; reveals once, then
 * disconnects. Optional `delay` (ms) staggers when multiple siblings reveal.
 */
export function ScrollReveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  as?: "div" | "section" | "article" | "li";
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // SSR-safe; only run on the client. If IO is missing, just reveal.
    if (typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-revealed", "true");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            window.setTimeout(() => {
              target.setAttribute("data-revealed", "true");
            }, delay);
            io.unobserve(target);
          }
        }
      },
      { rootMargin: "-40px 0px -10% 0px", threshold: 0.05 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  const cls = `reveal-on-scroll ${className}`.trim();
  if (Tag === "section")
    return (
      <section ref={ref as React.RefObject<HTMLElement>} className={cls}>
        {children}
      </section>
    );
  if (Tag === "article")
    return (
      <article ref={ref as React.RefObject<HTMLElement>} className={cls}>
        {children}
      </article>
    );
  if (Tag === "li")
    return (
      <li ref={ref as React.RefObject<HTMLLIElement>} className={cls}>
        {children}
      </li>
    );
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={cls}>
      {children}
    </div>
  );
}
