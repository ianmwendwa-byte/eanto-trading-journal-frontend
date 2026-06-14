import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";

import { useUpdateAccount } from "@/hooks/useAccounts";

const goalsSchema = z.object({
  monthlyReturnTarget: z.coerce.number().optional().nullable(),
  weeklyReturnTarget:  z.coerce.number().optional().nullable(),
  targetWinRate:       z.coerce.number().optional().nullable(),
});

const toNum = (v) => (v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v));

const FF = ({ label, children, error }) => (
  <div className="space-y-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    {children}
    {error && <p className="text-xs text-destructive">{error.message}</p>}
  </div>
);

const SuffixInput = ({ name, suffix, placeholder, register }) => (
  <div className="relative">
    <Input
      type="number"
      step="0.1"
      min="0"
      {...register(name)}
      placeholder={placeholder}
      className="bg-background border-border pr-6"
    />
    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
      {suffix}
    </span>
  </div>
);

export const GoalsTab = ({ account }) => {
  const { mutate: updateAccount, isPending } = useUpdateAccount(account._id);
  const goals = account.goals ?? {};

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      monthlyReturnTarget: goals.monthlyReturnTarget ?? "",
      weeklyReturnTarget:  goals.weeklyReturnTarget  ?? "",
      targetWinRate:       goals.targetWinRate       ?? "",
    },
  });

  const onSubmit = (data) => {
    updateAccount({
      goals: {
        monthlyReturnTarget: toNum(data.monthlyReturnTarget),
        weeklyReturnTarget:  toNum(data.weeklyReturnTarget),
        targetWinRate:       toNum(data.targetWinRate),
      },
    });
  };

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h3 className="text-sm font-semibold text-foreground font-heading">Goals</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Aspirational targets — these do not trigger compliance alerts.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="trading-card p-4 space-y-4">
          <FF label="Monthly Return Target" error={errors.monthlyReturnTarget}>
            <SuffixInput name="monthlyReturnTarget" suffix="%" placeholder="e.g. 5" register={register} />
          </FF>
          <FF label="Weekly Return Target" error={errors.weeklyReturnTarget}>
            <SuffixInput name="weeklyReturnTarget" suffix="%" placeholder="e.g. 1.5" register={register} />
          </FF>
          <FF label="Target Win Rate" error={errors.targetWinRate}>
            <SuffixInput name="targetWinRate" suffix="%" placeholder="e.g. 55" register={register} />
          </FF>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
          {isPending ? "Saving..." : "Save Goals"}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground border-t border-border pt-4">
        Risk and reward targets are now managed per Strategy.{" "}
        <Link
          to={`/accounts/${account._id}?tab=strategy`}
          className="inline-flex items-center gap-0.5 text-primary hover:underline"
        >
          Go to Strategy tab <ArrowRight className="h-3 w-3" />
        </Link>
      </p>
    </div>
  );
};
