import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";

import { useUpdateAccount } from "@/hooks/useAccounts";

const toNum = (v) => (v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v));

export const NormalConfigTab = ({ account }) => {
  const { mutate: updateAccount, isPending } = useUpdateAccount(account._id);
  const config = account.normalConfig ?? {};

  const { register, handleSubmit } = useForm({
    defaultValues: {
      maxRiskPerTradePercent: config.maxRiskPerTradePercent ?? "",
    },
  });

  const onSubmit = (data) => {
    updateAccount({ normalConfig: { maxRiskPerTradePercent: toNum(data.maxRiskPerTradePercent) } });
  };

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h3 className="text-sm font-semibold text-foreground font-heading">Strategy Risk Fallback</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Used only when no strategy is assigned to this account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Default risk per trade (%) — used when no strategy is assigned
          </Label>
          <div className="relative max-w-[180px]">
            <Input
              type="number"
              step="0.1"
              min="0"
              {...register("maxRiskPerTradePercent")}
              className="bg-background border-border pr-6"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              %
            </span>
          </div>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
          {isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </div>
  );
};
