import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/store/useAuthStore";
import { useAccounts } from "@/hooks/useAccounts";
import { useTradeStats } from "@/hooks/useTrades";
import { cn } from "@/lib/utils";

const LS_KEY = "tradecore_setup_dismissed";

export const SetupProgressWidget = () => {
  const { mongoUser, onboardingComplete } = useAuthStore();
  const navigate = useNavigate();

  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(LS_KEY) === "true"; } catch { return false; }
  });

  const { data: accountsData } = useAccounts();
  const { data: tradeStats }   = useTradeStats({});

  if (dismissed || onboardingComplete === true) return null;

  const completedSteps = mongoUser?.onboarding?.completedSteps ?? [];
  const hasAccount = (accountsData?.accounts?.length ?? 0) > 0;
  const hasTrade   = (tradeStats?.totalTrades ?? 0) > 0;

  const items = [
    {
      key:   "profile",
      label: "Profile created",
      done:  completedSteps.includes("profile_setup"),
    },
    {
      key:   "preferences",
      label: "Trading preferences set",
      done:  completedSteps.includes("preferences_set"),
    },
    {
      key:   "account",
      label: "First account added",
      done:  hasAccount,
    },
    {
      key:   "trade",
      label: "First trade logged",
      done:  hasTrade,
    },
  ];

  const doneCount = items.filter((i) => i.done).length;
  const progress  = Math.round((doneCount / items.length) * 100);

  if (doneCount === items.length) {
    try { localStorage.setItem(LS_KEY, "true"); } catch {}
    return null;
  }

  const handleDismiss = () => {
    try { localStorage.setItem(LS_KEY, "true"); } catch {}
    setDismissed(true);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Complete Your Setup</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              {doneCount}/{items.length} steps done
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <Progress value={progress} className="h-1.5 mt-2" />
      </CardHeader>

      <CardContent className="space-y-2 pt-0">
        {items.map((item) => (
          <div key={item.key} className="flex items-center gap-2.5">
            <div className={cn(
              "h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors",
              item.done
                ? "bg-[var(--profit)]/10 border-[var(--profit)]/30"
                : "bg-muted border-border"
            )}>
              {item.done && <Check className="h-3 w-3 text-[var(--profit)]" />}
            </div>
            <span className={cn(
              "text-xs",
              item.done ? "text-muted-foreground line-through" : "text-foreground"
            )}>
              {item.label}
            </span>
          </div>
        ))}

        <Button
          size="sm"
          className="w-full mt-3 h-8 text-xs gap-1.5"
          onClick={() => navigate("/onboarding")}
        >
          Complete Setup
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
};
