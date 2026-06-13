import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useAccounts } from "@/hooks/useAccounts";

const hasSessionSkip = () => {
  try { return sessionStorage.getItem("tc_onboarding_skipped") === "true"; }
  catch { return false; }
};

// Only the two steps that drive isComplete, per FRONTEND.md
const STEPS = [
  { key: "profile_setup",       label: "Profile" },
  { key: "preferences_set",     label: "Preferences" },
  { key: "first_account_created", label: "Account" },
];

export const ContinueSetupBanner = () => {
  const { mongoUser, onboardingComplete } = useAuthStore();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  // Check both the persisted DB value AND the sessionStorage fallback that
  // is set when the backend skip endpoint is unavailable (known TDZ bug).
  const skippedAt = mongoUser?.onboarding?.skippedAt || hasSessionSkip();

  // Live account check — completedSteps.includes("first_account_created") is only
  // set when the full onboarding wizard runs; checking live data means adding an
  // account from anywhere ticks the step immediately.
  const { data: accountsData } = useAccounts({ limit: 1 });
  const hasAccount = (accountsData?.accounts?.length ?? 0) > 0;

  if (onboardingComplete !== false || !skippedAt || dismissed) return null;

  const completedSteps = mongoUser?.onboarding?.completedSteps ?? [];

  const isStepDone = (key) => {
    if (key === "first_account_created") return hasAccount;
    return completedSteps.includes(key);
  };

  const doneCount = STEPS.filter((s) => isStepDone(s.key)).length;
  const remaining = STEPS.length - doneCount;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="overflow-hidden"
        style={{ borderBottom: "1px solid color-mix(in srgb, var(--primary) 20%, var(--border))" }}
      >
        <div
          className="px-4 sm:px-6 h-10 flex items-center justify-between gap-4"
          style={{ backgroundColor: "color-mix(in srgb, var(--primary) 6%, transparent)" }}
        >
          {/* Left: step dots + message */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Step dots — hidden on very small screens */}
            <div className="hidden sm:flex items-center gap-1.5">
              {STEPS.map((step) => {
                const done = isStepDone(step.key);
                return (
                  <span
                    key={step.key}
                    title={step.label}
                    className="flex items-center gap-1 text-[10px] font-medium"
                    style={{ color: done ? "var(--primary)" : "var(--muted-foreground)" }}
                  >
                    {done
                      ? <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                      : <Circle className="h-3 w-3 flex-shrink-0" />
                    }
                    <span className="hidden md:inline">{step.label}</span>
                  </span>
                );
              })}
            </div>

            {/* Separator */}
            <span className="hidden sm:block text-muted-foreground/30 text-xs">|</span>

            <p className="text-xs text-muted-foreground truncate">
              {remaining === STEPS.length
                ? "Finish setting up your account to unlock all features"
                : remaining === 1
                ? "One step left — finish your account setup"
                : `${remaining} steps remaining to complete setup`}
            </p>
          </div>

          {/* Right: CTA + dismiss */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button
              size="sm"
              className="h-6 text-xs px-2.5 gap-1"
              onClick={() => navigate("/onboarding")}
            >
              Continue
              <ArrowRight className="h-3 w-3" />
            </Button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
