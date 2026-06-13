import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
} from "firebase/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { auth, googleProvider } from "@/lib/firebase";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, CheckCircle, RefreshCw, ArrowRight, Loader2 } from "lucide-react";
import Logo from "@/components/shared/Logo";
import api from "@/lib/axios";
import { API } from "@/constants/api";

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const schema = z.object({
  email:           z.string().email("Invalid email"),
  password:        z.string().min(8, "At least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ── Email verification screen shown after email/password sign-up ──
const VerifyEmailScreen = ({ email, onContinue, onResend, continueLoading, verifyError }) => {
  const [resending, setResending] = useState(false);
  const [resent,    setResent]    = useState(false);
  const [cooldown,  setCooldown]  = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    try {
      await onResend();
      setResent(true);
      setCooldown(60);
      toast.success("Verification email resent.");
    } catch (err) {
      if (err?.code === "auth/too-many-requests") {
        toast.error("Too many requests — please wait a moment before trying again.");
      } else {
        toast.error("Could not resend — please try again shortly.");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <div className="mb-5">
          <Logo variant="horizontal" size="lg" />
        </div>
        <h1 className="text-2xl font-bold font-heading tracking-tight">Check your inbox</h1>
        <p className="text-muted-foreground text-sm">
          One step before you start trading
        </p>
      </div>

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
            <p className="text-sm font-semibold text-primary break-all">{email}</p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Click the link in that email to verify your account.
              Check your spam folder if you don't see it within a minute.
            </p>
          </div>
        </div>

        {/* Inline error when backend says not verified yet */}
        {verifyError && (
          <p className="text-xs text-center" style={{ color: "var(--loss)" }}>
            {verifyError}
          </p>
        )}

        {/* Continue button */}
        <Button className="w-full gap-2" onClick={onContinue} disabled={continueLoading}>
          {continueLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
          ) : (
            <>I've verified my email — Continue <ArrowRight className="h-4 w-4" /></>
          )}
        </Button>

        {/* Resend */}
        <div className="flex items-center justify-center gap-2">
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

        {/* Skip verification */}
        <p className="text-center text-xs text-muted-foreground/70">
          <button
            type="button"
            onClick={onContinue}
            disabled={continueLoading}
            className="underline underline-offset-2 hover:text-muted-foreground transition-colors disabled:opacity-50"
          >
            Skip for now — verify later
          </button>
        </p>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
        <ShieldCheck className="h-3.5 w-3.5" />
        Secured with Firebase
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────
export const Register = () => {
  const navigate = useNavigate();
  const { mongoUser, onboardingComplete, isLoading: apiLoading } = useAuthStore();

  const [view,          setView]          = useState("form"); // "form" | "verify-email"
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [pendingSync,   setPendingSync]   = useState(false);
  const [pendingEmail,  setPendingEmail]  = useState("");
  const [showPassword,  setShowPassword]  = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError,   setVerifyError]   = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  // Navigate only after AuthProvider has finished syncing with the backend
  useEffect(() => {
    if (!pendingSync) return;
    if (apiLoading) return;
    if (mongoUser) {
      const skippedAt = mongoUser?.onboarding?.skippedAt;
      if (onboardingComplete === false && !skippedAt) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } else {
      toast.error("Could not connect to the server. Please try again.");
      setPendingSync(false);
      setLoading(false);
      setGoogleLoading(false);
    }
  }, [pendingSync, apiLoading, mongoUser, onboardingComplete]);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setPendingSync(true);
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error(getFirebaseErrorMessage(error.code));
      }
      setGoogleLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth, data.email, data.password
      );
      await sendEmailVerification(credential.user);
      // Show the "check your inbox" screen instead of navigating immediately.
      // AuthProvider's onAuthStateChanged fires in the background and syncs
      // the user with the backend — by the time the user clicks "Continue",
      // mongoUser will already be ready.
      setPendingEmail(data.email);
      setView("verify-email");
      setLoading(false);
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error.code));
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!auth.currentUser) throw new Error("No current user");
    await sendEmailVerification(auth.currentUser);
  };

  const handleContinueAfterVerify = async () => {
    setVerifyError(null);
    setVerifyLoading(true);
    try {
      // reload() fetches the latest user profile from Firebase, updating
      // auth.currentUser.emailVerified. getIdToken(true) then force-refreshes
      // the JWT so the backend receives a token with email_verified: true.
      await auth.currentUser?.reload();
      await auth.currentUser?.getIdToken(true);
    } catch {
      setVerifyError("Could not reach Firebase. Check your connection and try again.");
      setVerifyLoading(false);
      return;
    }

    // Firebase is the authoritative source — hard block if not verified
    if (!auth.currentUser?.emailVerified) {
      setVerifyError("Please click the verification link in your email first.");
      setVerifyLoading(false);
      return;
    }

    // Mark verified on backend, then re-sync the full user from the same
    // login endpoint AuthProvider uses so the store gets a fresh, complete object.
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
      // Fallback: patch directly if the re-sync call fails.
      const current = useAuthStore.getState().mongoUser;
      if (current) useAuthStore.getState().setMongoUser({ ...current, emailVerified: true });
    }

    setVerifyLoading(false);
    const { mongoUser: freshUser, onboardingComplete: freshOnboarding } = useAuthStore.getState();
    if (freshUser) {
      const skippedAt = freshUser?.onboarding?.skippedAt;
      if (freshOnboarding === false && !skippedAt) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } else {
      setPendingSync(true);
    }
  };

  if (view === "verify-email") {
    return (
      <>
        <Helmet>
          <title>Verify Email — Kraviq</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <AuthLayout>
          <VerifyEmailScreen
            email={pendingEmail}
            onContinue={handleContinueAfterVerify}
            onResend={handleResend}
            continueLoading={verifyLoading}
            verifyError={verifyError}
          />
        </AuthLayout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Create Account — Kraviq</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <AuthLayout>
        <div className="space-y-8">
          {/* Logo + heading */}
          <div className="space-y-1">
            <div className="mb-5">
              <Logo variant="horizontal" size="lg" />
            </div>
            <h1 className="text-2xl font-bold font-heading tracking-tight">Create your Kraviq account</h1>
            <p className="text-muted-foreground text-sm">
              Start running your trading business professionally
            </p>
          </div>

          {/* Form card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-5">
            {/* Google sign-up */}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={handleGoogle}
              disabled={googleLoading || loading}
            >
              <GoogleIcon />
              {googleLoading ? (pendingSync ? "Setting up…" : "Connecting…") : "Continue with Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="trader@example.com"
                    autoComplete="email"
                    className="pl-9"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    className="pl-9 pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className="pl-9 pr-10"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full mt-1" disabled={loading}>
                {loading ? "Creating account…" : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>

          {/* Trust signal */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secured with Firebase
          </div>
        </div>
      </AuthLayout>
    </>
  );
};
