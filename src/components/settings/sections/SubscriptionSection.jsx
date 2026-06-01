import { Badge }  from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, XCircle, CreditCard, Infinity,
  Bot, Star, Zap, Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FREE_FEATURES = [
  { label: "Up to 3 accounts",    included: true },
  { label: "100 trades per month", included: true },
  { label: "Basic analytics",     included: true },
  { label: "AI agents",           included: false, note: "Pro" },
  { label: "Business Score",      included: false, note: "Pro" },
  { label: "EA Sync",             included: false, note: "Pro" },
];

const PRO_FEATURES = [
  { icon: Infinity,    label: "Unlimited accounts" },
  { icon: Infinity,    label: "Unlimited trades" },
  { icon: Bot,         label: "Full AI agents" },
  { icon: Star,        label: "Business Score" },
  { icon: Zap,         label: "EA Sync" },
  { icon: Headphones,  label: "Priority support" },
];

export const SubscriptionSection = () => {
  return (
    <div className="space-y-6">
      {/* Current plan */}
      <div className="trading-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Free Plan</p>
            <p className="text-xs text-muted-foreground mt-0.5">Current plan</p>
          </div>
          <Badge variant="outline" className="text-xs">Free</Badge>
        </div>
        <div className="space-y-1.5">
          {FREE_FEATURES.map(({ label, included, note }) => (
            <div key={label} className="flex items-center gap-2">
              {included ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--profit)" }} />
              ) : (
                <XCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              )}
              <span className={cn(
                "text-xs",
                included ? "text-foreground" : "text-muted-foreground"
              )}>
                {label}
                {note && (
                  <Badge
                    variant="outline"
                    className="ml-1.5 text-[9px] px-1 py-0 h-3.5 bg-primary/10 text-primary border-primary/20"
                  >
                    {note}
                  </Badge>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade card */}
      <div className="trading-card p-4 space-y-4 border-primary/30 bg-primary/5">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Upgrade to Pro</p>
            <p className="text-xl font-bold font-mono text-foreground mt-1">
              $29
              <span className="text-sm font-normal font-sans text-muted-foreground">/month</span>
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          {PRO_FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--profit)" }} />
              <span className="text-xs text-foreground">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button className="flex-1" disabled>
            Coming Soon
          </Button>
          <Badge variant="outline" className="text-xs">Q4 2026</Badge>
        </div>
      </div>
    </div>
  );
};
