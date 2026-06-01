import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Zap } from "lucide-react";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Label }   from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { accountFormSchema, transformAccountForm } from "@/app/schema/account";
import { useCreateAccount } from "@/hooks/useAccounts";
import { cn } from "@/lib/utils";

const SUBTITLES = {
  manual:     "Add a Normal account to start tracking your trades",
  prop:       "Add your prop firm challenge account",
  ea:         "Add your trading account to connect your EA",
  "semi-auto":"Add your primary trading account",
};

const defaultTypeFor = (traderType) =>
  traderType === "prop" ? "prop" : "normal";

const FF = ({ label, children, error, required }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {children}
    {error && <p className="text-xs text-destructive">{error.message}</p>}
  </div>
);

export const AccountCreationStep = ({ wizardData, onAccountCreated, onSkip }) => {
  const traderType  = wizardData.traderType ?? "manual";
  const defaultType = defaultTypeFor(traderType);
  const subtitle    = SUBTITLES[traderType] ?? SUBTITLES.manual;

  const { mutate: createAccount, isPending } = useCreateAccount();

  const {
    register, control, handleSubmit, watch,
    formState: { errors },
  } = useForm({
    resolver:      zodResolver(accountFormSchema),
    defaultValues: {
      type:         defaultType,
      platform:     "mt5",
      baseCurrency: "USD",
      tradingMode:  "live",
    },
    mode: "onTouched",
  });

  const accountType = watch("type");

  const onSubmit = (formData) => {
    const payload = transformAccountForm(formData);
    createAccount(payload, {
      onSuccess: (response) => {
        onAccountCreated(response);
      },
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-0.5">
          Create your first account
        </h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Account type (editable but pre-selected) */}
        <FF label="Account Type" required error={errors.type}>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="normal">Normal — Personal trading</SelectItem>
                  <SelectItem value="prop">Prop Firm — Funded challenge</SelectItem>
                  <SelectItem value="war">War — High risk strategy</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </FF>

        <FF label="Account Name" required error={errors.name}>
          <Input
            placeholder={
              accountType === "prop" ? "e.g. FTMO 10K Phase 1"
              : "e.g. IC Markets Main"
            }
            className="bg-background border-border"
            autoFocus
            {...register("name")}
          />
        </FF>

        <div className="grid grid-cols-2 gap-3">
          <FF label="Platform" required error={errors.platform}>
            <Controller
              name="platform"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="mt4">MT4</SelectItem>
                    <SelectItem value="mt5">MT5</SelectItem>
                    <SelectItem value="ctrader">cTrader</SelectItem>
                    <SelectItem value="tradingview">TradingView</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FF>
          <FF label="Base Currency" required error={errors.baseCurrency}>
            <Controller
              name="baseCurrency"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {["USD","EUR","GBP","JPY","AUD","CHF","CAD","NZD"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FF>
        </div>

        <FF label="Starting Balance" required error={errors.startingBalance}>
          <Input
            type="number" step="0.01" min="0"
            placeholder="10000"
            className="bg-background border-border font-mono"
            {...register("startingBalance")}
          />
        </FF>

        {/* Broker — normal/war only */}
        {accountType !== "prop" && (
          <FF label="Broker" error={errors.broker}>
            <Input
              placeholder="e.g. IC Markets"
              className="bg-background border-border"
              {...register("broker")}
            />
          </FF>
        )}

        {/* Prop-specific */}
        {accountType === "prop" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FF label="Prop Firm Name" error={errors.propFirm}>
                <Input
                  placeholder="e.g. FTMO"
                  className="bg-background border-border"
                  {...register("propFirm")}
                />
              </FF>
              <FF label="Account Size" error={errors.accountSize}>
                <Input
                  type="number" placeholder="10000"
                  className="bg-background border-border font-mono"
                  {...register("accountSize")}
                />
              </FF>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FF label="Profit Target %" error={errors.profitTargetPercent}>
                <Input
                  type="number" step="0.1" placeholder="10"
                  className="bg-background border-border font-mono"
                  {...register("profitTargetPercent")}
                />
              </FF>
              <FF label="Max Drawdown %" error={errors.maxDrawdownPercent}>
                <Input
                  type="number" step="0.1" placeholder="10"
                  className="bg-background border-border font-mono"
                  {...register("maxDrawdownPercent")}
                />
              </FF>
            </div>
            <FF label="Challenge Fee ($)" error={errors.challengeFee}>
              <Input
                type="number" step="0.01" placeholder="155"
                className="bg-background border-border font-mono"
                {...register("challengeFee")}
              />
            </FF>
          </div>
        )}

        {/* EA sync hint */}
        {(traderType === "ea" || traderType === "semi-auto") && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <Zap className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              After creating your account, you'll be able to connect your MT4/MT5 EA from <strong className="text-foreground">Account Settings → EA Sync</strong>.
            </p>
          </div>
        )}

        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Creating account..." : "Create Account & Finish"}
        </Button>
      </form>

      {/* Skip link */}
      <button
        type="button"
        onClick={onSkip}
        className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
      >
        I'll add my account later →
      </button>
    </div>
  );
};
