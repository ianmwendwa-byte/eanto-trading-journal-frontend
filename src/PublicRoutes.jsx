import { Routes, Route } from "react-router-dom";

// Landing page
import { LandingPage } from "./pages/landing/LandingPage";

// Legal pages
import { DataPolicy as PrivacyPolicy } from "./pages/legal/DataPolicy";
import { TermsOfService } from "./pages/legal/TermsOfService";
import { TrackingPolicy } from "./pages/legal/TrackingPolicy";

// Marketing pages
import { AboutPage } from "./pages/marketing/AboutPage";
import { ContactPage } from "./pages/marketing/ContactPage";
import { CommunityPage } from "./pages/marketing/CommunityPage";

// Blog pages
import { BlogIndexPage } from "./pages/blog/BlogIndexPage";
import { BlogPostPage } from "./pages/blog/BlogPostPage";
import { BlogCategoryPage } from "./pages/blog/BlogCategoryPage";

// Feature pages
import { WarPage } from "./pages/marketing/WarPage";
import { EASyncPage } from "./pages/marketing/EASyncPage";
import { ScorePage } from "./pages/marketing/ScorePage";

// New deep feature pages
import { TradeTrackingPage } from "./pages/features/TradeTrackingPage";
import { FinancialLedgerPage } from "./pages/features/FinancialLedgerPage";
import { PropFirmCompliancePage } from "./pages/features/PropFirmCompliancePage";
import { RiskCalculatorsPage } from "./pages/features/RiskCalculatorsPage";
import { BacktestingPage } from "./pages/features/BacktestingPage";
import { StrategyPage } from "./pages/features/StrategyPage";

/**
 * Server-only route tree for the public/prerendered surface of the app.
 *
 * This intentionally mirrors only the STATIC_ROUTES subset of src/router.jsx
 * (landing, marketing, legal, blog, feature pages) — never the protected
 * /dashboard, /accounts, etc. routes, which require Firebase auth state and
 * are SPA-only by design. Keep this list in sync with prerender.js's
 * STATIC_ROUTES and router.jsx's public route entries whenever a new public
 * page is added. Used exclusively by src/entry-server.jsx.
 */
export const PublicRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/landing" element={<LandingPage />} />

    <Route path="/about" element={<AboutPage />} />
    <Route path="/contact" element={<ContactPage />} />
    <Route path="/community" element={<CommunityPage />} />

    <Route path="/blog" element={<BlogIndexPage />} />
    <Route path="/blog/:slug" element={<BlogPostPage />} />
    <Route path="/blog/category/:pillar" element={<BlogCategoryPage />} />

    <Route path="/war-account" element={<WarPage />} />
    <Route path="/ea-sync" element={<EASyncPage />} />
    <Route path="/business-score" element={<ScorePage />} />

    <Route path="/features/trade-tracking" element={<TradeTrackingPage />} />
    <Route path="/features/financial-ledger" element={<FinancialLedgerPage />} />
    <Route path="/features/prop-firm-compliance" element={<PropFirmCompliancePage />} />
    <Route path="/features/risk-calculators" element={<RiskCalculatorsPage />} />
    <Route path="/features/backtesting" element={<BacktestingPage />} />
    <Route path="/features/strategy" element={<StrategyPage />} />

    <Route path="/privacy" element={<PrivacyPolicy />} />
    <Route path="/terms" element={<TermsOfService />} />
    <Route path="/cookies" element={<TrackingPolicy />} />

    {/* Fallback — should not be hit for any route in prerender.js's ROUTES list */}
    <Route path="*" element={<LandingPage />} />
  </Routes>
);
