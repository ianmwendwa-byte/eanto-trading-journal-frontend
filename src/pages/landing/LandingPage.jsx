import { useEffect, useState } from "react";
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
import { buildFaqSchema } from "@/lib/featurePageSchemas";
import { FAQS } from "@/lib/landingFaqs";

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
  // Helmet is client-only: react-helmet-async v3 renders its children as React
  // nodes during renderToString (they appear in the SSR HTML), but on the client
  // Helmet renders null and uses effects to update document.head. This mismatch
  // causes hydration error #418. By only mounting Helmet after the first client
  // render, both SSR and the initial client render output the same DOM structure.
  const [mounted, setMounted] = useState(false);
  useHashScroll();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      import("@/pages/auth/Register");
      import("@/pages/auth/Login");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // SoftwareApplication + Organization schemas already live sitewide in
  // index.html (every page is part of the same app/brand, so that's valid
  // everywhere). FAQPage schema is NOT sitewide-valid — it must only appear
  // where the matching Q&A content is actually visible, so it's built here
  // from the same FAQS data FAQSection renders, scoped to the homepage only.
  const faqSchema = buildFaqSchema(
    FAQS.map(({ q, a }) => ({ question: q, answer: a }))
  );

  return (
    <>
      {mounted && (
        <Helmet>
          <title>Kraviq — Trading Business OS for Retail Traders | Ledger, Risk Calculators &amp; EA Sync</title>
          <meta
            name="description"
            content="Kraviq is a trading business operating system for retail traders. Run your ledger, backtest strategies, calculate risk, sync your MT4/MT5 EA, and score your trading performance — in one platform."
          />
          <link rel="canonical" href="https://kraviq.app" />
          <meta property="og:title" content="Kraviq — Trading Business OS for Retail Traders" />
          <meta
            property="og:description"
            content="Kraviq is a trading business operating system for retail traders. Run your ledger, backtest strategies, calculate risk, sync your MT4/MT5 EA, and score your trading performance — in one platform."
          />
          <meta property="og:url" content="https://kraviq.app" />
          <meta name="twitter:title" content="Kraviq — Trading Business OS for Retail Traders" />
          <meta
            name="twitter:description"
            content="Kraviq is a trading business operating system for retail traders. Run your ledger, backtest strategies, calculate risk, sync your MT4/MT5 EA, and score your trading performance — in one platform."
          />
          <meta name="robots" content="index, follow" />
        </Helmet>
      )}
      {/* FAQPage schema rendered outside the mount guard so it is present in
          the SSG HTML. <script> tags are not React-hoisted to <head> — they
          stay inline in the body, which is fine: crawlers parse JSON-LD
          anywhere in the document. dangerouslySetInnerHTML prevents escaping. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />

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
