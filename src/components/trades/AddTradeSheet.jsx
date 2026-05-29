import { useMemo, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, X } from "lucide-react";
import { format } from "date-fns";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { GradeStars } from "./GradeStars";
import { useCreateTrade }  from "@/hooks/useTrades";
import { useAccounts }     from "@/hooks/useAccounts";
import { tradeFormSchema, transformTradeForm } from "@/app/schema/trade";
import { formatPnL, getPnLColor } from "@/utils/format";
import { detectSession } from "@/utils/calendar";
import { cn } from "@/lib/utils";

const COMMON_PAIRS = [
  "EURUSD","GBPUSD","USDJPY","AUDUSD","USDCAD",
  "USDCHF","NZDUSD","EURGBP","GBPJPY","EURJPY",
  "XAUUSD","XAGUSD",
];

const SESSIONS = [
  { value: "london",   label: "London"   },
  { value: "new_york", label: "New York" },
  { value: "tokyo",    label: "Asian"    },
  { value: "sydney",   label: "Sydney"   },
  { value: "overlap",  label: "Overlap"  },
  { value: "custom",   label: "Custom"   },
];

const localNow = () => format(new Date(), "yyyy-MM-dd'T'HH:mm");

const SectionHeader = ({ children }) => (
  <div className="flex items-center gap-3 py-1">
    <Separator className="flex-1" />
    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium whitespace-nowrap">
      {children}
    </span>
    <Separator className="flex-1" />
  </div>
);

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

export const AddTradeSheet = ({ isOpen, onClose, defaultAccountId }) => {
  const { mutate: createTrade, isPending } = useCreateTrade();
  const { data: accountsData } = useAccounts({ limit: 50 });
  const accounts = accountsData?.accounts ?? [];

  const {
    register, control, handleSubmit, watch, setValue,
    reset, formState: { errors },
  } = useForm({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      accountId:   defaultAccountId ?? "",
      pair:        "",
      direction:   null,
      entryPrice:  "",
      exitPrice:   "",
      lotSize:     "",
      stopLoss:    "",
      takeProfit:  "",
      openedAt:    localNow(),
      closedAt:    localNow(),
      session:     "",
      commission:  "",
      swap:        "",
      riskPercent: "",
      ticketNumber: "",
      magicNumber: "",
      note:        "",
      tags:        [],
      setupQualityRating: "",
    },
  });

  const [direction, entryStr, exitStr, lotsStr, slStr, tpStr, closedAt, gradeVal] = watch([
    "direction", "entryPrice", "exitPrice", "lotSize",
    "stopLoss", "takeProfit", "closedAt", "setupQualityRating",
  ]);

  // Auto-detect session from closedAt
  useEffect(() => {
    const detected = detectSession(closedAt);
    if (detected) setValue("session", detected, { shouldValidate: false });
  }, [closedAt, setValue]);

  // Live P&L calculation
  const estimatedPnl = useMemo(() => {
    const entry = parseFloat(entryStr);
    const exit  = parseFloat(exitStr);
    const lots  = parseFloat(lotsStr);
    if (isNaN(entry) || isNaN(exit) || isNaN(lots) || !direction) return null;
    const diff = direction === "buy" ? exit - entry : entry - exit;
    return diff * lots * 100000;
  }, [direction, entryStr, exitStr, lotsStr]);

  // Live RR calculation
  const estimatedRR = useMemo(() => {
    const entry = parseFloat(entryStr);
    const sl    = parseFloat(slStr);
    const tp    = parseFloat(tpStr);
    if (isNaN(entry) || isNaN(sl) || isNaN(tp) || !direction) return null;
    const risk   = direction === "buy" ? entry - sl : sl - entry;
    const reward = direction === "buy" ? tp - entry : entry - tp;
    return risk > 0 ? reward / risk : null;
  }, [direction, entryStr, slStr, tpStr]);

  const onSubmit = (data) => {
    const pnl = estimatedPnl ?? 0;
    const payload = transformTradeForm(data, pnl);
    createTrade(payload, {
      onSuccess: () => {
        reset();
        onClose?.();
      },
    });
  };

  const handleClose = () => {
    reset();
    onClose?.();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[540px] bg-card border-l border-border p-0 flex flex-col"
      >
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-heading text-base font-semibold">Add Trade</SheetTitle>
            <button
              onClick={handleClose}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto"
          noValidate
        >
          <div className="px-5 py-4 space-y-4">
            <SectionHeader>Trade Identity</SectionHeader>

            {/* Account */}
            <FF label="Account" required error={errors.accountId}>
              <Controller
                name="accountId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select account" />
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

            {/* Pair */}
            <FF label="Currency Pair" required error={errors.pair}>
              <Input
                {...register("pair")}
                placeholder="EURUSD"
                className="bg-background border-border font-mono uppercase"
                onBlur={(e) => setValue("pair", e.target.value.toUpperCase())}
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {COMMON_PAIRS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setValue("pair", p, { shouldValidate: true })}
                    className="px-2 py-0.5 rounded text-[10px] font-mono border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </FF>

            {/* Direction */}
            <FF label="Direction" required error={errors.direction}>
              <Controller
                name="direction"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "buy",  label: "▲ BUY"  },
                      { value: "sell", label: "▼ SELL" },
                    ].map(({ value: v, label }) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => field.onChange(v)}
                        className={cn(
                          "py-3 rounded-lg border-2 font-mono font-semibold text-sm transition-all",
                          field.value === v
                            ? v === "buy"
                              ? "bg-[hsl(var(--profit)/0.15)] border-[hsl(var(--profit))] text-[hsl(var(--profit))]"
                              : "bg-[hsl(var(--loss)/0.15)] border-[hsl(var(--loss))] text-[hsl(var(--loss))]"
                            : "border-border text-muted-foreground hover:border-border/60 hover:text-foreground"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </FF>

            <SectionHeader>Execution</SectionHeader>

            <div className="grid grid-cols-2 gap-3">
              <FF label="Entry Price" required error={errors.entryPrice}>
                <Input
                  {...register("entryPrice")}
                  type="number"
                  step="any"
                  placeholder="1.08542"
                  className="bg-background border-border font-mono"
                />
              </FF>
              <FF label="Exit Price" required error={errors.exitPrice}>
                <Input
                  {...register("exitPrice")}
                  type="number"
                  step="any"
                  placeholder="1.09012"
                  className="bg-background border-border font-mono"
                />
              </FF>
            </div>

            {/* Live P&L Preview */}
            {estimatedPnl !== null && (
              <div className={cn(
                "px-3 py-2.5 rounded-lg border text-sm font-mono font-semibold text-center",
                estimatedPnl >= 0
                  ? "bg-[hsl(var(--profit)/0.08)] border-[hsl(var(--profit)/0.25)] text-[hsl(var(--profit))]"
                  : "bg-[hsl(var(--loss)/0.08)] border-[hsl(var(--loss)/0.25)] text-[hsl(var(--loss))]"
              )}>
                Estimated P&L: {formatPnL(estimatedPnl)}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <FF label="Lot Size" required error={errors.lotSize}>
                <Input
                  {...register("lotSize")}
                  type="number"
                  step="any"
                  placeholder="0.10"
                  className="bg-background border-border font-mono"
                />
              </FF>
              <FF label="Stop Loss" error={errors.stopLoss}>
                <Input
                  {...register("stopLoss")}
                  type="number"
                  step="any"
                  placeholder="1.08200"
                  className="bg-background border-border font-mono"
                />
              </FF>
              <FF label="Take Profit" error={errors.takeProfit}>
                <Input
                  {...register("takeProfit")}
                  type="number"
                  step="any"
                  placeholder="1.09500"
                  className="bg-background border-border font-mono"
                />
              </FF>
            </div>

            {/* Live RR Preview */}
            {estimatedRR !== null && (
              <div className="px-3 py-2 rounded-lg border border-border bg-muted/30 text-xs text-center font-mono text-muted-foreground">
                Planned RR: 1:{estimatedRR.toFixed(2)}
              </div>
            )}

            <SectionHeader>Timing</SectionHeader>

            <div className="grid grid-cols-2 gap-3">
              <FF label="Opened At" required error={errors.openedAt}>
                <Input
                  {...register("openedAt")}
                  type="datetime-local"
                  className="bg-background border-border text-sm"
                />
              </FF>
              <FF label="Closed At" required error={errors.closedAt}>
                <Input
                  {...register("closedAt")}
                  type="datetime-local"
                  className="bg-background border-border text-sm"
                />
              </FF>
            </div>

            <FF label="Session" error={errors.session}>
              <Controller
                name="session"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background border-border text-sm">
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

            <SectionHeader>Costs</SectionHeader>

            <div className="grid grid-cols-2 gap-3">
              <FF label="Commission" error={errors.commission}>
                <Input
                  {...register("commission")}
                  type="number"
                  step="any"
                  placeholder="3.50"
                  className="bg-background border-border font-mono"
                />
              </FF>
              <FF label="Swap" error={errors.swap}>
                <Input
                  {...register("swap")}
                  type="number"
                  step="any"
                  placeholder="0.00"
                  className="bg-background border-border font-mono"
                />
              </FF>
            </div>

            <SectionHeader>Risk</SectionHeader>

            <div className="grid grid-cols-2 gap-3">
              <FF label="Risk %" error={errors.riskPercent} helper="% of account balance risked">
                <Input
                  {...register("riskPercent")}
                  type="number"
                  step="any"
                  placeholder="1.5"
                  className="bg-background border-border font-mono"
                />
              </FF>
              <FF label="Ticket Number" error={errors.ticketNumber} helper="MT4/MT5 ticket">
                <Input
                  {...register("ticketNumber")}
                  placeholder="12345678"
                  className="bg-background border-border font-mono"
                />
              </FF>
            </div>

            {/* Journal section (collapsed) */}
            <SectionHeader>Journal (Optional)</SectionHeader>

            {/* Grade */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Grade</Label>
              <GradeStars
                value={Number(gradeVal) || 0}
                onChange={(v) => setValue("setupQualityRating", v)}
              />
            </div>

            {/* Notes */}
            <FF label="Notes" error={errors.note}>
              <Textarea
                {...register("note")}
                rows={3}
                placeholder="Observations, entry rationale, lessons learned..."
                className="bg-background border-border resize-none text-sm"
              />
            </FF>

            {/* Padding so content isn't obscured by sticky footer */}
            <div className="h-4" />
          </div>
        </form>

        {/* Sticky footer */}
        <div className="px-5 py-4 border-t border-border flex-shrink-0 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="min-w-[120px]"
          >
            {isPending ? "Adding trade..." : "Add Trade"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
