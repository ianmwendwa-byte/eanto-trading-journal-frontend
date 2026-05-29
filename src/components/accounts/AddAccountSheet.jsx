import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Trophy, Swords, Check, AlertCircle, Loader2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox }  from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge }     from "@/components/ui/badge";
import { cn }        from "@/lib/utils";
import { useCreateAccount } from "@/hooks/useAccounts";
import { accountFormSchema, transformAccountForm } from "@/app/schema/account";

// ── Constants ─────────────────────────────────────────────────
const CURRENCIES      = ["USD","EUR","GBP","JPY","AUD","CHF","CAD","NZD"];
const CURRENCY_SYMBOL = { USD:"$", EUR:"€", GBP:"£", JPY:"¥", AUD:"A$", CHF:"Fr", CAD:"C$", NZD:"NZ$" };

const TYPE_OPTIONS = [
  {
    value:       "normal",
    icon:        TrendingUp,
    label:       "Normal",
    description: "Personal trading account for live or demo trading",
    features:    ["Live or demo trading modes", "Full performance analytics", "Custom risk rules"],
    color:       "text-[hsl(var(--profit))]",
    bg:          "bg-[hsl(var(--profit)/0.1)]",
    border:      "border-[hsl(var(--profit)/0.3)]",
    dotBg:       "bg-[hsl(var(--profit))]",
    badge:       "bg-[hsl(var(--profit)/0.1)] text-[hsl(var(--profit))] border-[hsl(var(--profit)/0.2)]",
  },
  {
    value:       "prop",
    icon:        Trophy,
    label:       "Prop Firm",
    description: "Funded account or challenge with strict risk rules",
    features:    ["Automated drawdown tracking", "Challenge progress bars", "Payout management"],
    color:       "text-blue-400",
    bg:          "bg-blue-500/10",
    border:      "border-blue-500/30",
    dotBg:       "bg-blue-400",
    badge:       "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    value:       "war",
    icon:        Swords,
    label:       "War",
    description: "High-risk account for aggressive strategies",
    features:    ["Isolated from main metrics", "Purpose-driven goals", "Unrestricted risk modes"],
    color:       "text-[hsl(var(--loss))]",
    bg:          "bg-[hsl(var(--loss)/0.1)]",
    border:      "border-[hsl(var(--loss)/0.3)]",
    dotBg:       "bg-[hsl(var(--loss))]",
    badge:       "bg-[hsl(var(--loss)/0.1)] text-[hsl(var(--loss))] border-[hsl(var(--loss)/0.2)]",
  },
];

const STEPS = [
  { id: 1, label: "Account Type" },
  { id: 2, label: "Details" },
  { id: 3, label: "Review" },
];

// ── Step indicator ────────────────────────────────────────────
const StepIndicator = ({ currentStep }) => {
  const items = [];
  STEPS.forEach((step, idx) => {
    items.push(
      <div key={`s-${step.id}`} className="flex flex-col items-center gap-1.5">
        <div className={cn(
          "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200",
          currentStep > step.id
            ? "bg-primary border-primary text-primary-foreground"
            : currentStep === step.id
            ? "bg-primary/10 border-primary text-primary"
            : "bg-background border-border text-muted-foreground"
        )}>
          {currentStep > step.id ? <Check className="h-3.5 w-3.5" /> : step.id}
        </div>
        <span className={cn(
          "text-[10px] font-medium whitespace-nowrap",
          currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
        )}>
          {step.label}
        </span>
      </div>
    );
    if (idx < STEPS.length - 1) {
      items.push(
        <div
          key={`l-${idx}`}
          className={cn(
            "flex-1 h-0.5 mb-4 mx-2 transition-all duration-300",
            currentStep > step.id ? "bg-primary" : "bg-border"
          )}
        />
      );
    }
  });

  return (
    <div className="mt-4 flex items-center">
      {items}
    </div>
  );
};

// ── Field error ───────────────────────────────────────────────
const FieldError = ({ error }) =>
  error ? (
    <p className="flex items-center gap-1 text-xs text-destructive mt-1">
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      {error.message}
    </p>
  ) : null;

// ── Form field wrapper ────────────────────────────────────────
const FormField = ({ label, children, error, required }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {children}
    <FieldError error={error} />
  </div>
);

// ── Section divider ───────────────────────────────────────────
const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-3 py-1">
    <div className="flex-1 h-px bg-border" />
    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
      {title}
    </span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

// ── Review row ────────────────────────────────────────────────
const ReviewRow = ({ label, value }) => (
  value ? (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right max-w-[55%] truncate">{value}</span>
    </div>
  ) : null
);

// ── Step transition variants ──────────────────────────────────
const stepVariants = {
  initial: (dir) => ({ opacity: 0, x: dir > 0 ? 36 : -36 }),
  animate: { opacity: 1, x: 0, transition: { duration: 0.22, ease: "easeOut" } },
  exit:    (dir) => ({ opacity: 0, x: dir > 0 ? -36 : 36, transition: { duration: 0.18, ease: "easeIn" } }),
};

// ── Main component ────────────────────────────────────────────
export const AddAccountSheet = ({ open, onOpenChange, defaultType }) => {
  const [step,      setStep]      = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const directionRef              = useRef(1);

  const { mutate: createAccount, isPending } = useCreateAccount();

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    resolver:      zodResolver(accountFormSchema),
    defaultValues: {
      type:         defaultType ?? "normal",
      platform:     "mt5",
      baseCurrency: "USD",
      tradingMode:  "live",
    },
    mode: "onTouched",
  });

  const accountType   = watch("type");
  const baseCurrency  = watch("baseCurrency");
  const currSymbol    = CURRENCY_SYMBOL[baseCurrency] ?? "$";
  const typeOption    = TYPE_OPTIONS.find((t) => t.value === accountType);

  useEffect(() => {
    if (!open) {
      reset({
        type:         defaultType ?? "normal",
        platform:     "mt5",
        baseCurrency: "USD",
        tradingMode:  "live",
      });
      setStep(1);
      setConfirmed(false);
      directionRef.current = 1;
    }
  }, [open, reset, defaultType]);

  const goTo = (nextStep) => {
    directionRef.current = nextStep > step ? 1 : -1;
    setStep(nextStep);
  };

  const handleNext = async () => {
    if (step === 1) {
      goTo(2);
      return;
    }
    if (step === 2) {
      const valid = await trigger(["name", "platform", "baseCurrency", "startingBalance"]);
      if (valid) goTo(3);
    }
  };

  const onSubmit = (formData) => {
    const payload = transformAccountForm(formData);
    createAccount(payload, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const fv = getValues();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-140 p-0 flex flex-col bg-card border-border"
      >
        {/* ── Fixed header ──────────────────────────── */}
        <div className="px-6 pt-5 pb-4 border-b border-border shrink-0">
          <SheetHeader className="space-y-0.5">
            <SheetTitle className="text-lg font-heading">Add Trading Account</SheetTitle>
            <SheetDescription className="text-sm">
              {step === 1 && "Choose the type of account you want to add"}
              {step === 2 && "Fill in your account details"}
              {step === 3 && "Review everything before creating"}
            </SheetDescription>
          </SheetHeader>
          <StepIndicator currentStep={step} />
        </div>

        {/* ── Scrollable body ────────────────────────── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait" custom={directionRef.current}>
            <motion.div
              key={step}
              custom={directionRef.current}
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="p-6"
            >

              {/* ── Step 1: Type Selection ──────────────── */}
              {step === 1 && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground mb-4">
                    Select the account type that best matches your trading setup.
                  </p>
                  {TYPE_OPTIONS.map((option) => {
                    const Icon       = option.icon;
                    const isSelected = accountType === option.value;
                    return (
                      <Controller
                        key={option.value}
                        name="type"
                        control={control}
                        render={({ field }) => (
                          <button
                            type="button"
                            onClick={() => field.onChange(option.value)}
                            className={cn(
                              "w-full text-left rounded-xl border-2 p-4 transition-all duration-200 focus-visible:outline-none",
                              isSelected
                                ? cn(option.bg, option.border)
                                : "bg-background/50 border-border hover:border-border/80 hover:bg-muted/20"
                            )}
                          >
                            <div className="flex items-start gap-4">
                              {/* Icon box */}
                              <div className={cn(
                                "rounded-lg p-2.5 mt-0.5 border flex-shrink-0",
                                isSelected ? cn(option.bg, option.border) : "bg-muted/50 border-border"
                              )}>
                                <Icon className={cn("h-5 w-5", isSelected ? option.color : "text-muted-foreground")} />
                              </div>

                              {/* Text content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className={cn(
                                    "font-semibold text-sm",
                                    isSelected ? "text-foreground" : "text-foreground"
                                  )}>
                                    {option.label}
                                  </span>
                                  {isSelected && (
                                    <div className={cn(
                                      "h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0",
                                      option.bg, "border", option.border
                                    )}>
                                      <Check className={cn("h-3 w-3", option.color)} />
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mb-2.5">
                                  {option.description}
                                </p>
                                <ul className="space-y-1">
                                  {option.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", option.dotBg)} />
                                      {f}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </button>
                        )}
                      />
                    );
                  })}
                </div>
              )}

              {/* ── Step 2: Details ─────────────────────── */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* Account Info */}
                  <SectionHeader title="Account Info" />

                  <FormField label="Account Name" required error={errors.name}>
                    <Input
                      placeholder={
                        accountType === "prop" ? "e.g. FTMO 10K Phase 1"
                        : accountType === "war" ? "e.g. War Account #1"
                        : "e.g. IC Markets Main"
                      }
                      className="bg-background border-border"
                      autoFocus
                      {...register("name")}
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Platform" required error={errors.platform}>
                      <Controller
                        name="platform"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="bg-background border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              {[
                                { value: "mt4",        label: "MT4" },
                                { value: "mt5",        label: "MT5" },
                                { value: "ctrader",    label: "cTrader" },
                                { value: "tradingview",label: "TradingView" },
                                { value: "manual",     label: "Manual / Other" },
                              ].map((p) => (
                                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormField>

                    {accountType === "normal" && (
                      <FormField label="Trading Mode" error={errors.tradingMode}>
                        <Controller
                          name="tradingMode"
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-border">
                                <SelectItem value="live">Live</SelectItem>
                                <SelectItem value="demo">Demo</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </FormField>
                    )}
                  </div>

                  {/* Financial */}
                  <SectionHeader title="Financial" />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Base Currency" required error={errors.baseCurrency}>
                      <Controller
                        name="baseCurrency"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="bg-background border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              {CURRENCIES.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormField>

                    <FormField label="Starting Balance" required error={errors.startingBalance}>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono pointer-events-none select-none">
                          {currSymbol}
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="10000"
                          className="pl-8 bg-background border-border font-mono"
                          {...register("startingBalance")}
                        />
                      </div>
                    </FormField>
                  </div>

                  {/* ── Normal / War sections ─── */}
                  {accountType !== "prop" && (
                    <>
                      <SectionHeader title={accountType === "war" ? "War Configuration" : "Broker & Rules"} />

                      <FormField label="Broker" error={errors.broker}>
                        <Input
                          placeholder="e.g. IC Markets"
                          className="bg-background border-border"
                          {...register("broker")}
                        />
                      </FormField>
                    </>
                  )}

                  {accountType === "normal" && (
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Max Risk (%)" error={errors.maxRiskPercent}>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          placeholder="2"
                          className="bg-background border-border font-mono"
                          {...register("maxRiskPercent")}
                        />
                      </FormField>
                      <FormField label="Max Trades / Day" error={errors.maxDailyTrades}>
                        <Input
                          type="number"
                          min="0"
                          placeholder="5"
                          className="bg-background border-border font-mono"
                          {...register("maxDailyTrades")}
                        />
                      </FormField>
                    </div>
                  )}

                  {accountType === "war" && (
                    <>
                      <FormField label="Max Risk (%)" error={errors.maxRiskPercent}>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          placeholder="10"
                          className="bg-background border-border font-mono"
                          {...register("maxRiskPercent")}
                        />
                      </FormField>
                      <FormField label="Purpose / Goal" error={errors.purpose}>
                        <Textarea
                          placeholder="Describe the purpose of this war account..."
                          className="bg-background border-border resize-none"
                          rows={3}
                          {...register("purpose")}
                        />
                      </FormField>
                    </>
                  )}

                  {/* ── Prop sections ─────────── */}
                  {accountType === "prop" && (
                    <>
                      <SectionHeader title="Prop Firm" />

                      <div className="grid grid-cols-2 gap-3">
                        <FormField label="Firm Name" error={errors.propFirm}>
                          <Input
                            placeholder="e.g. FTMO"
                            className="bg-background border-border"
                            {...register("propFirm")}
                          />
                        </FormField>
                        <FormField label="Program Type" error={errors.programType}>
                          <Controller
                            name="programType"
                            control={control}
                            render={({ field }) => (
                              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                                <SelectTrigger className="bg-background border-border">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                  <SelectItem value="1_step">1-Step</SelectItem>
                                  <SelectItem value="2_step">2-Step</SelectItem>
                                  <SelectItem value="3_step">3-Step</SelectItem>
                                  <SelectItem value="instant">Instant Funded</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </FormField>
                      </div>

                      <FormField label="Account Size ($)" error={errors.accountSize}>
                        <Input
                          type="number"
                          placeholder="10000"
                          className="bg-background border-border font-mono"
                          {...register("accountSize")}
                        />
                      </FormField>

                      <SectionHeader title="Risk Rules" />

                      <div className="grid grid-cols-2 gap-3">
                        <FormField label="Profit Target (%)" error={errors.profitTargetPercent}>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="10"
                            className="bg-background border-border font-mono"
                            {...register("profitTargetPercent")}
                          />
                        </FormField>
                        <FormField label="Max Drawdown (%)" error={errors.maxDrawdownPercent}>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="10"
                            className="bg-background border-border font-mono"
                            {...register("maxDrawdownPercent")}
                          />
                        </FormField>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <FormField label="Daily Drawdown (%)" error={errors.dailyDrawdownPercent}>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="5"
                            className="bg-background border-border font-mono"
                            {...register("dailyDrawdownPercent")}
                          />
                        </FormField>
                        <FormField label="Min Trading Days" error={errors.minTradingDays}>
                          <Input
                            type="number"
                            placeholder="4"
                            className="bg-background border-border font-mono"
                            {...register("minTradingDays")}
                          />
                        </FormField>
                      </div>

                      <FormField label="Challenge Fee ($)" error={errors.challengeFee}>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="155"
                          className="bg-background border-border font-mono"
                          {...register("challengeFee")}
                        />
                      </FormField>
                    </>
                  )}

                  {/* Notes (normal + war) */}
                  {accountType !== "prop" && (
                    <FormField label="Notes" error={errors.notes}>
                      <Textarea
                        placeholder="Optional notes..."
                        className="bg-background border-border resize-none"
                        rows={2}
                        {...register("notes")}
                      />
                    </FormField>
                  )}
                </div>
              )}

              {/* ── Step 3: Review ──────────────────────── */}
              {step === 3 && (
                <div className="space-y-5">
                  {/* Summary card */}
                  <div className="rounded-xl border border-border bg-background/50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                      <span className="font-semibold text-foreground truncate mr-3">
                        {fv.name || "Unnamed Account"}
                      </span>
                      {typeOption && (
                        <Badge variant="outline" className={cn("text-xs shrink-0", typeOption.badge)}>
                          {fv.type?.toUpperCase()}
                        </Badge>
                      )}
                    </div>

                    {/* Rows */}
                    <div className="px-4 py-2 divide-y divide-border/50">
                      <ReviewRow
                        label="Platform"
                        value={fv.platform
                          ? { mt4: "MT4", mt5: "MT5", ctrader: "cTrader", tradingview: "TradingView", manual: "Manual / Other" }[fv.platform] ?? fv.platform
                          : null}
                      />
                      <ReviewRow
                        label="Starting Balance"
                        value={fv.startingBalance
                          ? `${currSymbol}${Number(fv.startingBalance).toLocaleString()} ${fv.baseCurrency}`
                          : null}
                      />

                      {accountType === "normal" && (
                        <>
                          <ReviewRow label="Broker" value={fv.broker} />
                          <ReviewRow
                            label="Trading Mode"
                            value={fv.tradingMode
                              ? fv.tradingMode.charAt(0).toUpperCase() + fv.tradingMode.slice(1)
                              : null}
                          />
                          <ReviewRow label="Max Risk" value={fv.maxRiskPercent ? `${fv.maxRiskPercent}%` : null} />
                          <ReviewRow label="Max Daily Trades" value={fv.maxDailyTrades ? String(fv.maxDailyTrades) : null} />
                        </>
                      )}

                      {accountType === "prop" && (
                        <>
                          <ReviewRow label="Prop Firm" value={fv.propFirm} />
                          <ReviewRow
                            label="Program Type"
                            value={fv.programType
                              ? { "1_step": "1-Step", "2_step": "2-Step", "3_step": "3-Step", instant: "Instant Funded" }[fv.programType]
                              : null}
                          />
                          <ReviewRow label="Account Size" value={fv.accountSize ? `$${Number(fv.accountSize).toLocaleString()}` : null} />
                          <ReviewRow label="Profit Target" value={fv.profitTargetPercent ? `${fv.profitTargetPercent}%` : null} />
                          <ReviewRow label="Max Drawdown" value={fv.maxDrawdownPercent ? `${fv.maxDrawdownPercent}%` : null} />
                          <ReviewRow label="Daily Drawdown" value={fv.dailyDrawdownPercent ? `${fv.dailyDrawdownPercent}%` : null} />
                          <ReviewRow label="Min Trading Days" value={fv.minTradingDays ? String(fv.minTradingDays) : null} />
                          <ReviewRow label="Challenge Fee" value={fv.challengeFee ? `$${fv.challengeFee}` : null} />
                        </>
                      )}

                      {accountType === "war" && (
                        <>
                          <ReviewRow label="Broker" value={fv.broker} />
                          <ReviewRow label="Max Risk" value={fv.maxRiskPercent ? `${fv.maxRiskPercent}%` : null} />
                          <ReviewRow label="Purpose" value={fv.purpose} />
                        </>
                      )}

                      {fv.notes && (
                        <ReviewRow label="Notes" value={fv.notes} />
                      )}
                    </div>
                  </div>

                  {/* Confirmation checkbox */}
                  <button
                    type="button"
                    onClick={() => setConfirmed((v) => !v)}
                    className={cn(
                      "w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200",
                      confirmed
                        ? "bg-[hsl(var(--profit)/0.05)] border-[hsl(var(--profit)/0.35)]"
                        : "bg-muted/20 border-border hover:border-border/80"
                    )}
                  >
                    <Checkbox
                      id="confirm"
                      checked={confirmed}
                      onCheckedChange={setConfirmed}
                      className="mt-0.5 pointer-events-none"
                    />
                    <Label
                      htmlFor="confirm"
                      className="text-sm text-muted-foreground cursor-pointer leading-relaxed pointer-events-none"
                    >
                      I confirm that the account details above are correct and I am ready to create this account.
                    </Label>
                  </button>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Fixed footer ────────────────────────────── */}
        <div className="px-6 py-4 border-t border-border shrink-0">
          <div className="flex gap-2">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  directionRef.current = -1;
                  setStep((s) => s - 1);
                }}
                disabled={isPending}
              >
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            )}

            {step < 3 ? (
              <Button
                type="button"
                className="flex-1"
                onClick={handleNext}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                className="flex-1"
                disabled={!confirmed || isPending}
                onClick={handleSubmit(onSubmit)}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Creating..." : "Create Account"}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
