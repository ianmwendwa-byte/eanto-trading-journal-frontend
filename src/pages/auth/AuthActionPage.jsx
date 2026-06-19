import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  applyActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { staggerContainerVariants, staggerItemVariants, fadeVariants } from "@/lib/animations";
import {
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import Logo from "@/components/shared/Logo";

// ── Error mapping ──────────────────────────────────────────────────────────────
const mapFirebaseError = (code) => {
  const errors = {
    "auth/expired-action-code":
      "This link has expired. Please request a new one from the sign in page.",
    "auth/invalid-action-code":
      "This link has already been used or is invalid. Please request a new one.",
    "auth/user-disabled":
      "This account has been disabled. Please contact support.",
    "auth/user-not-found":
      "No account was found for this link.",
    "auth/weak-password":
      "Please choose a stronger password (at least 8 characters).",
  };
  return errors[code] ?? "An unexpected error occurred. Please try again or return to sign in.";
};

// ── Password reset form schema ────────────────────────────────────────────────
const resetSchema = z
  .object({
    password:        z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// ── Animated icon container (success / error) ──────────────────────────────
const IconBubble = ({ variant, children }) => {
  const isSuccess = variant === "success";
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
      className="flex items-center justify-center mx-auto"
      style={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: isSuccess
          ? "color-mix(in srgb, var(--success) 15%, transparent)"
          : "color-mix(in srgb, var(--danger) 15%, transparent)",
        border: isSuccess
          ? "1px solid color-mix(in srgb, var(--success) 30%, transparent)"
          : "1px solid color-mix(in srgb, var(--danger) 30%, transparent)",
      }}
    >
      {children}
    </motion.div>
  );
};

// ── Loading skeleton — mirrors the success state layout to avoid shift ────────
const LoadingSkeleton = () => (
  <div
    data-testid="loading-skeleton"
    className="bg-card border border-border rounded-2xl p-6 shadow-xl flex flex-col items-center gap-4 text-center"
  >
    {/* Icon placeholder */}
    <Skeleton className="w-14 h-14 rounded-full" />
    {/* Heading placeholder */}
    <Skeleton className="h-6 w-3/5 rounded-md" />
    {/* Body text placeholder */}
    <Skeleton className="h-4 w-4/5 rounded-md" />
    <Skeleton className="h-4 w-3/4 rounded-md" />
    {/* Button placeholder */}
    <Skeleton className="h-9 w-full rounded-md mt-2" />
  </div>
);

// ── Stagger wrapper for card contents ────────────────────────────────────────
const StaggerCard = ({ children }) => (
  <motion.div
    variants={staggerContainerVariants}
    initial="initial"
    animate="animate"
    className="bg-card border border-border rounded-2xl p-6 shadow-xl flex flex-col items-center gap-4 text-center"
  >
    {children}
  </motion.div>
);

const StaggerItem = ({ children, className = "" }) => (
  <motion.div variants={staggerItemVariants} className={className}>
    {children}
  </motion.div>
);

// ── Verify success state ───────────────────────────────────────────────────────
const VerifySuccess = ({ onContinue }) => (
  <StaggerCard>
    <StaggerItem>
      <IconBubble variant="success">
        <Check className="h-6 w-6" style={{ color: "var(--success)" }} />
      </IconBubble>
    </StaggerItem>
    <StaggerItem className="space-y-1">
      <h2 className="text-xl font-semibold font-heading">Email verified</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Your email has been verified. You can now sign in to Kraviq.
      </p>
    </StaggerItem>
    <StaggerItem className="w-full">
      <Button className="w-full" onClick={onContinue}>
        Continue to Kraviq
      </Button>
    </StaggerItem>
  </StaggerCard>
);

// ── Reset success state ────────────────────────────────────────────────────────
const ResetSuccess = ({ onSignIn }) => (
  <StaggerCard>
    <StaggerItem>
      <IconBubble variant="success">
        <Check className="h-6 w-6" style={{ color: "var(--success)" }} />
      </IconBubble>
    </StaggerItem>
    <StaggerItem className="space-y-1">
      <h2 className="text-xl font-semibold font-heading">Password reset</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Your password has been updated. You can now sign in.
      </p>
    </StaggerItem>
    <StaggerItem className="w-full">
      <Button className="w-full" onClick={onSignIn}>
        Sign in to Kraviq
      </Button>
    </StaggerItem>
  </StaggerCard>
);

// ── Error state ────────────────────────────────────────────────────────────────
const ErrorState = ({ message }) => (
  <StaggerCard>
    <StaggerItem>
      <IconBubble variant="error">
        <AlertCircle className="h-6 w-6" style={{ color: "var(--danger)" }} />
      </IconBubble>
    </StaggerItem>
    <StaggerItem className="space-y-1">
      <h2 className="text-xl font-semibold font-heading">Something went wrong</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
    </StaggerItem>
    <StaggerItem className="w-full">
      <Button variant="outline" className="w-full" asChild>
        <Link to="/login">Back to sign in</Link>
      </Button>
    </StaggerItem>
  </StaggerCard>
);

// ── Reset password form ────────────────────────────────────────────────────────
const ResetForm = ({ email, onSubmit: handlePasswordReset }) => {
  const [showPassword,  setShowPassword]  = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [submitting,    setSubmitting]    = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetSchema) });

  const onSubmit = async ({ password }) => {
    setSubmitting(true);
    try {
      await handlePasswordReset(password);
    } finally {
      // Parent will transition state on success; re-enable on failure so user can retry
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      variants={fadeVariants}
      initial="initial"
      animate="animate"
      className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-5"
    >
      {/* Header */}
      <div className="space-y-0.5">
        <h2 className="text-xl font-semibold font-heading">Reset password</h2>
        {email && (
          <p className="text-sm text-muted-foreground">
            for{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New password */}
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
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
          <Label htmlFor="confirmPassword">Confirm password</Label>
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

        <Button type="submit" className="w-full mt-1" disabled={submitting}>
          {submitting ? "Resetting..." : "Reset password"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </p>
    </motion.div>
  );
};

// ── Page title map ─────────────────────────────────────────────────────────────
const pageTitles = {
  loading:        "Verifying — Kraviq",
  "verify-success": "Email Verified — Kraviq",
  "reset-form":   "Reset Password — Kraviq",
  "reset-success": "Password Reset — Kraviq",
  error:          "Link Error — Kraviq",
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const AuthActionPage = () => {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const mode       = params.get("mode");
  const oobCode    = params.get("oobCode");

  const [state,        setState]        = useState("loading");
  const [email,        setEmail]        = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!oobCode || !mode) {
      setErrorMessage(mapFirebaseError(null));
      setState("error");
      return;
    }

    if (mode === "verifyEmail") {
      applyActionCode(auth, oobCode)
        .then(() => setState("verify-success"))
        .catch((err) => {
          setErrorMessage(mapFirebaseError(err.code));
          setState("error");
        });
    } else if (mode === "resetPassword") {
      verifyPasswordResetCode(auth, oobCode)
        .then((emailAddr) => {
          setEmail(emailAddr);
          setState("reset-form");
        })
        .catch((err) => {
          setErrorMessage(mapFirebaseError(err.code));
          setState("error");
        });
    } else {
      setErrorMessage(mapFirebaseError(null));
      setState("error");
    }
  }, []); // run once on mount — params are stable

  const handlePasswordReset = async (newPassword) => {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setState("reset-success");
    } catch (err) {
      setErrorMessage(mapFirebaseError(err.code));
      setState("error");
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitles[state] ?? "Kraviq"}</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <AuthLayout>
        <motion.div
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Logo — same as all other auth pages */}
          <div className="space-y-1">
            <div className="mb-5">
              <Logo variant="horizontal" size="lg" />
            </div>
            {/* Contextual heading above card */}
            {state === "loading" && (
              <>
                <h1 className="text-2xl font-bold font-heading tracking-tight">
                  Just a moment…
                </h1>
                <p className="text-muted-foreground text-sm">
                  Verifying your link
                </p>
              </>
            )}
            {state === "reset-form" && (
              <>
                <h1 className="text-2xl font-bold font-heading tracking-tight">
                  Reset password
                </h1>
                <p className="text-muted-foreground text-sm">
                  Choose a new password for your account
                </p>
              </>
            )}
            {(state === "verify-success" || state === "reset-success") && (
              <>
                <h1 className="text-2xl font-bold font-heading tracking-tight">
                  All done
                </h1>
                <p className="text-muted-foreground text-sm">
                  You're all set
                </p>
              </>
            )}
            {state === "error" && (
              <>
                <h1 className="text-2xl font-bold font-heading tracking-tight">
                  Link error
                </h1>
                <p className="text-muted-foreground text-sm">
                  We couldn't process this link
                </p>
              </>
            )}
          </div>

          {/* Card area — AnimatePresence handles state transitions */}
          <AnimatePresence mode="wait">
            {state === "loading" && (
              <motion.div
                key="loading"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <LoadingSkeleton />
              </motion.div>
            )}

            {state === "verify-success" && (
              <motion.div
                key="verify-success"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <VerifySuccess onContinue={() => navigate("/login")} />
              </motion.div>
            )}

            {state === "reset-form" && (
              <motion.div
                key="reset-form"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <ResetForm email={email} onSubmit={handlePasswordReset} />
              </motion.div>
            )}

            {state === "reset-success" && (
              <motion.div
                key="reset-success"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <ResetSuccess onSignIn={() => navigate("/login")} />
              </motion.div>
            )}

            {state === "error" && (
              <motion.div
                key="error"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <ErrorState message={errorMessage} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust signal — same footer as all other auth pages */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secured with Firebase
          </div>
        </motion.div>
      </AuthLayout>
    </>
  );
};
