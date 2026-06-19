import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fadeVariants } from "@/lib/animations";
import { Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import Logo from "@/components/shared/Logo";
import api from "@/lib/axios";
import { API } from "@/constants/api";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ForgotPassword = () => {
  const [loading,      setLoading]      = useState(false);
  const [sent,         setSent]         = useState(false);
  const [sentEmail,    setSentEmail]    = useState("");
  const [networkError, setNetworkError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setNetworkError(null);
    let failed = false;
    try {
      await api.post(API.AUTH.FORGOT_PASSWORD, { email: data.email });
    } catch (err) {
      // The backend always returns 200 for valid requests — a network/connectivity
      // failure means err.response is absent entirely.
      if (!err.response) {
        setNetworkError("Something went wrong. Please try again.");
        failed = true;
      }
      // Any other error (4xx / 5xx with a response): still show success to avoid
      // revealing whether the email exists in our database.
    }
    setLoading(false);
    if (!failed) {
      setSentEmail(data.email);
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 640px 640px at 50% 40%, rgba(23,61,237,0.07) 0%, transparent 70%)",
        }}
      />
      <div className="relative w-full max-w-sm">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            <div className="flex justify-center">
              <Logo variant="horizontal" size="md" />
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold font-heading">Check your inbox</h2>
                <p className="text-muted-foreground text-sm">
                  If an account exists for{" "}
                  <span className="font-medium text-foreground">{sentEmail}</span>
                  , a reset link has been sent.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Didn't get it? Check your spam folder.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secured with Firebase
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            {/* Logo + heading */}
            <div className="space-y-1 text-center">
              <div className="mb-5 flex justify-center">
                <Logo variant="horizontal" size="lg" />
              </div>
              <h1 className="text-2xl font-bold font-heading tracking-tight">Forgot password</h1>
              <p className="text-muted-foreground text-sm">
                Enter your email and we'll send a reset link
              </p>
            </div>

            {/* Form card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-5">
              {networkError && (
                <p
                  className="text-xs rounded-lg px-3 py-2 bg-destructive/10 border border-destructive/20 text-center"
                  style={{ color: "var(--loss)" }}
                >
                  {networkError}
                </p>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
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
            </div>

            {/* Trust signal */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secured with Firebase
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};
