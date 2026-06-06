import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { useAuthStore } from "@/store/useAuthStore";

// Landing page
import { LandingPage }    from "@/pages/landing/LandingPage";

// Legal pages
import { DataPolicy as PrivacyPolicy } from "@/pages/legal/DataPolicy";
import { TermsOfService }              from "@/pages/legal/TermsOfService";
import { TrackingPolicy }              from "@/pages/legal/TrackingPolicy";

// Marketing pages
import { AboutPage }     from "@/pages/marketing/AboutPage";
import { ContactPage }   from "@/pages/marketing/ContactPage";
import { BlogPage }      from "@/pages/marketing/BlogPage";
import { CommunityPage } from "@/pages/marketing/CommunityPage";

// Feature pages
import { WarPage }      from "@/pages/marketing/WarPage";
import { EASyncPage }   from "@/pages/marketing/EASyncPage";
import { ScorePage }    from "@/pages/marketing/ScorePage";


// Auth pages
import { Login }          from "@/pages/auth/Login";
import { Register }       from "@/pages/auth/Register";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";

// Onboarding
import { Onboarding } from "@/pages/onboarding/Onboarding";

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
const EASync         = lazy(() => import("@/pages/app/EASync").then(m => ({ default: m.EASync })));
const Score          = lazy(() => import("@/pages/app/Score").then(m => ({ default: m.Score })));

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

// Root layout — renders ScrollToTop on every route change then the matched page
const Root = () => (
  <>
    <ScrollToTop />
    <Outlet />
  </>
);

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      // Auth
      { path: "/login",           element: <Login /> },
      { path: "/register",        element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },

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
      { path: "/blog",      element: <BlogPage /> },
      { path: "/community", element: <CommunityPage /> },

      // Feature pages
      { path: "/war-account",    element: <WarPage /> },
      { path: "/ea-sync",        element: <EASyncPage /> },
      { path: "/business-score", element: <ScorePage /> },

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
              { path: "/accounts",      element: <Accounts /> },
              { path: "/accounts/:id",  element: <AccountDetail /> },
              { path: "/analytics",     element: <Analytics /> },
              { path: "/strategies",    element: <Strategies /> },
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
