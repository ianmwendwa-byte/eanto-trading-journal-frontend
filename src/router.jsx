import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { useAuthStore } from "@/store/useAuthStore";

// Public pages — lazy loaded so each route becomes its own chunk
const LandingPage         = lazy(() => import("@/pages/landing/LandingPage").then(m => ({ default: m.LandingPage })));

const PrivacyPolicy       = lazy(() => import("@/pages/legal/DataPolicy").then(m => ({ default: m.DataPolicy })));
const TermsOfService      = lazy(() => import("@/pages/legal/TermsOfService").then(m => ({ default: m.TermsOfService })));
const TrackingPolicy      = lazy(() => import("@/pages/legal/TrackingPolicy").then(m => ({ default: m.TrackingPolicy })));

const AboutPage           = lazy(() => import("@/pages/marketing/AboutPage").then(m => ({ default: m.AboutPage })));
const ContactPage         = lazy(() => import("@/pages/marketing/ContactPage").then(m => ({ default: m.ContactPage })));
const CommunityPage       = lazy(() => import("@/pages/marketing/CommunityPage").then(m => ({ default: m.CommunityPage })));

const BlogIndexPage       = lazy(() => import("@/pages/blog/BlogIndexPage").then(m => ({ default: m.BlogIndexPage })));
const BlogPostPage        = lazy(() => import("@/pages/blog/BlogPostPage").then(m => ({ default: m.BlogPostPage })));
const BlogCategoryPage    = lazy(() => import("@/pages/blog/BlogCategoryPage").then(m => ({ default: m.BlogCategoryPage })));

const WarPage             = lazy(() => import("@/pages/marketing/WarPage").then(m => ({ default: m.WarPage })));
const EASyncPage          = lazy(() => import("@/pages/marketing/EASyncPage").then(m => ({ default: m.EASyncPage })));
const ScorePage           = lazy(() => import("@/pages/marketing/ScorePage").then(m => ({ default: m.ScorePage })));

const TradeTrackingPage      = lazy(() => import("@/pages/features/TradeTrackingPage").then(m => ({ default: m.TradeTrackingPage })));
const FinancialLedgerPage    = lazy(() => import("@/pages/features/FinancialLedgerPage").then(m => ({ default: m.FinancialLedgerPage })));
const PropFirmCompliancePage = lazy(() => import("@/pages/features/PropFirmCompliancePage").then(m => ({ default: m.PropFirmCompliancePage })));
const RiskCalculatorsPage    = lazy(() => import("@/pages/features/RiskCalculatorsPage").then(m => ({ default: m.RiskCalculatorsPage })));
const BacktestingPage        = lazy(() => import("@/pages/features/BacktestingPage").then(m => ({ default: m.BacktestingPage })));
const StrategyPage           = lazy(() => import("@/pages/features/StrategyPage").then(m => ({ default: m.StrategyPage })));

const Login           = lazy(() => import("@/pages/auth/Login").then(m => ({ default: m.Login })));
const Register        = lazy(() => import("@/pages/auth/Register").then(m => ({ default: m.Register })));
const ForgotPassword  = lazy(() => import("@/pages/auth/ForgotPassword").then(m => ({ default: m.ForgotPassword })));
const VerifyEmailPage = lazy(() => import("@/pages/auth/VerifyEmailPage").then(m => ({ default: m.VerifyEmailPage })));
const AuthActionPage  = lazy(() => import("@/pages/auth/AuthActionPage").then(m => ({ default: m.AuthActionPage })));

const Onboarding = lazy(() => import("@/pages/onboarding/Onboarding").then(m => ({ default: m.Onboarding })));

// App pages — lazy loaded to reduce initial bundle for public visitors
const Dashboard      = lazy(() => import("@/pages/app/Dashboard").then(m => ({ default: m.Dashboard })));
const Accounts       = lazy(() => import("@/pages/app/Accounts").then(m => ({ default: m.Accounts })));
const AccountDetail  = lazy(() => import("@/pages/app/AccountDetail").then(m => ({ default: m.AccountDetail })));
const Trades         = lazy(() => import("@/pages/app/Trades").then(m => ({ default: m.Trades })));
const Transactions   = lazy(() => import("@/pages/app/Transactions").then(m => ({ default: m.Transactions })));
const Analytics      = lazy(() => import("@/pages/app/Analytics").then(m => ({ default: m.Analytics })));
const Strategies     = lazy(() => import("@/pages/app/Strategies").then(m => ({ default: m.Strategies })));
const Insights       = lazy(() => import("@/pages/app/Insights").then(m => ({ default: m.Insights })));
const Notifications  = lazy(() => import("@/pages/app/Notifications").then(m => ({ default: m.Notifications })));
const Settings       = lazy(() => import("@/pages/app/Settings").then(m => ({ default: m.Settings })));
const EASync            = lazy(() => import("@/pages/app/EASync").then(m => ({ default: m.EASync })));
const Score             = lazy(() => import("@/pages/app/Score").then(m => ({ default: m.Score })));
const Reconciliation    = lazy(() => import("@/pages/app/Reconciliation").then(m => ({ default: m.Reconciliation })));
const StrategyEditPage  = lazy(() => import("@/pages/app/StrategyEditPage").then(m => ({ default: m.StrategyEditPage })));

const AppPageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <p className="text-sm text-muted-foreground">Loading...</p>
  </div>
);

const ComingSoonStub = ({ title }) => (
  <div className="p-6 flex items-center justify-center min-h-[60vh]">
    <div className="text-center space-y-2">
      <p className="font-heading font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">Coming soon</p>
    </div>
  </div>
);

// Guard for /onboarding — must be authenticated, must not be complete
const OnboardingRoute = ({ children }) => {
  const { isAuthenticated, isLoading, onboardingComplete } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (onboardingComplete === true) return <Navigate to="/dashboard" replace />;

  return children;
};

const AppRoot = () => (
  <ProtectedRoute>
    <DashboardLayout />
  </ProtectedRoute>
);

// Root layout — renders ScrollToTop on every route change then the matched page.
// Suspense here catches lazy-loaded public/auth pages; the inner Suspense on
// app routes overrides this for dashboard pages (shows AppPageFallback instead).
const Root = () => (
  <>
    <ScrollToTop />
    <Suspense fallback={null}>
      <Outlet />
    </Suspense>
  </>
);

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      // Auth
      { path: "/login",                element: <Login /> },
      { path: "/register",             element: <Register /> },
      { path: "/forgot-password",      element: <ForgotPassword /> },
      { path: "/auth/forgot-password", element: <ForgotPassword /> },
      { path: "/auth/verify-email",    element: <VerifyEmailPage /> },
      { path: "/auth/action",          element: <AuthActionPage /> },

      // Onboarding
      {
        path: "/onboarding",
        element: (
          <OnboardingRoute>
            <Onboarding />
          </OnboardingRoute>
        ),
      },

      // Landing
      { path: "/",        element: <LandingPage /> },
      { path: "/landing", element: <LandingPage /> },

      // Marketing
      { path: "/about",     element: <AboutPage /> },
      { path: "/contact",   element: <ContactPage /> },
      { path: "/community", element: <CommunityPage /> },

      // Blog system (replaces the old static BlogPage at /blog)
      { path: "/blog",                     element: <BlogIndexPage /> },
      { path: "/blog/:slug",               element: <BlogPostPage /> },
      { path: "/blog/category/:pillar",    element: <BlogCategoryPage /> },

      // Feature pages
      { path: "/war-account",    element: <WarPage /> },
      { path: "/ea-sync",        element: <EASyncPage /> },
      { path: "/business-score", element: <ScorePage /> },

      // New deep feature pages
      { path: "/features/trade-tracking",       element: <TradeTrackingPage /> },
      { path: "/features/financial-ledger",     element: <FinancialLedgerPage /> },
      { path: "/features/prop-firm-compliance", element: <PropFirmCompliancePage /> },
      { path: "/features/risk-calculators",     element: <RiskCalculatorsPage /> },
      { path: "/features/backtesting",          element: <BacktestingPage /> },
      { path: "/features/strategy",             element: <StrategyPage /> },

      // Legal
      { path: "/privacy", element: <PrivacyPolicy /> },
      { path: "/terms",   element: <TermsOfService /> },
      { path: "/cookies", element: <TrackingPolicy /> },

      // Protected app routes (lazy loaded)
      {
        element: <AppRoot />,
        children: [
          {
            element: (
              <Suspense fallback={<AppPageFallback />}>
                <Outlet />
              </Suspense>
            ),
            children: [
              { path: "/dashboard",     element: <Dashboard /> },
              { path: "/accounts",                          element: <Accounts /> },
              { path: "/accounts/:id",                      element: <AccountDetail /> },
              { path: "/accounts/:id/reconciliation",       element: <Reconciliation /> },
              { path: "/analytics",     element: <Analytics /> },
              { path: "/strategies",              element: <Strategies /> },
              { path: "/strategies/new",          element: <StrategyEditPage /> },
              { path: "/strategies/:id/edit",     element: <StrategyEditPage /> },
              { path: "/insights",      element: <Insights /> },
              { path: "/notifications", element: <Notifications /> },
              { path: "/transactions",  element: <Transactions /> },
              { path: "/trades",        element: <Trades /> },
              { path: "/score",         element: <Score /> },
              { path: "/import",        element: <ComingSoonStub title="CSV Import" /> },
              { path: "/ea",            element: <EASync /> },
              { path: "/ai",            element: <ComingSoonStub title="AI Coach" /> },
              { path: "/settings",      element: <Settings /> },
            ],
          },
        ],
      },

      // Catch-all
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
