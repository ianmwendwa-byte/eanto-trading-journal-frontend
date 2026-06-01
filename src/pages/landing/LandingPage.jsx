import { useEffect } from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemStrip } from "@/components/landing/ProblemStrip";
import { PillarsSection } from "@/components/landing/PillarsSection";
import { AccountManagementSection } from "@/components/landing/AccountManagementSection";
import { TradeCaptureSection } from "@/components/landing/TradeCaptureSection";
import { FinancialClaritySection } from "@/components/landing/FinancialClaritySection";
import { WarAccountSection } from "@/components/landing/WarAccountSection";
import { BusinessScoreSection } from "@/components/landing/BusinessScoreSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";

// ── SEO / Structured data ─────────────────────────────────────────────────────

const useLandingPageSEO = () => {
  useEffect(() => {
    const prev = document.title;
    document.title =
      "Tradecore — The Operating System for Retail Forex Traders";

    // Meta description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    const prevDesc = meta.content;
    meta.content =
      "Track every forex trade, score your trading business with the 0–100 Business Score, manage prop firm challenges, and sync MT4/MT5 trades automatically. Free to start.";

    // JSON-LD structured data
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://tradecore.app/#organization",
          name: "Tradecore",
          url: "https://tradecore.app",
          logo: "https://tradecore.app/logo.svg",
          description:
            "The operating system for retail forex traders. Multi-account management, Business Score, EA auto-sync, prop firm tracking.",
        },
        {
          "@type": "SoftwareApplication",
          name: "Tradecore",
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web, MT4, MT5",
          offers: [
            {
              "@type": "Offer",
              name: "Free",
              price: "0",
              priceCurrency: "USD",
            },
            {
              "@type": "Offer",
              name: "Pro",
              price: "29",
              priceCurrency: "USD",
            },
          ],
          description:
            "Forex trading journal and business OS with Business Score, EA sync, prop firm tracking, and War Account system.",
        },
        {
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Is Tradecore free to start?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. The Free plan gives you 1 trading account, up to 50 trades per month, and basic analytics — no credit card required.",
              },
            },
            {
              "@type": "Question",
              name: "What is the Business Score?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The Trading Business Score is a 0–100 composite metric measuring five pillars of your trading health: consistency, risk management, profitability, discipline, and growth.",
              },
            },
            {
              "@type": "Question",
              name: "Does Tradecore support MT4 and MT5?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Tradecore supports MT4 and MT5 via manual entry, CSV import, and automatic EA sync.",
              },
            },
          ],
        },
      ],
    };

    let ld = document.getElementById("tradecore-ld");
    if (!ld) {
      ld = document.createElement("script");
      ld.id = "tradecore-ld";
      ld.type = "application/ld+json";
      document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify(schema);

    return () => {
      document.title = prev;
      if (meta) meta.content = prevDesc;
      ld?.remove();
    };
  }, []);
};

// ── Hash-based section scroll ─────────────────────────────────────────────────
// Runs once on mount. When the user arrives at /#features (etc.) from another
// page, ScrollToTop skips its scroll and this effect handles positioning.

const useHashScroll = () => {
  useEffect(() => {
    const id = window.location.hash.slice(1); // strip leading '#'
    if (!id) return;
    // Two rAF frames ensure the page has fully painted before scrolling
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      })
    );
    return () => cancelAnimationFrame(raf);
  }, []);
};

// ── Landing Page ──────────────────────────────────────────────────────────────

export const LandingPage = () => {
  useLandingPageSEO();
  useHashScroll();

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
        {/* Skip to main content (accessibility) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>

        {/* Navigation */}
        <LandingNavbar />

        {/* Main content */}
        <main id="main-content">
          {/* 1. Hero */}
          <HeroSection />

          {/* 2. Problem Strip */}
          <ProblemStrip />

          {/* 3. What is Tradecore — 3 Pillars */}
          <PillarsSection />

          {/* 4. Account Management */}
          <AccountManagementSection />

          {/* 5. Trade Capture */}
          <TradeCaptureSection />

          {/* 6. Financial Clarity */}
          <FinancialClaritySection />

          {/* 7. War Account Spotlight */}
          <WarAccountSection />

          {/* 8. Business Score Spotlight */}
          <BusinessScoreSection />

          {/* 9. Pricing */}
          <PricingSection />

          {/* 10. FAQ */}
          <FAQSection />

          {/* 11. Final CTA */}
          <FinalCTASection />
        </main>

        {/* Footer */}
        <LandingFooter />
      </div>
  );
};
