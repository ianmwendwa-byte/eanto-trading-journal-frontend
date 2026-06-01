import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

/**
 * Shared wrapper for all legal pages.
 * Applies the same navbar/footer as the landing page.
 * Inherits the active theme — no forced dark.
 */
export const LegalLayout = ({ title, lastUpdated, description, children }) => {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} — Tradecore`;
    return () => { document.title = prev; };
  }, [title]);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <LandingNavbar />

      {/* Page header */}
      <div className="pt-28 pb-12 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Tradecore
          </Link>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-3">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-lg mb-4">{description}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Last updated: <time dateTime={lastUpdated}>{lastUpdated}</time>
          </p>
        </div>
      </div>

      {/* Document body */}
      <main className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="legal-prose">{children}</div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

/* ── Shared prose sub-components ─────────────────────────────────────────── */

export const LegalSection = ({ id, title, children }) => (
  <section id={id} className="mb-12 scroll-mt-24">
    <h2 className="font-heading font-bold text-2xl text-foreground mb-4 pb-2 border-b border-border">
      {title}
    </h2>
    <div className="space-y-4 text-muted-foreground leading-relaxed">
      {children}
    </div>
  </section>
);

export const LegalSubSection = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="font-heading font-semibold text-base text-foreground mb-2">
      {title}
    </h3>
    <div className="space-y-3 text-muted-foreground leading-relaxed">
      {children}
    </div>
  </div>
);

export const LegalList = ({ items }) => (
  <ul className="space-y-1.5 pl-4">
    {items.map((item, i) => (
      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
        <span className="text-primary mt-0.5 flex-shrink-0">•</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export const LegalNote = ({ children }) => (
  <div className="border-l-2 border-primary/40 bg-primary/5 rounded-r-lg pl-4 pr-4 py-3 text-sm text-foreground">
    {children}
  </div>
);

export const LegalWarning = ({ children }) => (
  <div className="border-l-2 border-warning/60 bg-warning/5 rounded-r-lg pl-4 pr-4 py-3 text-sm text-foreground">
    {children}
  </div>
);
