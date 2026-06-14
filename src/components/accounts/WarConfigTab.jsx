import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Loader2, Lock } from "lucide-react";

import { Button }   from "@/components/ui/button";
import { Label }    from "@/components/ui/label";
import { Switch }   from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter,
} from "@/components/ui/alert-dialog";

import { useUpdateAccount } from "@/hooks/useAccounts";
import { useGraduateAccount } from "@/hooks/useAccountRules";
import { cn } from "@/lib/utils";

const GRADUATION_CFG = {
  none:      { label: "Not Graduated",      cls: "bg-muted text-muted-foreground border-border"                             },
  pending:   { label: "Graduation Pending", cls: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20"  },
  graduated: { label: "Graduated",          cls: "bg-[var(--profit)]/10 text-[var(--profit)] border-[var(--profit)]/20"     },
};

export const WarConfigTab = ({ account }) => {
  const [graduateOpen, setGraduateOpen] = useState(false);
  const { mutate: updateAccount, isPending } = useUpdateAccount(account._id);
  const { mutate: graduate,      isPending: graduating } = useGraduateAccount(account._id);

  const warConfig        = account.warConfig ?? {};
  const graduationStatus = warConfig.graduationStatus ?? "none";
  const isGraduated      = graduationStatus === "graduated";
  const statusCfg        = GRADUATION_CFG[graduationStatus] ?? GRADUATION_CFG.none;

  const { control, handleSubmit } = useForm({
    defaultValues: {
      allowNewsTrading: warConfig.allowNewsTrading ?? false,
      allowFullMargin:  warConfig.allowFullMargin  ?? false,
    },
  });

  const onSubmit = (data) => updateAccount({ warConfig: data });

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h3 className="text-sm font-semibold text-foreground font-heading">War Mode Configuration</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          High-risk experimental trading settings.
        </p>
      </div>

      {isGraduated && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--profit)]/5 border border-[var(--profit)]/20">
          <Lock className="h-4 w-4 text-[var(--profit)] flex-shrink-0" />
          <p className="text-xs text-[var(--profit)]">
            This account has graduated. Configuration is locked.
          </p>
        </div>
      )}

      {/* Graduation status */}
      <div className="trading-card p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Graduation Status</p>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded border", statusCfg.cls)}>
            {statusCfg.label}
          </span>
        </div>
        {warConfig.graduatedAt && (
          <p className="text-xs text-muted-foreground">
            Graduated:{" "}
            {new Date(warConfig.graduatedAt).toLocaleDateString("en-US", {
              year: "numeric", month: "short", day: "numeric",
            })}
          </p>
        )}
        {warConfig.graduatedToAccountId && (
          <p className="text-xs text-muted-foreground">
            Linked account ID: {warConfig.graduatedToAccountId}
          </p>
        )}
      </div>

      {/* Config form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <fieldset disabled={isGraduated} className="space-y-4">
          <div className="trading-card p-4 flex items-center justify-between">
            <div>
              <Label className="text-sm">Allow News Trading</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Trade during high-impact news windows
              </p>
            </div>
            <Controller
              name="allowNewsTrading"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isGraduated} />
              )}
            />
          </div>

          <div className="trading-card p-4 flex items-center justify-between">
            <div>
              <Label className="text-sm">Allow Full Margin</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Enable full margin utilization</p>
            </div>
            <Controller
              name="allowFullMargin"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isGraduated} />
              )}
            />
          </div>

        </fieldset>

        {!isGraduated && (
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </form>

      {graduationStatus === "none" && (
        <div className="pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={() => setGraduateOpen(true)}>
            Start Graduation
          </Button>
        </div>
      )}

      <AlertDialog open={graduateOpen} onOpenChange={setGraduateOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Start Graduation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will begin the graduation process for this war account. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setGraduateOpen(false)}>Cancel</Button>
            <Button
              onClick={() => graduate(undefined, { onSuccess: () => setGraduateOpen(false) })}
              disabled={graduating}
            >
              {graduating ? "Processing..." : "Start Graduation"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
