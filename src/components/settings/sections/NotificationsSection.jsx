import { useState, useEffect, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Lock, ChevronDown, ChevronRight } from "lucide-react";
import { AutoSaveIndicator } from "@/components/settings/AutoSaveIndicator";
import { useAutoSave }       from "@/hooks/useAutoSave";
import { useNotificationPreferences } from "@/hooks/useNotifications";
import {
  useUpdateNotificationSettings,
  useSilentUpdateNotificationPreferences,
} from "@/hooks/useUser";
import { useAuthStore }      from "@/store/useAuthStore";
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
      { key: "account_blown",    label: "Account Blown",       critical: true },
      { key: "balance_mismatch", label: "Balance Mismatch",    critical: true },
      { key: "daily_drawdown_hit",label: "Daily Drawdown Hit", critical: true },
      { key: "drawdown_warning", label: "Drawdown Warning",    critical: false },
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
      { key: "trade_flagged",   label: "Trade Flagged",    critical: false },
      { key: "ea_disconnected", label: "EA Disconnected",  critical: false },
      { key: "ea_connected",    label: "EA Connected",     critical: false },
    ],
  },
  {
    key:   "milestones",
    label: "Milestones",
    types: [
      { key: "streak_milestone",    label: "Win Streak Milestone",  critical: false },
      { key: "score_improvement",   label: "Score Improved",        critical: false },
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
  // Overrides format: { typeKey: { enabled: bool } }
  const allEnabled = category.types.every((t) =>
    overrides[t.key]?.enabled !== false
  );

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-foreground flex-1 text-left"
        >
          {expanded
            ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          }
          {category.label}
        </button>
        <Switch
          checked={allEnabled}
          onCheckedChange={(v) => onMasterToggle(category, v)}
        />
      </div>

      {expanded && (
        <div className="divide-y divide-border">
          {category.types.map((type) => {
            const isCritical = CRITICAL_TYPES.has(type.key) || type.critical;
            const isEnabled  = overrides[type.key]?.enabled !== false;
            return (
              <div key={type.key} className="flex items-center justify-between px-6 py-2.5">
                <div className="flex items-center gap-2">
                  {isCritical && (
                    <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                  <p className={cn(
                    "text-xs",
                    isCritical ? "text-muted-foreground" : "text-foreground"
                  )}>
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
  const { mutateAsync: updateNotifSettings } = useUpdateNotificationSettings();
  const { mutateAsync: updateGranular }      = useSilentUpdateNotificationPreferences();
  const { data: granularPrefs }              = useNotificationPreferences();

  // General toggles live under mongoUser.notifications (not notificationPreferences)
  const notifPrefs = mongoUser?.notifications ?? {};

  const init = useCallback(() => ({
    emailDigest:      notifPrefs?.emailDigest      ?? "weekly",
    tradeAlerts:      notifPrefs?.tradeAlerts      !== false,
    drawdownWarnings: notifPrefs?.drawdownWarnings !== false,
    weeklyDebrief:    notifPrefs?.weeklyDebrief    !== false,
    challengeUpdates: notifPrefs?.challengeUpdates !== false,
    mentorMessages:   notifPrefs?.mentorMessages   !== false,
    pushEnabled:      notifPrefs?.pushEnabled      === true,
  }), [mongoUser?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [data, setData]         = useState(init);
  const [overrides, setOverrides] = useState({});

  useEffect(() => { setData(init()); }, [mongoUser?._id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (granularPrefs?.overrides) {
      setOverrides(granularPrefs.overrides);
    }
  }, [granularPrefs]);

  const { save, status, error, isDirty } = useAutoSave({
    mutationFn: (d) => updateNotifSettings(d),
  });

  const { save: saveGranular, status: granularStatus, isDirty: granularDirty } = useAutoSave({
    mutationFn: (d) => updateGranular(d),
  });

  useEffect(() => {
    onDirtyChange?.(isDirty || granularDirty);
  }, [isDirty, granularDirty]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (field, value) => {
    const next = { ...data, [field]: value };
    setData(next);
    save(next);
  };

  const handleOverride = (typeKey, enabled) => {
    if (CRITICAL_TYPES.has(typeKey)) return;
    // Overrides format expected by backend: { typeKey: { enabled: bool } }
    const next = { ...overrides, [typeKey]: { enabled } };
    setOverrides(next);
    saveGranular({ overrides: next });
  };

  const handleMasterToggle = (category, enabled) => {
    const next = { ...overrides };
    category.types.forEach((t) => {
      if (!CRITICAL_TYPES.has(t.key)) {
        next[t.key] = { enabled };
      }
    });
    setOverrides(next);
    saveGranular({ overrides: next });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Notification Settings</p>
        <AutoSaveIndicator status={status} />
      </div>

      {error && (
        <p className="text-xs flex items-center gap-1 p-2 rounded-md bg-destructive/10"
           style={{ color: "var(--loss)" }}>
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}

      <Tabs defaultValue="general">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="granular">Granular Controls</TabsTrigger>
        </TabsList>

        {/* ── General ─────────────────────────────── */}
        <TabsContent value="general" className="mt-4 space-y-4">
          {/* Email Digest */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Email Digest</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                How often to receive email summaries
              </p>
            </div>
            <Select
              value={data.emailDigest}
              onValueChange={(v) => update("emailDigest", v)}
            >
              <SelectTrigger className="h-8 text-xs w-28 bg-background border-border">
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
              <div key={key} className="flex items-start justify-between gap-4 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <Switch
                  checked={!!data[key]}
                  onCheckedChange={(v) => update(key, v)}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── Granular Controls ────────────────────── */}
        <TabsContent value="granular" className="mt-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">
              Fine-tune which events trigger notifications.
              <span className="inline-flex items-center gap-1 ml-2">
                <Lock className="h-3 w-3" /> = cannot be disabled
              </span>
            </p>
            <AutoSaveIndicator status={granularStatus} />
          </div>

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
    </div>
  );
};
