import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, TrendingUp } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter,
} from "@/components/ui/alert-dialog";

import { WelcomeStep }          from "@/components/onboarding/WelcomeStep";
import { StepIndicator }        from "@/components/onboarding/StepIndicator";
import { TraderTypeStep }       from "@/components/onboarding/TraderTypeStep";
import { ProfileStep }          from "@/components/onboarding/ProfileStep";
import { TradingStyleStep }     from "@/components/onboarding/TradingStyleStep";
import { PreferencesStep }      from "@/components/onboarding/PreferencesStep";
import { AccountCreationStep }  from "@/components/onboarding/AccountCreationStep";

import {
  useCompleteOnboarding,
  useSkipOnboarding,
  buildOnboardingPayload,
} from "@/hooks/useOnboarding";
import { useUpdateDashboardPreferences } from "@/hooks/useDashboard";
import { useAccounts } from "@/hooks/useAccounts";
import { useAuthStore } from "@/store/useAuthStore";
import { DEFAULT_WIDGETS } from "@/constants/widgets";

// ── Widget presets per trader type ────────────────────────────
const widgetPresets = {
  manual:      ["personal_overview", "win_rate", "avg_rr", "streak", "recent_trades", "pair_performance", "balance_history"],
  prop:        ["prop_overview", "prop_challenges", "win_rate", "recent_trades", "balance_history"],
  ea:          ["personal_overview", "win_rate", "recent_trades", "balance_history"],
  "semi-auto": ["personal_overview", "win_rate", "recent_trades", "balance_history"],
};

// ── Left context panel copy ───────────────────────────────────
const CONTEXT = [
  {
    title:    "Build your trading identity",
    tip:      "Choose the trader type that best describes you for a personalized experience.",
    features: ["Personalized dashboard layout", "Relevant analytics widgets", "Tailored AI coaching style"],
  },
  {
    title:    "Your identity, secured",
    tip:      "Your profile helps us personalize your experience and secure your account.",
    features: ["Account recovery options", "Personalized debrief emails", "Timezone-aware reporting"],
  },
  {
    title:    "We'll track what matters",
    tip:      "Your trading style shapes your analytics, pair performance reports and session stats.",
    features: ["Session-based performance analysis", "Pair performance tracking", "Style-specific insights"],
  },
  {
    title:    "Your AI coach, your way",
    tip:      "Set up how your AI coach communicates and what it alerts you about.",
    features: ["Personalized AI tone", "Weekly debrief on your schedule", "Relevant trade alerts only"],
  },
  {
    title:    "Start tracking immediately",
    tip:      "Create your first account to begin logging trades and monitoring performance.",
    features: ["Unlimited trade logging", "Real-time performance cache", "Prop firm compliance tracking"],
  },
];

// ── Step transition variants ──────────────────────────────────
const variants = {
  initial: (dir) => ({ opacity: 0, x: dir * 40 }),
  animate: { opacity: 1, x: 0, transition: { duration: 0.22, ease: "easeOut" } },
  exit:    (dir) => ({ opacity: 0, x: dir * -40, transition: { duration: 0.18, ease: "easeIn" } }),
};

// ── Default wizard state ──────────────────────────────────────
const DEFAULT_WIZARD = {
  traderType:          null,
  experienceLevel:     "beginner",
  tradingModes:        [],
  tradingStyles:       [],
  primaryPairs:        [],
  preferredSessions:   [],
  bio:                 "",
  firstName:           "",
  lastName:            "",
  phoneNumber:         "",
  timezone:            "UTC",
  country:             "",
  emailDigest:         "weekly",
  tradeAlerts:         true,
  drawdownWarnings:    true,
  weeklyDebrief:       true,
  pushEnabled:         false,
  agentTone:           "analyst",
  preferredDebriefDay: "sunday",
};

// ── Draft helpers ─────────────────────────────────────────────
const makeDraftKey = (userId) => `kv_onboarding_draft_${userId ?? "guest"}`;

const loadDraft = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveDraft = (key, step, wizardData) => {
  try {
    localStorage.setItem(key, JSON.stringify({ step, wizardData }));
  } catch { /* storage unavailable — ignore */ }
};

const clearDraft = (key) => {
  try { localStorage.removeItem(key); } catch { /* storage unavailable — ignore */ }
};

// ── Profile validity heuristic from saved data ────────────────
const profileValidFromDraft = (d) =>
  !!(d?.firstName?.length >= 2 && d?.lastName?.length >= 2 &&
     d?.phoneNumber?.length >= 5 && d?.timezone);

// ── Main component ────────────────────────────────────────────
export const Onboarding = () => {
  const navigate   = useNavigate();
  const [direction, setDirection] = useState(1);
  const { mongoUser } = useAuthStore();

  // Live check — completedSteps flag is only set after the full wizard completes,
  // so also check the accounts API directly so a pre-existing account hides step 5.
  const { data: accountsData } = useAccounts({ limit: 1 });
  const hasAccount =
    (mongoUser?.onboarding?.completedSteps?.includes("first_account_created") ?? false) ||
    (accountsData?.accounts?.length ?? 0) > 0;
  const totalSteps = hasAccount ? 4 : 5;

  // Draft key is user-specific so different accounts don't share state
  const draftKey = makeDraftKey(mongoUser?._id);

  // ── Restore from draft on first render ─────────────────────
  // useMemo runs synchronously at first render — mongoUser is already
  // available here because ProtectedRoute guarantees auth completion.
  const draft = (() => {
    try { return loadDraft(draftKey); } catch { return null; }
  })();

  // Restore step: jump past welcome if returning to a draft.
  // Cap at totalSteps so a draft at step 5 doesn't render step 5
  // when the user has since created an account.
  const [step, setStep] = useState(() => {
    const draftStep = draft?.step >= 1 ? draft.step : 0;
    return Math.min(draftStep, totalSteps);
  });

  // Restore wizard data, merging with defaults so added fields always exist
  const [wizardData, setWizardData] = useState(
    () => draft?.wizardData
      ? { ...DEFAULT_WIZARD, ...draft.wizardData }
      : DEFAULT_WIZARD
  );

  // Restore profile validity from saved data so step-2 canContinue() works
  const [profileValid, setProfileValid] = useState(
    () => profileValidFromDraft(draft?.wizardData)
  );

  const [skipDialog,   setSkipDialog]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: complete } = useCompleteOnboarding();
  const { mutate:      skip }     = useSkipOnboarding();
  const { mutate:      updateWidgets } = useUpdateDashboardPreferences();

  // ── Show "continuing" toast when restoring a draft ─────────
  useEffect(() => {
    if (draft?.step >= 1) {
      toast.info("Continuing where you left off", { duration: 3000 });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save draft whenever step or wizard data changes ────
  // Skip saving the welcome splash (step 0) — nothing to restore there.
  useEffect(() => {
    if (step === 0) return;
    saveDraft(draftKey, step, wizardData);
  }, [step, wizardData, draftKey]);

  // ── Wizard helpers ──────────────────────────────────────────
  const updateWizard = (updates) =>
    setWizardData((prev) => ({ ...prev, ...updates }));

  const goNext = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  // ── Step validation ─────────────────────────────────────────
  const canContinue = () => {
    if (step === 1) return !!(wizardData.traderType && wizardData.experienceLevel);
    if (step === 2) return profileValid;
    if (step === 3) return wizardData.tradingStyles.length > 0;
    return true;
  };

  // ── Final submit ────────────────────────────────────────────
  // accountWasCreated: true when account just created in step 5,
  // false when the user skipped step 5 (no account made this session).
  const handleAccountCreated = async (accountWasCreated = false) => {
    setIsSubmitting(true);
    try {
      const payload = buildOnboardingPayload(wizardData);
      await complete(payload);

      // Personalise dashboard widgets based on trader type.
      // Send the FULL list so all widgets have a preference entry —
      // preset ones are enabled, the rest keep their default on/off state.
      const enabledSet = new Set(widgetPresets[wizardData.traderType] ?? widgetPresets.manual);
      updateWidgets({
        widgets: DEFAULT_WIDGETS.map((w) => ({
          ...w,
          enabled: enabledSet.has(w.id),
        })),
      });

      // Clear saved draft — setup is fully complete
      clearDraft(draftKey);

      toast.success("Welcome to Kraviq. Let's get to work.");

      // Only go to the dashboard when there's at least one account.
      // accountWasCreated covers the case where the account was just made
      // in this step; hasAccount covers accounts created before onboarding.
      if (accountWasCreated || hasAccount) {
        navigate("/dashboard");
      } else {
        navigate("/accounts");
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  // ── Welcome splash (step 0) ─────────────────────────────────
  if (step === 0) {
    return <WelcomeStep onStart={goNext} />;
  }

  const ctxData = CONTEXT[step - 1] ?? CONTEXT[0];

  return (
    <div className="min-h-screen bg-background trading-grid flex">
      {/* ── Left context panel (desktop only) ───── */}
      <div className="hidden lg:flex w-[38%] bg-card/60 border-r border-border flex-col p-8 justify-between">
        {/* Logo */}
        <div>
          <Logo variant="horizontal" size="lg" />
        </div>

        {/* Context content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-foreground mb-2">
                {ctxData.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {ctxData.tip}
              </p>
            </div>
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                What you'll get
              </p>
              {ctxData.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{f}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Trader type indicator (steps 2+) */}
        {step > 1 && wizardData.traderType && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
            <p className="text-xs text-primary font-medium capitalize">
              {wizardData.traderType.replace("-", " ")} trader
            </p>
          </div>
        )}
      </div>

      {/* ── Right content panel ──────────────────── */}
      <div className="flex-1 flex flex-col">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center px-6 pt-6 pb-2">
          <Logo variant="horizontal" size="sm" />
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <div className="w-full max-w-lg space-y-6">
            {/* Step indicator */}
            <StepIndicator currentStep={step} totalSteps={totalSteps} />

            {/* Step content — direction-aware slide */}
            <div className="min-h-105">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {step === 1 && (
                    <TraderTypeStep wizardData={wizardData} onChange={updateWizard} />
                  )}
                  {step === 2 && (
                    <ProfileStep
                      wizardData={wizardData}
                      onChange={updateWizard}
                      onValidChange={setProfileValid}
                    />
                  )}
                  {step === 3 && (
                    <TradingStyleStep wizardData={wizardData} onChange={updateWizard} />
                  )}
                  {step === 4 && (
                    <PreferencesStep wizardData={wizardData} onChange={updateWizard} />
                  )}
                  {step === 5 && !hasAccount && (
                    <AccountCreationStep
                      wizardData={wizardData}
                      onAccountCreated={() => handleAccountCreated(true)}
                      onSkip={() => handleAccountCreated(false)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation buttons — steps 1–4 always; step 5 (AccountCreationStep)
                has its own internal buttons and is only rendered when !hasAccount. */}
            {step < 5 && (
              <div className="space-y-3">
                <div className="flex gap-3">
                  {step > 1 && (
                    <Button variant="outline" className="flex-1" onClick={goBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  )}
                  <Button
                    className="flex-1"
                    // Step 4 + account already exists → skip step 5, submit directly
                    onClick={step === 4 && hasAccount ? handleAccountCreated : goNext}
                    disabled={!canContinue() || isSubmitting}
                  >
                    {step === 4 && hasAccount
                      ? isSubmitting ? "Completing…" : "Complete Setup"
                      : step === 4
                      ? "Almost done →"
                      : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
                    }
                  </Button>
                </div>

                {/* Skip — draft is kept so user can resume later */}
                <button
                  type="button"
                  onClick={() => setSkipDialog(true)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip setup for now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Skip confirmation dialog ──────────────── */}
      <AlertDialog open={skipDialog} onOpenChange={setSkipDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Skip setup?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress has been saved. You can pick up right where you left
              off by clicking "Complete Setup" from the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setSkipDialog(false)}>
              Keep going
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSkipDialog(false);
                // Draft is intentionally NOT cleared on skip —
                // user resumes from where they left off.
                skip();
              }}
            >
              Skip for now
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
