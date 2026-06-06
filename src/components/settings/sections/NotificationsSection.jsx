import { useState, useEffect, useCallback, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, ChevronDown, ChevronRight, Save, Loader2 } from "lucide-react";
import { useNotificationPreferences } from "@/hooks/useNotifications";
import {
  useUpdateNotificationSettings,
  useSilentUpdateNotificationPreferences,
} from "@/hooks/useUser";
import { useAuthStore } from "@/store/useAuthStore";
import { toast }        from "sonner";
import { cn } from "@/lib/utils";

const CRITICAL_TYPES = new Set([
  "account_blown", "daily_drawdown_hit", "balance_mismatch",
  "password_changed", "new_login", "account_deleted",
]);

const QUICK_TOGGLES = [
  { key: "tradeAlerts",      label: "Trade Alerts",       desc: "When trades are created or flagged" },
  { key: "drawdownWarnings", label: "Drawdown Warnings",  desc: "When you approach drawdown limits" },
  { key: "weeklyDebrief",    label: "Weekly Debrief",     desc: "Personalized AI summary of your week" },
  { key: "challengeUpdates", label: "Challenge Updates",  desc: "Prop firm challenge status changes" },
  { key: "mentorMessages",   label: "Mentor Messages",    desc: "Messages from mentors or the team" },
  { key: "pushEnabled",      label: "Push Notifications", desc: "Browser push notifications (beta)" },
];

const GRANULAR_CATEGORIES = [
  {
    key:   "account_health",
    label: "Account Health",
    types: [
      { key: "account_blown",     label: "Account Blown",       critical: true  },
      { key: "balance_mismatch",  label: "Balance Mismatch",    critical: true  },
      { key: "daily_drawdown_hit",label: "Daily Drawdown Hit",  critical: true  },
      { key: "drawdown_warning",  label: "Drawdown Warning",    critical: false },
    ],
  },
  {
    key:   "prop_firm",
    label: "Prop Firm",
    types: [
      { key: "challenge_passed",  label: "Challenge Passed",  critical: false },
      { key: "challenge_failed",  label: "Challenge Failed",  critical: false },
      { key: "payout_processed",  label: "Payout Processed",  critical: false },
    ],
  },
  {
    key:   "trading_activity",
    label: "Trading Activity",
    types: [
      { key: "trade_flagged",   label: "Trade Flagged",   critical: false },
      { key: "ea_disconnected", label: "EA Disconnected", critical: false },
      { key: "ea_connected",    label: "EA Connected",    critical: false },
    ],
  },
  {
    key:   "milestones",
    label: "Milestones",
    types: [
      { key: "streak_milestone",  label: "Win Streak Milestone", critical: false },
      { key: "score_improvement", label: "Score Improved",       critical: false },
    ],
  },
  {
    key:   "system",
    label: "System",
    types: [
      { key: "password_changed", label: "Password Changed", critical: true },
      { key: "new_login",        label: "New Login",        critical: true },
      { key: "account_deleted",  label: "Account Deleted",  critical: true },
    ],
  },
];

const GranularCategory = ({ category, overrides, onToggle, onMasterToggle }) => {
  const [expanded, setExpanded] = useState(false);
  const allEnabled = category.types.every((t) => overrides[t.key]?.enabled !== false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-foreground flex-1 text-left min-h-[44px]"
        >
          {expanded
            ? <ChevronDown  className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          }
          {category.label}
        </button>
        <Switch checked={allEnabled} onCheckedChange={(v) => onMasterToggle(category, v)} />
      </div>

      {expanded && (
        <div className="divide-y divide-border">
          {category.types.map((type) => {
            const isCritical = CRITICAL_TYPES.has(type.key) || type.critical;
            const isEnabled  = overrides[type.key]?.enabled !== false;
            return (
              <div key={type.key} className="flex items-center justify-between px-6 py-3 min-h-[52px]">
                <div className="flex items-center gap-2">
                  {isCritical && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
                  <p className={cn("text-xs", isCritical ? "text-muted-foreground" : "text-foreground")}>
                    {type.label}
                  </p>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(v) => onToggle(type.key, v)}
                  disabled={isCritical}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const NotificationsSection = ({ onDirtyChange }) => {
  const { mongoUser } = useAuthStore();
  const { mutateAsync: updateNotifSettings, isPending: notifPending }   = useUpdateNotificationSettings();
  const { mutateAsync: updateGranular,      isPending: granularPending } = useSilentUpdateNotificationPreferences();
  const { data: granularPrefs } = useNotificationPreferences();

  const notifPrefs = mongoUser?.notifications ?? {};

  const initGeneral = useCallback(() => ({
    emailDigest:      notifPrefs?.emailDigest      ?? "weekly",
    tradeAlerts:      notifPrefs?.tradeAlerts      !== false,
    drawdownWarnings: notifPrefs?.drawdownWarnings !== false,
    weeklyDebrief:    notifPrefs?.weeklyDebrief    !== false,
    challengeUpdates: notifPrefs?.challengeUpdates !== false,
    mentorMessages:   notifPrefs?.mentorMessages   !== false,
    pushEnabled:      notifPrefs?.pushEnabled      === true,
  }), [mongoUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const [data,      setData]      = useState(initGeneral);
  const [overrides, setOverrides] = useState({});

  useEffect(() => { setData(initGeneral()); }, [mongoUser?._id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (granularPrefs?.overrides) setOverrides(granularPrefs.overrides);
  }, [granularPrefs]);

  const savedGeneral = useMemo(() => initGeneral(), [initGeneral]);
  const savedOverrides = useMemo(() => granularPrefs?.overrides ?? {}, [granularPrefs]);

  const generalDirty   = useMemo(() => Object.keys(data).some((k) => data[k] !== savedGeneral[k]), [data, savedGeneral]);
  const overridesDirty = useMemo(() => JSON.stringify(overrides) !== JSON.stringify(savedOverrides), [overrides, savedOverrides]);
  const isDirty        = generalDirty || overridesDirty;
  const isPending      = notifPending || granularPending;

  useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (field, value) => setData((d) => ({ ...d, [field]: value }));

  const handleOverride = (typeKey, enabled) => {
    if (CRITICAL_TYPES.has(typeKey)) return;
    setOverrides((o) => ({ ...o, [typeKey]: { enabled } }));
  };

  const handleMasterToggle = (category, enabled) => {
    setOverrides((prev) => {
      const next = { ...prev };
      category.types.forEach((t) => {
        if (!CRITICAL_TYPES.has(t.key)) next[t.key] = { enabled };
      });
      return next;
    });
  };

  const handleSave = async () => {
    try {
      const saves = [];
      if (generalDirty)   saves.push(updateNotifSettings(data));
      if (overridesDirty) saves.push(updateGranular({ overrides }));
      await Promise.all(saves);
      toast.success("Notification settings saved");
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to save changes";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList className="bg-muted/50 w-full sm:w-auto">
          <TabsTrigger value="general"  className="flex-1 sm:flex-none">General</TabsTrigger>
          <TabsTrigger value="granular" className="flex-1 sm:flex-none">Granular Controls</TabsTrigger>
        </TabsList>

        {/* ── General ─────────────────────────────── */}
        <TabsContent value="general" className="mt-4 space-y-4">
          {/* Email Digest */}
          <div className="flex items-center justify-between py-3 border-b border-border gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Email Digest</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                How often to receive email summaries
              </p>
            </div>
            <Select value={data.emailDigest} onValueChange={(v) => update("emailDigest", v)}>
              <SelectTrigger className="h-9 text-xs w-28 shrink-0 bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick toggles */}
          <div className="trading-card divide-y divide-border">
            {QUICK_TOGGLES.map(({ key, label, desc }) => (
              <div key={key} className="flex items-start justify-between gap-4 px-4 py-3 min-h-[60px]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <Switch checked={!!data[key]} onCheckedChange={(v) => update(key, v)} />
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── Granular Controls ────────────────────── */}
        <TabsContent value="granular" className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground mb-3">
            Fine-tune which events trigger notifications.
            <span className="inline-flex items-center gap-1 ml-2">
              <Lock className="h-3 w-3" /> = cannot be disabled
            </span>
          </p>

          {GRANULAR_CATEGORIES.map((cat) => (
            <GranularCategory
              key={cat.key}
              category={cat}
              overrides={overrides}
              onToggle={handleOverride}
              onMasterToggle={handleMasterToggle}
            />
          ))}
        </TabsContent>
      </Tabs>

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
