import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AccountTypeBadge } from "@/components/accounts/AccountTypeBadge";
import {
  TRANSACTION_LABELS,
  TRANSACTION_ICONS,
  TRANSACTION_COLORS,
  MANUAL_TRANSACTION_TYPES,
  TRANSACTION_DIRECTION,
} from "@/constants/transactionTypes";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { cn } from "@/lib/utils";

const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const schema = z.object({
  accountId:       z.string().min(1, "Account is required"),
  type:            z.string().min(1, "Type is required"),
  amount:          z.coerce.number()
    .positive("Amount must be positive")
    .max(100_000_000, "Amount is too large"),
  transactionDate: z.string().min(1, "Date is required"),
  note:            z.string().max(500, "Max 500 chars").optional(),
});

const TypeCard = ({ type, selected, onSelect }) => {
  const Icon     = TRANSACTION_ICONS[type];
  const colorCls = TRANSACTION_COLORS[type] ?? "text-muted-foreground bg-muted";
  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-border/60"
      )}
    >
      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", colorCls)}>
        {Icon && <Icon className="h-4 w-4" />}
      </div>
      <span className={cn(
        "text-xs font-medium text-center leading-tight",
        selected ? "text-primary" : "text-muted-foreground"
      )}>
        {TRANSACTION_LABELS[type]}
      </span>
    </button>
  );
};

export const AddTransactionModal = ({
  open,
  onClose,
  accounts = [],
  defaultAccountId = "",
}) => {
  const { mutate: create, isPending } = useCreateTransaction();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver:      zodResolver(schema),
    defaultValues: {
      accountId:       defaultAccountId,
      type:            "",
      amount:          "",
      transactionDate: todayLocal(),
      note:            "",
    },
  });

  const selectedType    = watch("type");
  const noteValue       = watch("note") ?? "";
  const selectedAccount = accounts.find((a) => a._id === watch("accountId"));
  const accountType     = selectedAccount?.type ?? null; // "prop" | "normal" | "war" | null

  // Type filtering rules per tradecore-frontend skill:
  //   Prop accounts: NO deposit/withdrawal — only prop_challenge_fee, payout, adjustments
  //   Personal (normal/war): NO prop_challenge_fee/payout — only deposit, withdrawal, adjustments
  //   No account: show all manually addable types
  const availableTypes = MANUAL_TRANSACTION_TYPES.filter((t) => {
    if (accountType === "prop") {
      return t !== "deposit" && t !== "withdrawal";
    }
    if (accountType === "normal" || accountType === "war") {
      return t !== "prop_challenge_fee" && t !== "payout";
    }
    return true;
  });

  const onSubmit = (data) => {
    const [y, m, d] = data.transactionDate.split("-").map(Number);
    const selectedLocal = new Date(y, m - 1, d);
    const now = new Date();
    const isToday = selectedLocal.toDateString() === now.toDateString();
    const transactionDate = isToday ? now.toISOString() : selectedLocal.toISOString();

    create(
      { ...data, transactionDate, source: "manual" },
      {
        onSuccess: () => {
          reset({ accountId: defaultAccountId, type: "", amount: "", transactionDate: todayLocal(), note: "" });
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="bg-card border-border max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-1">
          {/* Account */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Account <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="accountId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    setValue("type", ""); // reset type when account changes
                  }}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {accounts.map((a) => (
                      <SelectItem key={a._id} value={a._id}>
                        <div className="flex items-center gap-2">
                          <AccountTypeBadge type={a.type} />
                          <span>{a.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.accountId && (
              <p className="text-xs text-destructive">{errors.accountId.message}</p>
            )}
          </div>

          {/* Type grid */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Type <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {availableTypes.map((type) => (
                <TypeCard
                  key={type}
                  type={type}
                  selected={selectedType === type}
                  onSelect={(t) => setValue("type", t, { shouldValidate: true })}
                />
              ))}
            </div>
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Amount + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Amount <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="pl-7 font-mono bg-background border-border"
                  {...register("amount")}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                max={todayLocal()}
                className="bg-background border-border"
                {...register("transactionDate")}
              />
              {errors.transactionDate && (
                <p className="text-xs text-destructive">{errors.transactionDate.message}</p>
              )}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Note</Label>
              <span className="text-[10px] text-muted-foreground">
                {noteValue.length}/500
              </span>
            </div>
            <Textarea
              rows={2}
              maxLength={500}
              placeholder="e.g. Monthly deposit"
              className="bg-background border-border resize-none text-sm"
              {...register("note")}
            />
            {errors.note && (
              <p className="text-xs text-destructive">{errors.note.message}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Adding..." : "Add Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
