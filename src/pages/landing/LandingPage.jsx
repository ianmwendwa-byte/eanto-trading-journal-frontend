import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
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

// ── Hash-based section scroll ─────────────────────────────────────────────────

const useHashScroll = () => {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
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
  useHashScroll();

  return (
    <>
      <Helmet>
        <title>Kraviq — Forex Trading OS for Prop &amp; Manual Traders</title>
        <meta
          name="description"
          content="Track every trade, manage prop firm challenges, and score your trading business. Kraviq is the all-in-one forex trading OS with EA sync, CSV import, and Business Score. Free to start."
        />
        <link rel="canonical" href="https://kraviq.app" />
        <meta property="og:title" content="Kraviq — Forex Trading OS" />
        <meta property="og:url" content="https://kraviq.app" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground antialiased overflow-x-hidden">
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

          {/* 3. What is Kraviq — 3 Pillars */}
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
    </>
  );
};
