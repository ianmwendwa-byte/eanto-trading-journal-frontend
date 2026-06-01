import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const TRADING_STYLES = [
  { value: "scalping",  label: "Scalping",  desc: "Seconds to minutes" },
  { value: "intraday",  label: "Intraday",  desc: "Minutes to hours" },
  { value: "swing",     label: "Swing",     desc: "Days to weeks" },
  { value: "position",  label: "Position",  desc: "Weeks to months" },
];

const COMMON_PAIRS = [
  "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD",
  "USDCHF", "NZDUSD", "EURGBP", "GBPJPY", "EURJPY",
  "XAUUSD", "XAGUSD", "US30",   "NAS100", "GBPCHF",
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
      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200",
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

const STEP_SUBTITLES = {
  manual:     "Tell us about your trading style",
  prop:       "Tell us about your trading approach",
  ea:         "Configure your EA trading setup",
  "semi-auto":"Tell us about your hybrid approach",
};

export const TradingStyleStep = ({ wizardData, onChange }) => {
  const {
    traderType, tradingStyles, primaryPairs, preferredSessions, bio,
  } = wizardData;

  const subtitle = STEP_SUBTITLES[traderType] ?? "Tell us about your trading style";

  return (
    <div className="space-y-7">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-0.5">How do you trade?</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      {/* Trading styles */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-foreground">
            Trading Style <span className="text-destructive">*</span>
          </p>
          <span className="text-[10px] text-muted-foreground">Select all that apply</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {TRADING_STYLES.map((s) => (
            <Chip
              key={s.value}
              label={s.label}
              sub={s.desc}
              selected={tradingStyles.includes(s.value)}
              onClick={() => onChange({ tradingStyles: toggle(tradingStyles, s.value) })}
            />
          ))}
        </div>
      </div>

      {/* Primary pairs */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-foreground">Your Favourite Pairs</p>
          <span className="text-[10px] text-muted-foreground">
            {primaryPairs.length}/10
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_PAIRS.map((pair) => (
            <Chip
              key={pair}
              label={pair}
              selected={primaryPairs.includes(pair)}
              onClick={() => onChange({ primaryPairs: toggle(primaryPairs, pair, 10) })}
            />
          ))}
        </div>
      </div>

      {/* Preferred sessions */}
      <div className="space-y-2.5">
        <p className="text-xs font-medium text-foreground">When do you usually trade?</p>
        <div className="grid grid-cols-2 gap-2">
          {SESSIONS.map((s) => {
            const selected = preferredSessions.includes(s.value);
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onChange({ preferredSessions: toggle(preferredSessions, s.value) })}
                className={cn(
                  "text-left px-4 py-3 rounded-xl border-2 transition-all duration-200",
                  selected
                    ? "bg-primary/5 border-primary text-foreground"
                    : "bg-card border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-[10px] opacity-60 mt-0.5">{s.hours}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-foreground">About your approach <span className="text-muted-foreground font-normal">(optional)</span></p>
          <span className="text-[10px] text-muted-foreground">{(bio ?? "").length}/500</span>
        </div>
        <Textarea
          value={bio ?? ""}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder="Brief description of your trading approach..."
          maxLength={500}
          rows={3}
          className="bg-background border-border resize-none text-sm"
        />
      </div>
    </div>
  );
};
