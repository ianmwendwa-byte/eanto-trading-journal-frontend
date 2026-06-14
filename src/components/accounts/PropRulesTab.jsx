import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Label }     from "@/components/ui/label";
import { Switch }    from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import { useUpdatePropRules } from "@/hooks/useAccountRules";
import { cn } from "@/lib/utils";

const SESSION_OPTIONS = ["asian", "london", "new_york", "sydney"];

const PERMISSION_FIELDS = [
  { name: "easAllowed",           label: "EAs / Bots Allowed" },
  { name: "thirdPartyEasAllowed", label: "Third-Party EAs" },
  { name: "hftAllowed",           label: "HFT Allowed" },
  { name: "copyTradingAllowed",   label: "Copy Trading" },
  { name: "hedgingAllowed",       label: "Hedging" },
  { name: "martingaleAllowed",    label: "Martingale" },
  { name: "gridAllowed",          label: "Grid Trading" },
  { name: "goldArbitrageAllowed", label: "Gold Arbitrage" },
];

const propRulesSchema = z.object({
  propFirmName:  z.string().optional(),
  challengeFee:  z.coerce.number().optional().nullable(),
  programType:   z.string().optional(),

  maxDrawdownPercent:   z.coerce.number().min(1, "Min 1").max(20, "Max 20").optional().nullable(),
  dailyDrawdownPercent: z.coerce.number().min(1, "Min 1").max(20, "Max 20").optional().nullable(),
  softBreachPercent:    z.coerce.number().optional().nullable(),
  softBreachAction:     z.string().optional(),

  profitTarget:          z.coerce.number().gt(0, "Must be > 0").optional().nullable(),
  minProfitableDays:     z.coerce.number().optional().nullable(),
  minDailyProfitPercent: z.coerce.number().optional().nullable(),

  minTradingDays:          z.coerce.number().optional().nullable(),
  inactivityBreachDays:    z.coerce.number().optional().nullable(),
  minTradeDurationSeconds: z.coerce.number().optional().nullable(),

  maxTradesPerDay: z.coerce.number().min(1, "Min 1").max(1000, "Max 1000").optional().nullable(),
  maxLotSize:      z.coerce.number().gt(0, "Must be > 0").optional().nullable(),

  tradingPermissions: z.object({
    easAllowed:            z.boolean().optional(),
    thirdPartyEasAllowed:  z.boolean().optional(),
    hftAllowed:            z.boolean().optional(),
    copyTradingAllowed:    z.boolean().optional(),
    hedgingAllowed:        z.boolean().optional(),
    martingaleAllowed:     z.boolean().optional(),
    gridAllowed:           z.boolean().optional(),
    goldArbitrageAllowed:  z.boolean().optional(),
  }).optional(),

  allowedSessions: z.array(z.string()).optional(),

  holdingRules: z.object({
    overnightAllowed:       z.boolean().optional(),
    weekendAllowed:         z.boolean().optional(),
    fridayCloseBufferHours: z.coerce.number().optional().nullable(),
    mondayOpenBufferHours:  z.coerce.number().optional().nullable(),
    newsBufferMinutes:      z.coerce.number().optional().nullable(),
    newsTradingAllowed:     z.boolean().optional(),
    newsMaxProfitPercent:   z.coerce.number().optional().nullable(),
  }).optional(),

  payoutRules: z.object({
    profitSplitPercent:      z.coerce.number().optional().nullable(),
    maxSplitPercent:         z.coerce.number().optional().nullable(),
    payoutFrequency:         z.string().optional(),
    minPayoutAmount:         z.coerce.number().optional().nullable(),
    initialPayoutCapPercent: z.coerce.number().optional().nullable(),
    initialPayoutCapAmount:  z.coerce.number().optional().nullable(),
  }).optional(),

  consistencyRules: z.object({
    enabled:                   z.boolean().optional(),
    maxSingleDayProfitPercent: z.coerce.number().optional().nullable(),
  }).optional(),
});

// ── Shared field wrapper ──────────────────────────────────────
const FF = ({ label, helper, children, error }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {helper && <p className="text-[11px] text-muted-foreground -mt-1">{helper}</p>}
    {children}
    {error && <p className="text-xs text-destructive">{error.message}</p>}
  </div>
);

const SuffixInput = ({ suffix, ...props }) => (
  <div className="relative">
    <Input type="number" step="0.1" className="bg-background border-border pr-12" {...props} />
    {suffix && (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
        {suffix}
      </span>
    )}
  </div>
);

const SectionCard = ({ title, children }) => (
  <div className="trading-card p-4 space-y-4">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
    {children}
  </div>
);

const toNum = (v) => (v === "" || v == null ? null : Number(v));

export const PropRulesTab = ({ account }) => {
  const { mutate: updatePropRules, isPending } = useUpdatePropRules(account._id);
  const pr = account.propRules ?? {};
  const tr = pr.tradingPermissions ?? {};
  const hr = pr.holdingRules       ?? {};
  const payout = pr.payoutRules    ?? {};
  const cons   = pr.consistencyRules ?? {};

  const {
    register, control, handleSubmit, watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(propRulesSchema),
    defaultValues: {
      propFirmName:  pr.propFirmName  ?? "",
      challengeFee:  pr.challengeFee  ?? "",
      programType:   pr.programType   ?? "",

      maxDrawdownPercent:   pr.maxDrawdownPercent   ?? "",
      dailyDrawdownPercent: pr.dailyDrawdownPercent ?? "",
      softBreachPercent:    pr.softBreachPercent    ?? "",
      softBreachAction:     pr.softBreachAction     ?? "",

      profitTarget:          pr.profitTarget          ?? "",
      minProfitableDays:     pr.minProfitableDays     ?? "",
      minDailyProfitPercent: pr.minDailyProfitPercent ?? "",

      minTradingDays:          pr.minTradingDays          ?? "",
      inactivityBreachDays:    pr.inactivityBreachDays    ?? "",
      minTradeDurationSeconds: pr.minTradeDurationSeconds ?? "",

      maxTradesPerDay: pr.maxTradesPerDay ?? "",
      maxLotSize:      pr.maxLotSize      ?? "",

      tradingPermissions: {
        easAllowed:            tr.easAllowed            ?? false,
        thirdPartyEasAllowed:  tr.thirdPartyEasAllowed  ?? false,
        hftAllowed:            tr.hftAllowed            ?? false,
        copyTradingAllowed:    tr.copyTradingAllowed     ?? false,
        hedgingAllowed:        tr.hedgingAllowed         ?? false,
        martingaleAllowed:     tr.martingaleAllowed      ?? false,
        gridAllowed:           tr.gridAllowed            ?? false,
        goldArbitrageAllowed:  tr.goldArbitrageAllowed   ?? false,
      },

      allowedSessions: pr.allowedSessions ?? [],

      holdingRules: {
        overnightAllowed:       hr.overnightAllowed       ?? false,
        weekendAllowed:         hr.weekendAllowed         ?? false,
        fridayCloseBufferHours: hr.fridayCloseBufferHours ?? "",
        mondayOpenBufferHours:  hr.mondayOpenBufferHours  ?? "",
        newsBufferMinutes:      hr.newsBufferMinutes       ?? "",
        newsTradingAllowed:     hr.newsTradingAllowed      ?? false,
        newsMaxProfitPercent:   hr.newsMaxProfitPercent    ?? "",
      },

      payoutRules: {
        profitSplitPercent:      payout.profitSplitPercent      ?? "",
        maxSplitPercent:         payout.maxSplitPercent         ?? "",
        payoutFrequency:         payout.payoutFrequency         ?? "monthly",
        minPayoutAmount:         payout.minPayoutAmount         ?? "",
        initialPayoutCapPercent: payout.initialPayoutCapPercent ?? "",
        initialPayoutCapAmount:  payout.initialPayoutCapAmount  ?? "",
      },

      consistencyRules: {
        enabled:                   cons.enabled                    ?? false,
        maxSingleDayProfitPercent: cons.maxSingleDayProfitPercent  ?? "",
      },
    },
  });

  const allowedSessions    = watch("allowedSessions")          ?? [];
  const newsTradingAllowed = watch("holdingRules.newsTradingAllowed");
  const consistencyEnabled = watch("consistencyRules.enabled");

  const toggleSession = (s, current, onChange) => {
    const next = current.includes(s) ? current.filter((x) => x !== s) : [...current, s];
    onChange(next);
  };

  const onSubmit = (data) => {
    const payload = {
      propFirmName:  data.propFirmName  || undefined,
      challengeFee:  toNum(data.challengeFee),
      programType:   data.programType   || undefined,

      maxDrawdownPercent:   toNum(data.maxDrawdownPercent),
      dailyDrawdownPercent: toNum(data.dailyDrawdownPercent),
      softBreachPercent:    toNum(data.softBreachPercent),
      softBreachAction:     data.softBreachAction || undefined,

      profitTarget:          toNum(data.profitTarget),
      minProfitableDays:     toNum(data.minProfitableDays),
      minDailyProfitPercent: toNum(data.minDailyProfitPercent),

      minTradingDays:          toNum(data.minTradingDays),
      inactivityBreachDays:    toNum(data.inactivityBreachDays),
      minTradeDurationSeconds: toNum(data.minTradeDurationSeconds),

      maxTradesPerDay: toNum(data.maxTradesPerDay),
      maxLotSize:      toNum(data.maxLotSize),

      tradingPermissions: data.tradingPermissions,
      allowedSessions:    data.allowedSessions,

      holdingRules: {
        ...data.holdingRules,
        fridayCloseBufferHours: toNum(data.holdingRules.fridayCloseBufferHours),
        mondayOpenBufferHours:  toNum(data.holdingRules.mondayOpenBufferHours),
        newsBufferMinutes:      toNum(data.holdingRules.newsBufferMinutes),
        newsMaxProfitPercent:   toNum(data.holdingRules.newsMaxProfitPercent),
      },

      payoutRules: {
        ...data.payoutRules,
        profitSplitPercent:      toNum(data.payoutRules.profitSplitPercent),
        maxSplitPercent:         toNum(data.payoutRules.maxSplitPercent),
        minPayoutAmount:         toNum(data.payoutRules.minPayoutAmount),
        initialPayoutCapPercent: toNum(data.payoutRules.initialPayoutCapPercent),
        initialPayoutCapAmount:  toNum(data.payoutRules.initialPayoutCapAmount),
      },

      consistencyRules: {
        enabled:                   data.consistencyRules.enabled,
        maxSingleDayProfitPercent: toNum(data.consistencyRules.maxSingleDayProfitPercent),
      },
    };
    updatePropRules(payload);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h3 className="text-sm font-semibold text-foreground font-heading">Prop Firm Rules</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Firm-imposed constraints. All rules are always enforced on prop accounts.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* ① Firm Info */}
        <SectionCard title="Firm Info">
          <div className="grid grid-cols-2 gap-4">
            <FF label="Prop Firm Name">
              <Input {...register("propFirmName")} placeholder="e.g. FTMO" className="bg-background border-border" />
            </FF>
            <FF label="Challenge Fee">
              <Input type="number" {...register("challengeFee")} placeholder="e.g. 299" className="bg-background border-border" />
            </FF>
          </div>
          <FF label="Program Type">
            <Controller
              name="programType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="1_step">1-Step</SelectItem>
                    <SelectItem value="2_step">2-Step</SelectItem>
                    <SelectItem value="3_step">3-Step</SelectItem>
                    <SelectItem value="instant">Instant Funding</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FF>
        </SectionCard>

        {/* ② Drawdown Rules */}
        <SectionCard title="Drawdown Rules">
          <div className="grid grid-cols-2 gap-4">
            <FF label="Max Drawdown %" error={errors.maxDrawdownPercent}>
              <SuffixInput suffix="%" {...register("maxDrawdownPercent")} placeholder="e.g. 10" />
            </FF>
            <FF label="Daily Drawdown %" error={errors.dailyDrawdownPercent}>
              <SuffixInput suffix="%" {...register("dailyDrawdownPercent")} placeholder="e.g. 5" />
            </FF>
            <FF label="Soft Breach %">
              <SuffixInput suffix="%" {...register("softBreachPercent")} placeholder="e.g. 4" />
            </FF>
            <FF label="Soft Breach Action">
              <Input {...register("softBreachAction")} placeholder="e.g. Notify only" className="bg-background border-border" />
            </FF>
          </div>
        </SectionCard>

        {/* ③ Profit Target */}
        <SectionCard title="Profit Target">
          <div className="grid grid-cols-2 gap-4">
            <FF label="Profit Target %" error={errors.profitTarget}>
              <SuffixInput suffix="%" {...register("profitTarget")} placeholder="e.g. 10" />
            </FF>
            <FF label="Min Profitable Days">
              <Input type="number" {...register("minProfitableDays")} placeholder="e.g. 4" className="bg-background border-border" />
            </FF>
            <FF label="Min Daily Profit %">
              <SuffixInput suffix="%" {...register("minDailyProfitPercent")} placeholder="e.g. 0.5" />
            </FF>
          </div>
        </SectionCard>

        {/* ④ Time Rules */}
        <SectionCard title="Time Rules">
          <div className="grid grid-cols-2 gap-4">
            <FF label="Min Trading Days">
              <Input type="number" {...register("minTradingDays")} className="bg-background border-border" />
            </FF>
            <FF label="Inactivity Breach Days">
              <Input type="number" {...register("inactivityBreachDays")} className="bg-background border-border" />
            </FF>
            <FF label="Min Trade Duration (sec)" helper="HFT prevention — minimum seconds a trade must be open">
              <Input type="number" {...register("minTradeDurationSeconds")} placeholder="e.g. 120" className="bg-background border-border" />
            </FF>
          </div>
        </SectionCard>

        {/* ⑤ Position Limits */}
        <SectionCard title="Position Limits">
          <div className="grid grid-cols-2 gap-4">
            <FF label="Max Trades Per Day" error={errors.maxTradesPerDay}>
              <Input type="number" min="1" max="1000" {...register("maxTradesPerDay")} className="bg-background border-border" />
            </FF>
            <FF label="Max Lot Size" error={errors.maxLotSize}>
              <Input type="number" step="0.01" {...register("maxLotSize")} placeholder="e.g. 5.0" className="bg-background border-border" />
            </FF>
          </div>
        </SectionCard>

        {/* ⑥ Trading Permissions */}
        <SectionCard title="Trading Permissions">
          <div className="grid grid-cols-2 gap-3">
            {PERMISSION_FIELDS.map(({ name, label }) => (
              <Controller
                key={name}
                name={`tradingPermissions.${name}`}
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between py-1">
                    <Label className="text-xs text-muted-foreground cursor-pointer">{label}</Label>
                    <Switch checked={field.value} onCheckedChange={field.onChange} className="scale-90" />
                  </div>
                )}
              />
            ))}
          </div>
        </SectionCard>

        {/* ⑦ Allowed Sessions */}
        <SectionCard title="Allowed Sessions">
          <Controller
            name="allowedSessions"
            control={control}
            render={({ field }) => (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {SESSION_OPTIONS.map((s) => {
                    const active = (field.value ?? []).includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSession(s, field.value ?? [], field.onChange)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs border font-medium transition-colors",
                          active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                        )}
                      >
                        {s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </button>
                    );
                  })}
                </div>
                {(field.value ?? []).length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No sessions selected — all sessions allowed
                  </p>
                )}
              </div>
            )}
          />
        </SectionCard>

        {/* ⑧ Holding Rules */}
        <SectionCard title="Holding Rules">
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "holdingRules.overnightAllowed", label: "Overnight Allowed" },
              { name: "holdingRules.weekendAllowed",   label: "Weekend Allowed" },
              { name: "holdingRules.newsTradingAllowed", label: "News Trading (master switch)" },
            ].map(({ name, label }) => (
              <Controller
                key={name}
                name={name}
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between py-1 col-span-2 sm:col-span-1">
                    <Label className="text-xs text-muted-foreground">{label}</Label>
                    <Switch checked={field.value} onCheckedChange={field.onChange} className="scale-90" />
                  </div>
                )}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <FF label="Friday Close Buffer (hrs)">
              <Input type="number" {...register("holdingRules.fridayCloseBufferHours")} className="bg-background border-border" />
            </FF>
            <FF label="Monday Open Buffer (hrs)">
              <Input type="number" {...register("holdingRules.mondayOpenBufferHours")} className="bg-background border-border" />
            </FF>
            <FF label="News Buffer (min)">
              <Input type="number" {...register("holdingRules.newsBufferMinutes")} className="bg-background border-border" />
            </FF>
            <FF label="News Max Profit %" helper="Only applies when news trading is allowed">
              <SuffixInput
                suffix="%"
                disabled={!newsTradingAllowed}
                {...register("holdingRules.newsMaxProfitPercent")}
              />
            </FF>
          </div>
        </SectionCard>

        {/* ⑨ Payout Rules */}
        <SectionCard title="Payout Rules">
          <div className="grid grid-cols-2 gap-4">
            <FF label="Profit Split">
              <SuffixInput suffix="%" {...register("payoutRules.profitSplitPercent")} placeholder="e.g. 80" />
            </FF>
            <FF label="Max Split Cap">
              <SuffixInput suffix="%" {...register("payoutRules.maxSplitPercent")} />
            </FF>
            <FF label="Min Payout Amount">
              <Input type="number" {...register("payoutRules.minPayoutAmount")} className="bg-background border-border" />
            </FF>
            <FF label="Payout Frequency">
              <Controller
                name="payoutRules.payoutFrequency"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Biweekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FF>
            <FF label="Initial Payout Cap %">
              <SuffixInput suffix="%" {...register("payoutRules.initialPayoutCapPercent")} />
            </FF>
            <FF label="Initial Payout Cap Amount">
              <Input type="number" {...register("payoutRules.initialPayoutCapAmount")} className="bg-background border-border" />
            </FF>
          </div>
        </SectionCard>

        {/* ⑩ Consistency Rules */}
        <SectionCard title="Consistency Rules">
          <Controller
            name="consistencyRules.enabled"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Enable Consistency Rule</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Restrict how much of your profit can come from a single day
                  </p>
                </div>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </div>
            )}
          />
          <FF
            label="Max Single Day Profit %"
            helper="No single day's profit can exceed this % of your total profit target"
          >
            <SuffixInput
              suffix="%"
              disabled={!consistencyEnabled}
              {...register("consistencyRules.maxSingleDayProfitPercent")}
              placeholder="e.g. 40"
            />
          </FF>
        </SectionCard>

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
};
