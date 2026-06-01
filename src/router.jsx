import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useAuthStore } from "@/store/useAuthStore";

// Auth pages
import { Login }          from "@/pages/auth/Login";
import { Register }       from "@/pages/auth/Register";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";

// Onboarding
import { Onboarding } from "@/pages/onboarding/Onboarding";

// App pages
import { Dashboard }      from "@/pages/app/Dashboard";
import { Accounts }       from "@/pages/app/Accounts";
import { AccountDetail }  from "@/pages/app/AccountDetail";
import { Trades }         from "@/pages/app/Trades";
import { Transactions }   from "@/pages/app/Transactions";
import { Analytics }      from "@/pages/app/Analytics";
import { Strategies }     from "@/pages/app/Strategies";
import { Insights }       from "@/pages/app/Insights";
import { Notifications }  from "@/pages/app/Notifications";
import { Settings }      from "@/pages/app/Settings";
import { EASync }        from "@/pages/app/EASync";

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (onboardingComplete === true) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoot = () => (
  <ProtectedRoute>
    <DashboardLayout />
  </ProtectedRoute>
);

export const router = createBrowserRouter([
  // Public auth routes
  { path: "/login",           element: <Login /> },
  { path: "/register",        element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },

  // Onboarding — authenticated but not-yet-complete users
  {
    path: "/onboarding",
    element: (
      <OnboardingRoute>
        <Onboarding />
      </OnboardingRoute>
    ),
  },

  // Root redirect
  { path: "/", element: <Navigate to="/dashboard" replace /> },

  // Protected app routes — all wrapped with DashboardLayout
  {
    element: <AppRoot />,
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
      { path: "/score",         element: <ComingSoonStub title="Business Score" /> },
      { path: "/import",        element: <ComingSoonStub title="CSV Import" /> },
      { path: "/ea",            element: <EASync /> },
      { path: "/ai",            element: <ComingSoonStub title="AI Coach" /> },
      { path: "/settings",      element: <Settings /> },
    ],
  },

  // Catch all
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
