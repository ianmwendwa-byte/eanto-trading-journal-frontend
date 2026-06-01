import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, AlertCircle, Check,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Label }     from "@/components/ui/label";
import { Textarea }  from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { GradeStars }       from "./GradeStars";
import { DirectionBadge }   from "./DirectionBadge";
import { SessionBadge }     from "./SessionBadge";
import { useCreateTrade }   from "@/hooks/useTrades";
import { useAccounts }      from "@/hooks/useAccounts";
import { tradeFormSchema, transformTradeForm } from "@/app/schema/trade";
import { formatPnL, getPnLColor } from "@/utils/format";
import { getTradeDuration }  from "@/utils/tradeDuration";
import { detectSession }     from "@/utils/calendar";
import { cn } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────
const STEPS = [
  { label: "Setup",  subtitle: "Pair & direction" },
  { label: "Entry",  subtitle: "Prices & P&L"     },
  { label: "Review", subtitle: "Notes & submit"   },
];

const STEP_FIELDS = [
  ["accountId", "pair", "direction"],
  ["entryPrice", "exitPrice", "lotSize", "pnl", "openedAt", "closedAt"],
  [],
];

const PAIR_ROW1 = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD"];
const PAIR_ROW2 = ["XAUUSD", "GBPJPY", "EURJPY", "USDCHF", "NZDUSD"];
const LOT_PRESETS  = ["0.01", "0.05", "0.10", "0.25", "0.50", "1.00"];
const RISK_PRESETS = ["0.5", "1", "2", "5", "10"];
const COMMON_TAGS  = ["breakout", "trend_follow", "reversal", "range", "scalp", "swing", "news"];

const SESSIONS = [
  { value: "london",   label: "London"   },
  { value: "new_york", label: "New York" },
  { value: "tokyo",    label: "Asian"    },
  { value: "sydney",   label: "Sydney"   },
  { value: "overlap",  label: "Overlap"  },
];

const localNow = () => format(new Date(), "yyyy-MM-dd'T'HH:mm");

// ── Step animation ────────────────────────────────────────────
const stepVariants = {
  enter:  (dir) => ({ x: dir * 32, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit:   (dir) => ({ x: dir * -32, opacity: 0, transition: { duration: 0.15, ease: "easeIn" } }),
};

// ── Step Indicator ────────────────────────────────────────────
const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center justify-center px-6 py-4 border-b border-border bg-muted/20">
    {STEPS.map((s, i) => (
      <div key={i} className="flex items-center">
        <div className="flex flex-col items-center gap-1">
          <div className="relative flex items-center justify-center">
            <div className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300",
              i < currentStep
                ? "bg-primary border-primary text-primary-foreground"
                : i === currentStep
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-transparent text-muted-foreground"
            )}>
              {i < currentStep
                ? <Check className="h-3.5 w-3.5" />
                : <span className="text-[11px] font-bold">{i + 1}</span>
              }
            </div>
            {i === currentStep && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/40"
                animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>
          <span className={cn(
            "text-[10px] font-medium whitespace-nowrap",
            i === currentStep ? "text-primary" : "text-muted-foreground"
          )}>
            {s.label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={cn(
            "w-12 h-0.5 mx-2 mb-4 transition-all duration-500",
            i < currentStep ? "bg-primary" : "bg-border"
          )} />
        )}
      </div>
    ))}
  </div>
);

// ── Field wrapper ─────────────────────────────────────────────
const FF = ({ label, required, error, helper, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">
      {label}{required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {children}
    {helper && <p className="text-[10px] text-muted-foreground">{helper}</p>}
    {error && (
      <p className="flex items-center gap-1 text-xs text-destructive">
        <AlertCircle className="h-3 w-3 flex-shrink-0" />
        {error.message}
      </p>
    )}
  </div>
);

// ── Quick chip button ─────────────────────────────────────────
const Chip = ({ label, onClick, active = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "px-2 py-0.5 rounded text-[10px] font-mono border transition-all",
      active
        ? "bg-primary/15 border-primary/40 text-primary"
        : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5"
    )}
  >
    {label}
  </button>
);

// ── Trade summary card (step 3) ───────────────────────────────
const TradeSummaryCard = ({ direction, pair, lotSize, entryPrice, exitPrice, pnl, session, openedAt, closedAt }) => {
  const duration = getTradeDuration(
    openedAt ? new Date(openedAt).toISOString() : null,
    closedAt ? new Date(closedAt).toISOString() : null
  );
  const pnlNum = parseFloat(pnl);
  const hasPnl = !isNaN(pnlNum);

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {direction && <DirectionBadge direction={direction} />}
        <span className="font-mono font-bold text-foreground text-base">{pair || "—"}</span>
        {lotSize && <span className="font-mono text-muted-foreground text-sm">{Number(lotSize).toFixed(2)} lots</span>}
        {session && <SessionBadge session={session} small />}
      </div>

      {(entryPrice || exitPrice) && (
        <div className="text-sm font-mono text-muted-foreground">
          {entryPrice && <span className="text-foreground">{Number(entryPrice).toFixed(5)}</span>}
          {entryPrice && exitPrice && <span className="mx-2">→</span>}
          {exitPrice && <span className="text-foreground">{Number(exitPrice).toFixed(5)}</span>}
        </div>
      )}

      <div className="flex items-center justify-between">
        {hasPnl ? (
          <span className={cn("font-mono font-bold text-xl", getPnLColor(pnlNum))}>
            {formatPnL(pnlNum)}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
        {duration !== "—" && (
          <span className="text-xs font-mono text-muted-foreground">{duration}</span>
        )}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────
export const AddTradeSheet = ({ isOpen, onClose, defaultAccountId }) => {
  const [step,    setStep]    = useState(0);
  const [stepDir, setStepDir] = useState(1);

  const { mutate: createTrade, isPending } = useCreateTrade();
  const { data: accountsData } = useAccounts({ limit: 50 });
  const accounts = accountsData?.accounts ?? [];

  const {
    register, control, handleSubmit, watch, setValue, trigger, reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      accountId:          defaultAccountId ?? "",
      pair:               "",
      direction:          null,
      pnl:                "",
      entryPrice:         "",
      exitPrice:          "",
      lotSize:            "",
      stopLoss:           "",
      takeProfit:         "",
      openedAt:           localNow(),
      closedAt:           localNow(),
      session:            "",
      commission:         "",
      swap:               "",
      riskPercent:        "",
      note:               "",
      tags:               [],
      setupQualityRating: "",
    },
  });

  const [direction, closedAt, gradeVal, pair, openedAt, session, tags, lotsStr, pnlStr, entryStr, exitStr, slStr, tpStr] = watch([
    "direction", "closedAt", "setupQualityRating",
    "pair", "openedAt", "session", "tags",
    "lotSize", "pnl", "entryPrice", "exitPrice", "stopLoss", "takeProfit",
  ]);

  // Auto-detect session from closedAt
  useEffect(() => {
    const detected = detectSession(closedAt);
    if (detected) setValue("session", detected, { shouldValidate: false });
  }, [closedAt, setValue]);

  // Live RR preview (entry/SL/TP — display only, backend recalculates)
  const estimatedRR = (() => {
    const entry = parseFloat(entryStr);
    const sl    = parseFloat(slStr);
    const tp    = parseFloat(tpStr);
    if (isNaN(entry) || isNaN(sl) || isNaN(tp) || !direction) return null;
    const risk   = direction === "buy" ? entry - sl : sl - entry;
    const reward = direction === "buy" ? tp - entry : entry - tp;
    return risk > 0 ? reward / risk : null;
  })();

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setStepDir(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setStepDir(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const onSubmit = (data) => {
    createTrade(transformTradeForm(data), {
      onSuccess: () => {
        reset();
        setStep(0);
        onClose?.();
      },
    });
  };

  const handleClose = () => {
    reset();
    setStep(0);
    onClose?.();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[580px] bg-card border-l border-border p-0 flex flex-col [&>button:first-of-type]:hidden"
      >
        {/* ── Header ──────────────────────────────────── */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="font-heading text-lg font-bold">Add Trade</SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{STEPS[step].subtitle}</p>
            </div>
          </div>
        </SheetHeader>

        {/* ── Step indicator ───────────────────────────── */}
        <StepIndicator currentStep={step} />

        {/* ── Step content ─────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait" custom={stepDir}>
            <motion.div
              key={step}
              custom={stepDir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="px-5 py-5 space-y-5"
            >

              {/* ══ STEP 1 — Trade Setup ══════════════════ */}
              {step === 0 && (
                <>
                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-xl text-foreground">What did you trade?</h3>
                    <p className="text-sm text-muted-foreground">Start with the basics</p>
                  </div>

                  {/* Account */}
                  <FF label="Account" required error={errors.accountId}>
                    <Controller
                      name="accountId"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-background border-border h-10">
                            <SelectValue placeholder="Select your account" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {accounts.map((acc) => (
                              <SelectItem key={acc._id} value={acc._id}>
                                {acc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FF>

                  {/* Currency pair */}
                  <FF label="Currency Pair" required error={errors.pair}>
                    <Input
                      {...register("pair")}
                      placeholder="EURUSD"
                      className="bg-background border-border font-mono text-xl h-12 uppercase tracking-widest"
                      onChange={(e) => setValue("pair", e.target.value.toUpperCase(), { shouldValidate: true })}
                    />
                    <div className="space-y-1.5 mt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {PAIR_ROW1.map((p) => (
                          <Chip key={p} label={p} active={pair === p}
                            onClick={() => setValue("pair", p, { shouldValidate: true })} />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {PAIR_ROW2.map((p) => (
                          <Chip key={p} label={p} active={pair === p}
                            onClick={() => setValue("pair", p, { shouldValidate: true })} />
                        ))}
                      </div>
                    </div>
                  </FF>

                  {/* Direction — large tactile buttons */}
                  <FF label="Direction" required error={errors.direction}>
                    <Controller
                      name="direction"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: "buy",  label: "▲ BUY",  sub: "Long Position",  Icon: TrendingUp  },
                            { value: "sell", label: "▼ SELL", sub: "Short Position", Icon: TrendingDown },
                          ].map(({ value: v, label, sub, Icon }) => (
                            <motion.button
                              key={v}
                              type="button"
                              whileTap={{ scale: 0.98 }}
                              onClick={() => field.onChange(v)}
                              className={cn(
                                "h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-150",
                                field.value === v
                                  ? v === "buy"
                                    ? "bg-[var(--profit)]/15 border-[var(--profit)] text-[var(--profit)]"
                                    : "bg-[var(--loss)]/15 border-[var(--loss)] text-[var(--loss)]"
                                  : "border-border text-muted-foreground hover:border-border/60 hover:text-foreground"
                              )}
                            >
                              <Icon className="h-6 w-6" />
                              <span className="font-mono font-bold text-lg leading-none">{label}</span>
                              <span className="text-[10px] opacity-70 leading-none">{sub}</span>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    />
                  </FF>
                </>
              )}

              {/* ══ STEP 2 — Trade Execution ══════════════ */}
              {step === 1 && (
                <>
                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-xl text-foreground">How did it execute?</h3>
                    <p className="text-sm text-muted-foreground">Prices, P&L, and trade details</p>
                  </div>

                  {/* Entry / Exit */}
                  <div className="grid grid-cols-2 gap-3">
                    <FF label="Entry Price" required error={errors.entryPrice}>
                      <Input
                        {...register("entryPrice")}
                        type="number" step="any" placeholder="1.08542"
                        className="bg-background border-border font-mono h-11 text-base"
                      />
                    </FF>
                    <FF label="Exit Price" required error={errors.exitPrice}>
                      <Input
                        {...register("exitPrice")}
                        type="number" step="any" placeholder="1.09012"
                        className="bg-background border-border font-mono h-11 text-base"
                      />
                    </FF>
                  </div>

                  {/* P&L — required, entered by user from broker */}
                  <FF
                    label="P&L"
                    required
                    error={errors.pnl}
                    helper="Enter the actual P&L from your broker (negative = loss)"
                  >
                    <Input
                      {...register("pnl")}
                      type="number"
                      step="any"
                      placeholder="-150.00"
                      className={cn(
                        "bg-background border-border font-mono h-12 text-lg font-bold",
                        pnlStr && !isNaN(parseFloat(pnlStr)) && parseFloat(pnlStr) > 0
                          ? "text-[var(--profit)]"
                          : pnlStr && !isNaN(parseFloat(pnlStr)) && parseFloat(pnlStr) < 0
                            ? "text-[var(--loss)]"
                            : ""
                      )}
                    />
                  </FF>

                  {/* Lot size */}
                  <FF label="Lot Size" required error={errors.lotSize}>
                    <Input
                      {...register("lotSize")}
                      type="number" step="any" placeholder="0.10"
                      className="bg-background border-border font-mono h-10"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {LOT_PRESETS.map((l) => (
                        <Chip key={l} label={l} active={String(lotsStr) === l}
                          onClick={() => setValue("lotSize", l, { shouldValidate: true })} />
                      ))}
                    </div>
                  </FF>

                  {/* SL / TP */}
                  <div className="grid grid-cols-2 gap-3">
                    <FF label="Stop Loss" error={errors.stopLoss}>
                      <Input
                        {...register("stopLoss")}
                        type="number" step="any" placeholder="1.08200"
                        className="bg-background border-border font-mono h-10"
                      />
                    </FF>
                    <FF label="Take Profit" error={errors.takeProfit}>
                      <Input
                        {...register("takeProfit")}
                        type="number" step="any" placeholder="1.09500"
                        className="bg-background border-border font-mono h-10"
                      />
                    </FF>
                  </div>

                  {/* Live planned RR preview (display only) */}
                  <AnimatePresence>
                    {estimatedRR !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="px-4 py-2.5 rounded-lg border border-border bg-muted/30 text-center"
                      >
                        <p className="text-xs font-mono text-muted-foreground">
                          Planned R:R <span className="text-foreground font-semibold">1:{estimatedRR.toFixed(2)}</span>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Timing */}
                  <div className="grid grid-cols-2 gap-3">
                    <FF label="Opened At" required error={errors.openedAt}>
                      <Input
                        {...register("openedAt")}
                        type="datetime-local"
                        className="bg-background border-border text-sm h-10"
                      />
                    </FF>
                    <FF label="Closed At" required error={errors.closedAt}>
                      <Input
                        {...register("closedAt")}
                        type="datetime-local"
                        className="bg-background border-border text-sm h-10"
                      />
                    </FF>
                  </div>

                  {/* Costs */}
                  <div className="grid grid-cols-2 gap-3">
                    <FF label="Commission" error={errors.commission}>
                      <Input
                        {...register("commission")}
                        type="number" step="any" placeholder="3.50"
                        className="bg-background border-border font-mono h-10"
                      />
                    </FF>
                    <FF label="Swap" error={errors.swap}>
                      <Input
                        {...register("swap")}
                        type="number" step="any" placeholder="0.00"
                        className="bg-background border-border font-mono h-10"
                      />
                    </FF>
                  </div>

                  {/* Risk % */}
                  <FF label="Risk %" error={errors.riskPercent} helper="% of account balance risked">
                    <Input
                      {...register("riskPercent")}
                      type="number" step="any" placeholder="1.0"
                      className="bg-background border-border font-mono h-10"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {RISK_PRESETS.map((r) => (
                        <Chip key={r} label={`${r}%`} active={String(watch("riskPercent")) === r}
                          onClick={() => setValue("riskPercent", r, { shouldValidate: true })} />
                      ))}
                    </div>
                  </FF>

                  {/* Session (auto-detected) */}
                  <FF label="Session" error={errors.session} helper="Auto-detected from close time">
                    <Controller
                      name="session"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-background border-border text-sm h-10">
                            <SelectValue placeholder="Auto-detected" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {SESSIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FF>
                </>
              )}

              {/* ══ STEP 3 — Review & Notes ═══════════════ */}
              {step === 2 && (
                <>
                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-xl text-foreground">Any notes to add?</h3>
                    <p className="text-sm text-muted-foreground">Optional — you can always add these later</p>
                  </div>

                  {/* Trade summary (uses real form values) */}
                  <TradeSummaryCard
                    direction={direction}
                    pair={pair}
                    lotSize={lotsStr}
                    entryPrice={entryStr}
                    exitPrice={exitStr}
                    pnl={pnlStr}
                    session={session}
                    openedAt={openedAt}
                    closedAt={closedAt}
                  />

                  {/* Quality rating */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Setup Quality</Label>
                    <GradeStars
                      value={Number(gradeVal) || 0}
                      onChange={(v) => setValue("setupQualityRating", v)}
                    />
                    <p className="text-[10px] text-muted-foreground">How well did this setup meet your criteria?</p>
                  </div>

                  <Separator />

                  {/* Notes */}
                  <FF label="Notes" error={errors.note}>
                    <Textarea
                      {...register("note")}
                      rows={3}
                      placeholder={"What did you observe?\nWhat went well?\nWhat would you do differently?"}
                      className="bg-background border-border resize-none text-sm"
                    />
                  </FF>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Tags (optional)</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_TAGS.map((tag) => {
                        const active = (tags ?? []).includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              const current = tags ?? [];
                              setValue("tags", active
                                ? current.filter((t) => t !== tag)
                                : [...current, tag]
                              );
                            }}
                            className={cn(
                              "px-2 py-0.5 rounded-md text-xs border transition-all",
                              active
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "border-border text-muted-foreground hover:text-foreground hover:border-border/60"
                            )}
                          >
                            {active ? `✓ ${tag}` : tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-2" />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </form>

        {/* ── Navigation footer ──────────────────────────── */}
        <div className="px-5 py-4 border-t border-border flex-shrink-0 flex items-center justify-between gap-3">
          {step > 0 ? (
            <Button variant="outline" onClick={goBack} disabled={isPending} className="gap-1.5">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
          )}

          {step < STEPS.length - 1 ? (
            <Button onClick={goNext} className="gap-1.5 min-w-[120px]">
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isPending}
              className="min-w-[120px]"
            >
              {isPending ? "Adding..." : "Add Trade"}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
