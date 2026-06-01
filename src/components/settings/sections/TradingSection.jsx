import { useState, useEffect, useCallback } from "react";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input }    from "@/components/ui/input";
import { Button }   from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Plus, X } from "lucide-react";
import { AutoSaveIndicator } from "@/components/settings/AutoSaveIndicator";
import { useAutoSave }       from "@/hooks/useAutoSave";
import { useUpdateUserProfile } from "@/hooks/useUser";
import { useAuthStore }      from "@/store/useAuthStore";
import { useAccounts }       from "@/hooks/useAccounts";
import { cn } from "@/lib/utils";

const EXPERIENCE_OPTIONS = [
  { value: "beginner",     label: "Beginner",     sub: "< 1 year" },
  { value: "intermediate", label: "Intermediate", sub: "1–3 years" },
  { value: "advanced",     label: "Advanced",     sub: "3–5 years" },
  { value: "professional", label: "Professional", sub: "5+ years" },
];

const TRADING_MODES = [
  { value: "manual",    label: "Manual" },
  { value: "ea",        label: "EA / Bot" },
  { value: "semi-auto", label: "Semi-Auto" },
];

const TRADING_STYLES = [
  { value: "scalping",  label: "Scalping",  sub: "Seconds – minutes" },
  { value: "intraday",  label: "Intraday",  sub: "Minutes – hours" },
  { value: "swing",     label: "Swing",     sub: "Days – weeks" },
  { value: "position",  label: "Position",  sub: "Weeks – months" },
];

const COMMON_PAIRS = [
  "EURUSD","GBPUSD","USDJPY","AUDUSD","USDCAD",
  "USDCHF","NZDUSD","EURGBP","GBPJPY","EURJPY",
  "XAUUSD","XAGUSD","US30","NAS100","GBPCHF",
];

const SESSIONS = [
  { value: "sydney",   label: "Sydney",   hours: "21:00–06:00 UTC" },
  { value: "tokyo",    label: "Tokyo",    hours: "00:00–09:00 UTC" },
  { value: "london",   label: "London",   hours: "07:00–16:00 UTC" },
  { value: "new_york", label: "New York", hours: "12:00–21:00 UTC" },
];

const Chip = ({ label, sub, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150",
      selected
        ? "bg-primary/10 text-primary border-primary/40"
        : "bg-muted text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
    )}
  >
    {label}
    {sub && <span className="block text-[10px] opacity-60 font-normal">{sub}</span>}
  </button>
);

const toggle = (arr, val, max = Infinity) => {
  if (arr.includes(val)) return arr.filter((v) => v !== val);
  if (arr.length >= max) return arr;
  return [...arr, val];
};

export const TradingSection = ({ onDirtyChange }) => {
  const { mongoUser } = useAuthStore();
  const { mutateAsync: updateProfile } = useUpdateUserProfile();
  const { data: accountsData } = useAccounts({ limit: 50 });
  const accounts = accountsData?.accounts ?? [];

  const init = useCallback(() => ({
    experienceLevel:   mongoUser?.traderProfile?.experienceLevel ?? mongoUser?.experienceLevel ?? "beginner",
    tradingModes:      mongoUser?.traderProfile?.tradingModes    ?? mongoUser?.tradingModes    ?? [],
    tradingStyles:     mongoUser?.traderProfile?.tradingStyles   ?? mongoUser?.tradingStyles   ?? [],
    primaryPairs:      mongoUser?.traderProfile?.primaryPairs    ?? mongoUser?.primaryPairs    ?? [],
    preferredSessions: mongoUser?.traderProfile?.preferredSessions ?? mongoUser?.preferredSessions ?? [],
    defaultAccountId:  mongoUser?.defaultAccountId ?? "",
  }), [mongoUser]);

  const [data, setData] = useState(init);
  const [customPair, setCustomPair] = useState("");
  const [customPairError, setCustomPairError] = useState("");

  useEffect(() => { setData(init()); }, [mongoUser?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const { save, status, error, isDirty } = useAutoSave({
    mutationFn: (d) => updateProfile(d),
  });

  const { save: saveAccount, status: accountStatus, isDirty: accountDirty } = useAutoSave({
    mutationFn: (d) => updateProfile(d),
  });

  useEffect(() => {
    onDirtyChange?.(isDirty || accountDirty);
  }, [isDirty, accountDirty]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (field, value) => {
    const next = { ...data, [field]: value };
    setData(next);
    save({
      traderProfile: {
        experienceLevel:   next.experienceLevel,
        tradingModes:      next.tradingModes,
        tradingStyles:     next.tradingStyles,
        primaryPairs:      next.primaryPairs,
        preferredSessions: next.preferredSessions,
      },
    });
  };

  const handleAddCustomPair = () => {
    const p = customPair.toUpperCase().trim();
    if (!p) return;
    if (!/^[A-Z0-9]{3,10}$/.test(p)) {
      setCustomPairError("3–10 uppercase letters/numbers");
      return;
    }
    if (data.primaryPairs.includes(p)) {
      setCustomPairError("Already added");
      return;
    }
    if (data.primaryPairs.length >= 20) {
      setCustomPairError("Maximum 20 pairs");
      return;
    }
    setCustomPairError("");
    setCustomPair("");
    update("primaryPairs", [...data.primaryPairs, p]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Trading Settings</p>
        <AutoSaveIndicator status={status} />
      </div>

      {error && (
        <p className="text-xs flex items-center gap-1 p-2 rounded-md bg-destructive/10"
           style={{ color: "var(--loss)" }}>
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}

      <Tabs defaultValue="experience">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="pairs">Pairs & Sessions</TabsTrigger>
          <TabsTrigger value="account">Default Account</TabsTrigger>
        </TabsList>

        {/* ── Experience ──────────────────────────── */}
        <TabsContent value="experience" className="mt-4 space-y-6">
          {/* Experience Level */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-foreground">Experience Level</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EXPERIENCE_OPTIONS.map((opt) => {
                const selected = data.experienceLevel === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update("experienceLevel", opt.value)}
                    className={cn(
                      "text-left p-3 rounded-xl border-2 transition-all duration-150",
                      selected
                        ? "bg-primary/5 border-primary"
                        : "bg-card border-border hover:border-primary/30"
                    )}
                  >
                    <p className={cn("text-sm font-semibold", selected ? "text-primary" : "text-foreground")}>
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{opt.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trading Modes */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground">Trading Modes</p>
              <span className="text-[10px] text-muted-foreground">Select all that apply</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRADING_MODES.map((m) => (
                <Chip
                  key={m.value}
                  label={m.label}
                  selected={data.tradingModes.includes(m.value)}
                  onClick={() => {
                    const next = toggle(data.tradingModes, m.value);
                    if (next.length === 0) return;
                    update("tradingModes", next);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Trading Styles */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground">Trading Styles</p>
              <span className="text-[10px] text-muted-foreground">Select all that apply</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRADING_STYLES.map((s) => (
                <Chip
                  key={s.value}
                  label={s.label}
                  sub={s.sub}
                  selected={data.tradingStyles.includes(s.value)}
                  onClick={() => {
                    const next = toggle(data.tradingStyles, s.value);
                    if (next.length === 0) return;
                    update("tradingStyles", next);
                  }}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Pairs & Sessions ────────────────────── */}
        <TabsContent value="pairs" className="mt-4 space-y-6">
          {/* Primary Pairs */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground">Primary Pairs</p>
              <span className="text-[10px] text-muted-foreground">{data.primaryPairs.length}/20</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_PAIRS.map((pair) => (
                <Chip
                  key={pair}
                  label={pair}
                  selected={data.primaryPairs.includes(pair)}
                  onClick={() => update("primaryPairs", toggle(data.primaryPairs, pair, 20))}
                />
              ))}
              {/* Custom pairs */}
              {data.primaryPairs
                .filter((p) => !COMMON_PAIRS.includes(p))
                .map((pair) => (
                  <div key={pair} className="relative">
                    <Chip
                      label={pair}
                      selected
                      onClick={() => update("primaryPairs", data.primaryPairs.filter((p) => p !== pair))}
                    />
                  </div>
                ))}
            </div>
            {/* Custom pair input */}
            <div className="flex gap-2 items-start">
              <div className="flex-1 space-y-1">
                <Input
                  value={customPair}
                  onChange={(e) => { setCustomPair(e.target.value.toUpperCase()); setCustomPairError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustomPair()}
                  placeholder="Custom pair e.g. BTCUSD"
                  className="bg-background border-border h-8 text-xs"
                  maxLength={10}
                />
                {customPairError && (
                  <p className="text-[10px]" style={{ color: "var(--loss)" }}>{customPairError}</p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 text-xs shrink-0"
                onClick={handleAddCustomPair}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {/* Preferred Sessions */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-foreground">When do you usually trade?</p>
            <div className="grid grid-cols-2 gap-2">
              {SESSIONS.map((s) => {
                const selected = data.preferredSessions.includes(s.value);
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => update("preferredSessions", toggle(data.preferredSessions, s.value))}
                    className={cn(
                      "text-left px-4 py-3 rounded-xl border-2 transition-all duration-150",
                      selected
                        ? "bg-primary/5 border-primary text-foreground"
                        : "bg-card border-border text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-[10px] opacity-60 mt-0.5">{s.hours}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ── Default Account ──────────────────────── */}
        <TabsContent value="account" className="mt-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Default Account</p>
            <AutoSaveIndicator status={accountStatus} />
          </div>
          <p className="text-xs text-muted-foreground">
            This account is pre-selected in filters across the app.
          </p>
          <Select
            value={data.defaultAccountId || "none"}
            onValueChange={(v) => {
              const val = v === "none" ? "" : v;
              const next = { ...data, defaultAccountId: val };
              setData(next);
              saveAccount({ defaultAccountId: val });
            }}
          >
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select default account" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="none">No default (all accounts)</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a._id} value={a._id}>
                  <span>{a.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground capitalize">({a.type})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {accounts.length === 0 && (
            <p className="text-xs text-muted-foreground">No accounts yet. Create one first.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
