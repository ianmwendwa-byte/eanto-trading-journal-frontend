import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input }   from "@/components/ui/input";
import { Button }  from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Plus, Save, Loader2, Info } from "lucide-react";
import { useUpdateUserProfile } from "@/hooks/useUser";
import { useAuthStore }      from "@/store/useAuthStore";
import { useAccounts }       from "@/hooks/useAccounts";
import { toast }             from "sonner";
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
      "px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-150 min-h-[44px] sm:min-h-0 sm:py-1.5",
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
  const { mutateAsync, isPending } = useUpdateUserProfile();
  const { data: accountsData } = useAccounts({ limit: 50 });
  const accounts = accountsData?.accounts ?? [];

  const init = useCallback(() => ({
    experienceLevel:   mongoUser?.traderProfile?.experienceLevel ?? "beginner",
    tradingModes:      mongoUser?.traderProfile?.tradingModes    ?? [],
    tradingStyles:     mongoUser?.traderProfile?.tradingStyles   ?? [],
    primaryPairs:      mongoUser?.traderProfile?.primaryPairs    ?? [],
    preferredSessions: mongoUser?.traderProfile?.preferredSessions ?? [],
  }), [mongoUser]);

  const [data, setData] = useState(init);
  const [customPair, setCustomPair] = useState("");
  const [customPairError, setCustomPairError] = useState("");

  useEffect(() => { setData(init()); }, [mongoUser?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const saved = useMemo(() => init(), [init]);

  const isDirty = useMemo(() => (
    data.experienceLevel !== saved.experienceLevel ||
    JSON.stringify(data.tradingModes)      !== JSON.stringify(saved.tradingModes)      ||
    JSON.stringify(data.tradingStyles)     !== JSON.stringify(saved.tradingStyles)     ||
    JSON.stringify(data.primaryPairs)      !== JSON.stringify(saved.primaryPairs)      ||
    JSON.stringify(data.preferredSessions) !== JSON.stringify(saved.preferredSessions)
  ), [data, saved]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (field, value) => setData((d) => ({ ...d, [field]: value }));

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

  const handleSave = async () => {
    try {
      await mutateAsync({
        traderProfile: {
          experienceLevel:   data.experienceLevel,
          tradingModes:      data.tradingModes,
          tradingStyles:     data.tradingStyles,
          primaryPairs:      data.primaryPairs,
          preferredSessions: data.preferredSessions,
        },
      });
      toast.success("Trading settings saved");
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to save changes";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="experience">
        <TabsList className="bg-muted/50 w-full sm:w-auto">
          <TabsTrigger value="experience" className="flex-1 sm:flex-none">Experience</TabsTrigger>
          <TabsTrigger value="pairs"      className="flex-1 sm:flex-none">Pairs & Sessions</TabsTrigger>
          <TabsTrigger value="account"    className="flex-1 sm:flex-none">Default Account</TabsTrigger>
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
                      "text-left p-3 rounded-xl border-2 transition-all duration-150 min-h-[60px]",
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
              {data.primaryPairs
                .filter((p) => !COMMON_PAIRS.includes(p))
                .map((pair) => (
                  <Chip
                    key={pair}
                    label={pair}
                    selected
                    onClick={() => update("primaryPairs", data.primaryPairs.filter((p) => p !== pair))}
                  />
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
                  className="bg-background border-border h-10 text-xs"
                  maxLength={10}
                />
                {customPairError && (
                  <p className="text-[10px]" style={{ color: "var(--loss)" }}>{customPairError}</p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-10 px-3 text-xs shrink-0"
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
                      "text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 min-h-[60px]",
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
          <p className="text-xs text-muted-foreground">
            This account is pre-selected in filters across the app.
          </p>
          <Select
            value={mongoUser?.defaultAccountId || "none"}
            disabled
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
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border">
            <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Default account selection from settings is coming soon. For now, use the account filter on the Dashboard.
            </p>
          </div>
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
