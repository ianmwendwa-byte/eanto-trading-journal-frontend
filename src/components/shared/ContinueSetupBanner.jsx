import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/useAuthStore";

export const ContinueSetupBanner = () => {
  const { mongoUser, onboardingComplete } = useAuthStore();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  const skippedAt = mongoUser?.onboarding?.skippedAt;

  if (onboardingComplete !== false || !skippedAt || dismissed) return null;

  const completedSteps = mongoUser?.onboarding?.completedSteps ?? [];
  const totalSteps = 4;
  const progress = Math.round((completedSteps.length / totalSteps) * 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="overflow-hidden"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="px-6 py-2.5 flex items-center justify-between gap-4"
          style={{ backgroundColor: "color-mix(in srgb, var(--primary) 8%, transparent)" }}
        >
          {/* Left: progress + message */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="hidden sm:flex items-center gap-2 w-32 flex-shrink-0">
              <Progress value={progress} className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                {completedSteps.length}/{totalSteps}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              Complete your profile to unlock all Tradecore features
            </p>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() => navigate("/onboarding")}
            >
              Complete Setup
              <ArrowRight className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setDismissed(true)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
