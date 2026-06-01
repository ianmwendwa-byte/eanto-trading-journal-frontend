import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEP_LABELS = [
  "Who are you?",
  "Your profile",
  "Trading style",
  "Preferences",
  "First account",
];

export const StepIndicator = ({ currentStep }) => (
  <div className="space-y-3">
    {/* Dots + lines row */}
    <div className="flex items-center">
      {STEP_LABELS.map((label, idx) => {
        const stepNum    = idx + 1;
        const isComplete = currentStep > stepNum;
        const isCurrent  = currentStep === stepNum;
        const isFuture   = currentStep < stepNum;

        return (
          <div key={stepNum} className="flex items-center flex-1 last:flex-none">
            {/* Dot */}
            <div className="relative flex-shrink-0">
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/30"
                  animate={{ scale: [1, 1.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ borderRadius: "50%" }}
                />
              )}
              <div
                className={cn(
                  "relative h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300",
                  isComplete && "bg-primary border-primary text-primary-foreground",
                  isCurrent  && "bg-primary/10 border-primary text-primary",
                  isFuture   && "bg-background border-border text-muted-foreground"
                )}
              >
                {isComplete
                  ? <Check className="h-3.5 w-3.5" />
                  : <span>{stepNum}</span>
                }
              </div>
            </div>

            {/* Connector line */}
            {idx < STEP_LABELS.length - 1 && (
              <div className="flex-1 mx-1 h-0.5 overflow-hidden rounded-full bg-border">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isComplete ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{ transformOrigin: "left" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>

    {/* Current step label */}
    <p className="text-xs text-muted-foreground text-center">
      Step {currentStep} of {STEP_LABELS.length} — {STEP_LABELS[currentStep - 1]}
    </p>
  </div>
);
