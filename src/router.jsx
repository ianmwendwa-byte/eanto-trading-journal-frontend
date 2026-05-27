import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

// Auth pages
import { Login }          from "@/pages/auth/Login";
import { Register }       from "@/pages/auth/Register";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";

// App pages
import { Dashboard }  from "@/pages/app/Dashboard";
import { Analytics }  from "@/pages/app/Analytics";
import { Strategies } from "@/pages/app/Strategies";
import { Insights }   from "@/pages/app/Insights";

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
      { path: "/dashboard",    element: <Dashboard /> },
      { path: "/analytics",    element: <Analytics /> },
      { path: "/strategies",   element: <Strategies /> },
      { path: "/insights",     element: <Insights /> },
      { path: "/accounts",     element: <ComingSoonStub title="Accounts" /> },
      { path: "/transactions", element: <ComingSoonStub title="Transactions" /> },
      { path: "/trades",       element: <ComingSoonStub title="Trades" /> },
      { path: "/score",        element: <ComingSoonStub title="Business Score" /> },
      { path: "/import",       element: <ComingSoonStub title="CSV Import" /> },
      { path: "/ea",           element: <ComingSoonStub title="EA Sync" /> },
      { path: "/ai",           element: <ComingSoonStub title="AI Coach" /> },
      { path: "/notifications",element: <ComingSoonStub title="Notifications" /> },
      { path: "/settings",     element: <ComingSoonStub title="Settings" /> },
    ],
  },

  // Catch all
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
