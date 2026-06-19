import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, RefreshCw, CheckCircle, ArrowRight, LogOut, Loader2, ShieldCheck } from "lucide-react";
import Logo from "@/components/shared/Logo";
import api from "@/lib/axios";
import { API } from "@/constants/api";
import { useResendVerification } from "@/hooks/useResendVerification";

/**
 * Standalone email verification pending screen.
 * Route: /auth/verify-email (public — excluded from auth guard redirect loop)
 *
 * Shown after signup (navigated to from Register) and when a logged-in user
 * with emailVerified === false tries to access the app.
 */
export const VerifyEmailPage = () => {
  const navigate                                            = useNavigate();
  const { mongoUser, logout }                               = useAuthStore();
  const { resend, status: resendStatus, countdown }         = useResendVerification();
  const [continueLoading, setContinueLoading]               = useState(false);
  const [continueError,   setContinueError]                 = useState(null);

  const email = auth.currentUser?.email ?? mongoUser?.email ?? "";

  // ── Resend handler ──────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0 || resendStatus === "loading") return;

    const user = auth.currentUser;
    if (!user) {
      toast.error("Not signed in. Please sign in again.");
      navigate("/login", { replace: true });
      return;
    }

    const idToken = await user.getIdToken();
    await resend(idToken);
  };

  // Handle the "already verified" status returned by the hook.
  // Must be in useEffect — never call navigate/toast from the render body.
  useEffect(() => {
    if (resendStatus === "already-verified") {
      toast.success("Email already verified — please sign in");
      navigate("/login", { replace: true });
    }
  }, [resendStatus]);

  // ── "Already verified? Continue" handler ───────────────────────
  const handleContinue = async () => {
    setContinueError(null);
    setContinueLoading(true);

    try {
      // Force Firebase to fetch the latest user profile so emailVerified reflects reality
      await auth.currentUser?.reload();
    } catch {
      setContinueError("Connection error. Check your internet and try again.");
      setContinueLoading(false);
      return;
    }

    if (!auth.currentUser?.emailVerified) {
      setContinueError("Email not verified yet — check your inbox and click the link.");
      setContinueLoading(false);
      return;
    }

    // Force-refresh the JWT so the backend receives email_verified: true
    try {
      await auth.currentUser?.getIdToken(true);
    } catch {
      // Non-fatal
    }

    // Mark verified on backend (non-blocking), then re-sync the full user object
    try {
      await api.post(API.AUTH.VERIFY_EMAIL);
    } catch {
      // Non-blocking
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
      const current = useAuthStore.getState().mongoUser;
      if (current) useAuthStore.getState().setMongoUser({ ...current, emailVerified: true });
    }

    setContinueLoading(false);
    const { mongoUser: fresh, onboardingComplete } = useAuthStore.getState();
    if (fresh) {
      const skippedAt = fresh?.onboarding?.skippedAt;
      if (onboardingComplete === false && !skippedAt) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  // ── Sign out handler ────────────────────────────────────────────
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  // ── Resend button label ─────────────────────────────────────────
  const resendLabel = () => {
    if (resendStatus === "loading") return "Sending...";
    if (countdown > 0)              return `Resend in ${countdown}s`;
    if (resendStatus === "success") return "Email resent";
    return "Resend verification email";
  };

  const resendDisabled = resendStatus === "loading" || countdown > 0;

  return (
    <>
      <Helmet>
        <title>Verify your email — Kraviq</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 640px 640px at 50% 40%, rgba(23,61,237,0.07) 0%, transparent 70%)",
          }}
        />
        <div className="relative w-full max-w-sm">
      <div className="space-y-8">
          {/* Logo + heading */}
          <div className="space-y-1 text-center flex flex-col items-center">
            <div className="mb-5">
              <Logo variant="horizontal" size="lg" />
            </div>
            <h1 className="text-2xl font-bold font-heading tracking-tight">Check your inbox</h1>
            <p className="text-muted-foreground text-sm">
              One step before you start trading
            </p>
          </div>

          {/* Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-6">
            {/* Icon + message */}
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-foreground">
                  We sent a verification link to
                </p>
                {email && (
                  <p className="text-sm font-semibold text-primary break-all">{email}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Click the link in the email to activate your Kraviq account.
                  Check your spam folder if you don't see it within a minute.
                </p>
              </div>
            </div>

            {/* Resend feedback messages */}
            {resendStatus === "rate-limited" && (
              <p className="text-xs text-center rounded-lg px-3 py-2 bg-warning/10 border border-warning/20 text-warning">
                Too many attempts. Please wait a few minutes before trying again.
              </p>
            )}
            {resendStatus === "error" && (
              <p
                className="text-xs text-center rounded-lg px-3 py-2 bg-destructive/10 border border-destructive/20"
                style={{ color: "var(--loss)" }}
              >
                Something went wrong. Please try again.
              </p>
            )}
            {resendStatus === "success" && countdown > 0 && (
              <p className="text-xs text-center text-[var(--profit)]">
                Sent — check your inbox (including spam)
              </p>
            )}

            {/* Continue error */}
            {continueError && (
              <p
                className="text-xs text-center rounded-lg px-3 py-2 bg-destructive/10 border border-destructive/20"
                style={{ color: "var(--loss)" }}
              >
                {continueError}
              </p>
            )}

            {/* Already verified? Continue */}
            <Button className="w-full gap-2" onClick={handleContinue} disabled={continueLoading}>
              {continueLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Already verified? Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            {/* Resend */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendDisabled}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {resendStatus === "loading" ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : resendStatus === "success" ? (
                  <CheckCircle className="h-3.5 w-3.5 text-[var(--profit)]" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                {resendLabel()}
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
                Wrong email? Sign out
              </button>
            </div>
          </div>

          {/* Trust signal */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secured with Firebase
          </div>
        </div>
        </div>
      </div>
    </>
  );
};
