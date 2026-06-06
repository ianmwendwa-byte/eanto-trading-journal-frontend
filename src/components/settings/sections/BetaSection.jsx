import { useState, useEffect, useCallback, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge }  from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Swords, Star, Users, Save, Loader2 } from "lucide-react";
import { useUpdateFeatureFlags } from "@/hooks/useUser";
import { useAuthStore }          from "@/store/useAuthStore";
import { toast }                 from "sonner";
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
  const { mutateAsync, isPending } = useUpdateFeatureFlags();

  const flags = mongoUser?.featureFlags ?? {};

  const init = useCallback(() => ({
    betaEASync:            flags?.betaEASync            === true,
    betaWarAccount:        flags?.betaWarAccount        === true,
    betaBusinessScore:     flags?.betaBusinessScore     === true,
    betaMentorMarketplace: flags?.betaMentorMarketplace === true,
  }), [mongoUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const [data, setData] = useState(init);
  useEffect(() => { setData(init()); }, [mongoUser?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const saved = useMemo(() => init(), [init]);

  const isDirty = useMemo(() => (
    data.betaEASync            !== saved.betaEASync            ||
    data.betaWarAccount        !== saved.betaWarAccount        ||
    data.betaBusinessScore     !== saved.betaBusinessScore     ||
    data.betaMentorMarketplace !== saved.betaMentorMarketplace
  ), [data, saved]);

  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = (key, value) => setData((d) => ({ ...d, [key]: value }));

  const handleSave = async () => {
    try {
      await mutateAsync(data);
      toast.success("Beta features saved");
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to save changes";
      toast.error(msg);
    }
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
      </div>

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
                <Icon style={{ height: 18, width: 18 }} className="text-primary" />
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

      {/* ── Save footer ─────────────────────────── */}
      <div className="pt-4 border-t border-border flex flex-col-reverse sm:flex-row sm:items-center gap-3">
        {isDirty && (
          <p className="text-xs text-muted-foreground text-center sm:text-left">Unsaved changes</p>
        )}
        <Button
          onClick={handleSave}
          disabled={!isDirty || isPending}
          size="sm"
          className="sm:ml-auto w-full sm:w-auto min-h-[44px] sm:min-h-0"
        >
          {isPending ? (
            <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Saving...</>
          ) : (
            <><Save className="h-3.5 w-3.5 mr-2" />Save Changes</>
          )}
        </Button>
      </div>
    </div>
  );
};
