import { useEffect } from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

/**
 * Shared wrapper for marketing pages (About, Contact, Blog, Community).
 * Flexible — each page owns its own sections inside <main>.
 */
export const PageLayout = ({ title, children }) => {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} — Kraviq`;
    return () => {
      document.title = prev;
    };
  }, [title]);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <LandingNavbar />
      <main>{children}</main>
      <LandingFooter />
    </div>
  );
};
