import { motion } from "framer-motion";
import { TrendingUp, Trophy, Zap, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TRADER_TYPES = [
  {
    value:       "manual",
    icon:        TrendingUp,
    label:       "Manual Trader",
    description: "I analyze charts and place trades myself",
    badge:       "Most Common",
    badgeClass:  "bg-[var(--profit)]/10 text-[var(--profit)] border-[var(--profit)]/20",
    color:       "text-[var(--profit)]",
    bg:          "bg-[var(--profit)]/5",
    border:      "border-[var(--profit)]/30",
  },
  {
    value:       "prop",
    icon:        Trophy,
    label:       "Prop Firm Trader",
    description: "I trade funded accounts from prop firms like FTMO",
    badge:       "Challenge Mode",
    badgeClass:  "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20",
    color:       "text-[var(--warning)]",
    bg:          "bg-[var(--warning)]/5",
    border:      "border-[var(--warning)]/30",
  },
  {
    value:       "ea",
    icon:        Zap,
    label:       "EA / Bot Trader",
    description: "I use automated Expert Advisors on MT4/MT5",
    badge:       null,
    color:       "text-blue-400",
    bg:          "bg-blue-500/5",
    border:      "border-blue-500/30",
  },
  {
    value:       "semi-auto",
    icon:        Settings2,
    label:       "Semi-Automated",
    description: "I combine manual analysis with EA execution",
    badge:       null,
    color:       "text-purple-400",
    bg:          "bg-purple-500/5",
    border:      "border-purple-500/30",
  },
];

const EXPERIENCE_OPTIONS = [
  { value: "beginner",     label: "< 1 year"  },
  { value: "intermediate", label: "1–3 years" },
  { value: "advanced",     label: "3–5 years" },
  { value: "professional", label: "5+ years"  },
];

export const TraderTypeStep = ({ wizardData, onChange }) => {
  const { traderType, experienceLevel } = wizardData;

  return (
    <div className="space-y-8">
      {/* Trader type */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-0.5">
            What best describes you?
          </h3>
          <p className="text-xs text-muted-foreground">
            This personalizes your dashboard and features
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TRADER_TYPES.map((type) => {
            const Icon       = type.icon;
            const isSelected = traderType === type.value;
            return (
              <motion.button
                key={type.value}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                onClick={() => onChange({ traderType: type.value })}
                className={cn(
                  "relative text-left rounded-xl border-2 p-4 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                  isSelected
                    ? cn(type.bg, type.border)
                    : "bg-card border-border hover:border-border/80"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "rounded-lg p-2 border flex-shrink-0",
                    isSelected ? cn(type.bg, type.border) : "bg-muted/50 border-border"
                  )}>
                    <Icon className={cn("h-5 w-5", isSelected ? type.color : "text-muted-foreground")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{type.label}</span>
                      {type.badge && (
                        <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4", type.badgeClass)}>
                          {type.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {type.description}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <div className={cn(
                    "absolute top-3 right-3 h-2 w-2 rounded-full",
                    type.color.replace("text-", "bg-")
                  )} />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Experience level */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          How long have you been trading?
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {EXPERIENCE_OPTIONS.map((opt) => {
            const isSelected = experienceLevel === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ experienceLevel: opt.value })}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
