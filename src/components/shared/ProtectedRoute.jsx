import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

const hasSessionSkip = () => {
  try { return sessionStorage.getItem("tc_onboarding_skipped") === "true"; }
  catch { return false; }
};

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, mongoUser, onboardingComplete } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if not complete and not skipped.
  // Also check sessionStorage so hard-refresh after a local-only skip
  // (when backend is unavailable) doesn't loop back here.
  const skippedAt = mongoUser?.onboarding?.skippedAt || hasSessionSkip();
  if (onboardingComplete === false && !skippedAt) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};
