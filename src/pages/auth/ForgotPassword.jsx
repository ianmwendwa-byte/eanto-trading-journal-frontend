import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fadeVariants } from "@/lib/animations";
import { Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import Logo from "@/components/shared/Logo";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
    } catch {
      // Always show success — don't reveal if email exists
    } finally {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            <div className="flex items-center gap-2">
              <Logo variant="horizontal" theme="dark" size="md" />
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold font-heading">Check your email</h2>
                <p className="text-muted-foreground text-sm">
                  If an account exists with that email, a reset link has been sent.
                </p>
              </div>
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
            <div className="space-y-1">
              <div className="mb-5">
                <Logo variant="horizontal" theme="dark" size="md" />
              </div>
              <h1 className="text-2xl font-bold font-heading tracking-tight">Reset your password</h1>
              <p className="text-muted-foreground text-sm">Enter your email for a reset link</p>
            </div>

            {/* Form card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-5">
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
                  {loading ? "Sending…" : "Send Reset Link"}
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
    </AuthLayout>
  );
};
