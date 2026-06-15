import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Table of contents extracted from H2 headings in the rendered article.
 *
 * Props:
 *   headings — [{ id, text }] — derived from the markdown content
 *   className — additional classes for the wrapper
 *
 * On desktop: sticky sidebar.
 * On mobile: collapsible panel above the article body.
 */
export const TableOfContents = ({ headings, className }) => {
  const [activeId, setActiveId] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Intersection observer to highlight the active section
  useEffect(() => {
    if (!headings || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 }
    );

    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (!headings || headings.length < 4) return null;

  const TOCLinks = () => (
    <nav aria-label="Table of contents">
      <ol className="space-y-1.5">
        {headings.map(({ id, text }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block text-sm leading-snug transition-colors",
                activeId === id
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );

  return (
    <>
      {/* Desktop: sticky sidebar — rendered via the parent layout */}
      <div className={cn("hidden xl:block", className)}>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          In this article
        </p>
        <TOCLinks />
      </div>

      {/* Mobile: collapsible above article body */}
      <div className="xl:hidden mb-6 rounded-xl border border-border bg-card p-4">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          In this article
          <span
            aria-hidden="true"
            className={cn(
              "text-muted-foreground transition-transform",
              mobileOpen ? "rotate-180" : ""
            )}
          >
            ▾
          </span>
        </button>
        {mobileOpen && (
          <div className="mt-3 pt-3 border-t border-border">
            <TOCLinks />
          </div>
        )}
      </div>
    </>
  );
};
