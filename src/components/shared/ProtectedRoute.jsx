import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { signOut, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, CheckCircle, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/shared/Logo";
import api from "@/lib/axios";
import { API } from "@/constants/api";

const hasSessionSkip = () => {
  try { return sessionStorage.getItem("tc_onboarding_skipped") === "true"; }
  catch { return false; }
};

// ── Email verification gate ───────────────────────────────────
// Shown to email/password users whose mongoUser.emailVerified === false.
// Google users always arrive with emailVerified === true so they never see this.
const EmailVerificationGate = () => {
  const { mongoUser, logout } = useAuthStore();

  const [verifying,  setVerifying]  = useState(false);
  const [resending,  setResending]  = useState(false);
  const [resent,     setResent]     = useState(false);
  const [cooldown,   setCooldown]   = useState(0);
  const [error,      setError]      = useState(null);

  // Countdown timer for resend cooldown
  const startCooldown = (seconds) => {
    setCooldown(seconds);
    const tick = () => setCooldown((c) => {
      if (c <= 1) return 0;
      setTimeout(tick, 1000);
      return c - 1;
    });
    setTimeout(tick, 1000);
  };

  const handleVerified = async () => {
    setError(null);
    setVerifying(true);
    try {
      // reload() fetches the latest user profile from Firebase, updating
      // auth.currentUser.emailVerified. getIdToken(true) then force-refreshes
      // the JWT so the backend receives a token with email_verified: true.
      await auth.currentUser?.reload();
      await auth.currentUser?.getIdToken(true);
    } catch {
      setError("Connection error. Please check your internet and try again.");
      setVerifying(false);
      return;
    }

    // Firebase is the hard gate — no fallthrough on unverified
    if (!auth.currentUser?.emailVerified) {
      setError("Your email hasn't been verified yet. Please click the link we sent.");
      setVerifying(false);
      return;
    }

    // Mark verified on backend, then re-sync the full user from the same
    // login endpoint AuthProvider uses — MongoDB already has emailVerified:true
    // after the verify-email call, so this returns a complete, fresh user object.
    try {
      await api.post(API.AUTH.VERIFY_EMAIL);
    } catch {
      // Non-blocking — proceed to re-sync regardless.
    }
    try {
      const response = await api.post(API.AUTH.LOGIN, {
        displayName: auth.currentUser?.displayName ?? "",
        photoURL:    auth.currentUser?.photoURL    ?? "",
      });
      if (response?.user) {
        useAuthStore.getState().setMongoUser(response.user);
      }
      if (response?.onboardingComplete !== undefined) {
        useAuthStore.getState().setOnboardingComplete(response.onboardingComplete);
      }
    } catch {
      // Fallback: patch the field directly if the re-sync call fails.
      const current = useAuthStore.getState().mongoUser;
      if (current) useAuthStore.getState().setMongoUser({ ...current, emailVerified: true });
    }
    setVerifying(false);
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setResent(true);
      toast.success("Verification email sent. Check your inbox.");
      startCooldown(60);
    } catch (err) {
      if (err?.code === "auth/too-many-requests") {
        toast.error("Too many requests — please wait a moment before trying again.");
        startCooldown(60);
      } else {
        toast.error("Could not resend. Try again in a moment.");
      }
    } finally {
      setResending(false);
    }
  };

  const handleSignOut = () => {
    signOut(auth).catch(() => {}); // fire-and-forget
    logout();
  };

  const email = mongoUser?.email ?? "";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo variant="horizontal" size="lg" />
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl space-y-6">
          {/* Icon + heading */}
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold font-heading text-foreground">
                Verify your email
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We sent a verification link to
              </p>
              <p className="text-sm font-semibold text-primary break-all">{email}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                Click the link in your email, then come back here.
                Check your spam folder if you don't see it.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-center rounded-lg px-3 py-2 bg-destructive/10 border border-destructive/20"
               style={{ color: "var(--loss)" }}>
              {error}
            </p>
          )}

          {/* I've verified button */}
          <Button className="w-full gap-2" onClick={handleVerified} disabled={verifying}>
            {verifying ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Checking...</>
            ) : (
              <>I've verified my email</>
            )}
          </Button>

          {/* Resend */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resending ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : resent ? (
                <CheckCircle className="h-3.5 w-3.5 text-[var(--profit)]" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              {cooldown > 0
                ? `Resend in ${cooldown}s`
                : resent
                ? "Email resent"
                : "Resend verification email"}
            </button>
          </div>

          {/* Sign out */}
          <div className="pt-2 border-t border-border flex justify-center">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-3 w-3" />
              Sign out and use a different account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Protected route ───────────────────────────────────────────
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

  // Block email/password users who haven't verified their email.
  // Google users always have emailVerified === true so this never triggers for them.
  if (mongoUser && mongoUser.emailVerified === false) {
    return <EmailVerificationGate />;
  }

  // Redirect to onboarding if not complete and not skipped.
  const skippedAt = mongoUser?.onboarding?.skippedAt || hasSessionSkip();
  if (onboardingComplete === false && !skippedAt) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};
