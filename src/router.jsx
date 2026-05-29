import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

// Auth pages
import { Login }          from "@/pages/auth/Login";
import { Register }       from "@/pages/auth/Register";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";

// App pages
import { Dashboard }      from "@/pages/app/Dashboard";
import { Accounts }       from "@/pages/app/Accounts";
import { AccountDetail }  from "@/pages/app/AccountDetail";
import { Trades }         from "@/pages/app/Trades";
import { Analytics }      from "@/pages/app/Analytics";
import { Strategies }     from "@/pages/app/Strategies";
import { Insights }       from "@/pages/app/Insights";
import { Notifications }  from "@/pages/app/Notifications";

const ComingSoonStub = ({ title }) => (
  <div className="p-6 flex items-center justify-center min-h-[60vh]">
    <div className="text-center space-y-2">
      <p className="font-heading font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">Coming soon</p>
    </div>
  </div>
);

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
      { path: "/transactions",  element: <ComingSoonStub title="Transactions" /> },
      { path: "/trades",        element: <Trades /> },
      { path: "/score",         element: <ComingSoonStub title="Business Score" /> },
      { path: "/import",        element: <ComingSoonStub title="CSV Import" /> },
      { path: "/ea",            element: <ComingSoonStub title="EA Sync" /> },
      { path: "/ai",            element: <ComingSoonStub title="AI Coach" /> },
      { path: "/settings",      element: <ComingSoonStub title="Settings" /> },
    ],
  },

  // Catch all
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
