import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
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
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
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
  email:    z.email("Invalid email address"),
  password: z.string().min(6, "Password required"),
});

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mongoUser, isLoading: apiLoading } = useAuthStore();
  const [loading, setLoading]               = useState(false);
  const [googleLoading, setGoogleLoading]   = useState(false);
  const [showPassword, setShowPassword]     = useState(false);
  const [pendingSync, setPendingSync]       = useState(false);
  const from = location.state?.from?.pathname ?? "/dashboard";

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  // Navigate only after AuthProvider has finished syncing with the backend
  useEffect(() => {
    if (!pendingSync) return;
    if (apiLoading) return;

    if (mongoUser) {
      navigate(from, { replace: true });
    } else {
      // API sync failed (non-401 — 401 would have signed out already)
      toast.error("Could not connect to the server. Please try again.");
      setPendingSync(false);
      setLoading(false);
      setGoogleLoading(false);
    }
  }, [pendingSync, apiLoading, mongoUser]);

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
      const credential = await signInWithEmailAndPassword(auth, data.email, data.password);
      if (!credential.user.emailVerified) {
        // Auto-send a fresh verification email before gating them to the verify screen.
        // The backend only sends on first registration, so returning unverified users
        // would otherwise see the page with no email in their inbox.
        try {
          const idToken = await credential.user.getIdToken();
          await api.post(API.AUTH.VERIFY_EMAIL, {}, {
            headers: { Authorization: `Bearer ${idToken}` },
          });
        } catch {
          // Non-fatal — user can still resend manually from the verify page
        }
        navigate("/auth/verify-email", { replace: true });
        return;
      }
      setPendingSync(true);
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error.code));
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In — Kraviq</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <AuthLayout>
      <div className="space-y-8">
        {/* Logo + heading */}
        <div className="space-y-1">
          <div className="mb-5">
            <Logo variant="horizontal" size="lg" />
          </div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">Sign in to Kraviq</h1>
          <p className="text-muted-foreground text-sm">Your trading business OS</p>
        </div>

        {/* Form card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-5">
          {/* Google sign-in */}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            <Button type="submit" className="w-full mt-1" disabled={loading}>
              {loading ? (pendingSync ? "Setting up…" : "Signing in…") : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Create one free
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
