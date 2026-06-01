import { useState, useEffect, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge }  from "@/components/ui/badge";
import { Zap, Swords, Star, Users, AlertCircle } from "lucide-react";
import { AutoSaveIndicator } from "@/components/settings/AutoSaveIndicator";
import { useAutoSave }       from "@/hooks/useAutoSave";
import { useUpdateFeatureFlags } from "@/hooks/useUser";
import { useAuthStore }      from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    key:         "betaEASync",
    icon:        Zap,
    label:       "EA Auto-Sync",
    description: "Automatically sync trades from your MT4/MT5 EA in real time",
    status:      "available",
  },
  {
    key:         "betaWarAccount",
    icon:        Swords,
    label:       "War Accounts",
    description: "Experimental sandbox accounts for testing high-risk strategies",
    status:      "available",
  },
  {
    key:         "betaBusinessScore",
    icon:        Star,
    label:       "Business Score",
    description: "AI-powered trading business health score (0–100)",
    status:      "available",
  },
  {
    key:         "betaMentorMarketplace",
    icon:        Users,
    label:       "Mentor Marketplace",
    description: "Connect with verified trading mentors and share strategies",
    status:      "coming_soon",
  },
];

export const BetaSection = ({ onDirtyChange }) => {
  const { mongoUser } = useAuthStore();
  const { mutateAsync: updateFlags } = useUpdateFeatureFlags();

  const flags = mongoUser?.featureFlags ?? {};

  const init = useCallback(() => ({
    betaEASync:             flags?.betaEASync             === true,
    betaWarAccount:         flags?.betaWarAccount         === true,
    betaBusinessScore:      flags?.betaBusinessScore      === true,
    betaMentorMarketplace:  flags?.betaMentorMarketplace  === true,
  }), [mongoUser?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [data, setData] = useState(init);
  useEffect(() => { setData(init()); }, [mongoUser?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const { save, status, error, isDirty } = useAutoSave({
    mutationFn: (d) => updateFlags(d),
  });

  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = (key, value) => {
    const next = { ...data, [key]: value };
    setData(next);
    save(next);
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="trading-card p-4 flex items-start gap-3 border-warning/30 bg-warning/5">
        <Zap className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "var(--warning)" }} />
        <div>
          <p className="text-sm font-semibold text-foreground">Beta Features</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Get early access to features in development.
            Beta features may change or be unstable.
          </p>
        </div>
        <AutoSaveIndicator status={status} className="ml-auto shrink-0" />
      </div>

      {error && (
        <p className="text-xs flex items-center gap-1 p-2 rounded-md bg-destructive/10"
           style={{ color: "var(--loss)" }}>
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}

      <div className="space-y-3">
        {FEATURES.map(({ key, icon: Icon, label, description, status: featureStatus }) => {
          const isComingSoon = featureStatus === "coming_soon";
          const isEnabled    = !!data[key];

          return (
            <div
              key={key}
              className={cn(
                "trading-card p-4 flex items-start gap-4 transition-opacity",
                isComingSoon && "opacity-60"
              )}
            >
              <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Icon className="h-4.5 w-4.5 text-primary" style={{ height: 18, width: 18 }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  {isComingSoon ? (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                      Coming Soon
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-4 bg-[var(--profit)]/10 border-[var(--profit)]/20"
                      style={{ color: "var(--profit)" }}
                    >
                      Available
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={(v) => handleToggle(key, v)}
                disabled={isComingSoon}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
