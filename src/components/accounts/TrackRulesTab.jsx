import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus, Pencil, Trash2, AlertTriangle, Loader2, RefreshCw,
} from "lucide-react";

import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Label }     from "@/components/ui/label";
import { Switch }    from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

import { useUpdateAccount } from "@/hooks/useAccounts";
import {
  useAddRule, useUpdateRule, useDeleteRule, useToggleRule, useEvaluateRules,
} from "@/hooks/useAccountRules";
import { cn } from "@/lib/utils";

const CATEGORY_CFG = {
  risk:     { label: "Risk",     cls: "bg-[var(--loss)]/10 text-[var(--loss)] border-[var(--loss)]/20"         },
  behavior: { label: "Behavior", cls: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20" },
  strategy: { label: "Strategy", cls: "bg-primary/10 text-primary border-primary/20"                            },
  session:  { label: "Session",  cls: "bg-muted text-muted-foreground border-border"                            },
  custom:   { label: "Custom",   cls: "bg-muted text-muted-foreground border-border"                            },
};

const MODE_CFG = {
  track:   { label: "Track",   cls: "bg-muted text-muted-foreground border-border"                               },
  warn:    { label: "Warn",    cls: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20"    },
  enforce: { label: "Enforce", cls: "bg-[var(--loss)]/10 text-[var(--loss)] border-[var(--loss)]/20"             },
};

const EVAL_TYPES = [
  { value: "daily_loss_limit",   label: "Daily Loss Limit" },
  { value: "trade_frequency",    label: "Trade Frequency" },
  { value: "consecutive_losses", label: "Consecutive Losses" },
  { value: "custom",             label: "Custom" },
];

const VALID_EVAL_TYPES = new Set(EVAL_TYPES.map((t) => t.value));

const THRESHOLD_SUFFIX = {
  daily_loss_limit:   "%",
  trade_frequency:    "trades/day",
  consecutive_losses: "losses",
};

const ruleSchema = z.object({
  title:          z.string().min(1, "Title is required"),
  category:       z.string().default("custom"),
  evaluationType: z.string().default("custom"),
  mode:           z.string().default("track"),
  enabled:        z.boolean().default(true),
  threshold:      z.any().optional(),
});

// ── Dynamic threshold field ───────────────────────────────────
const ThresholdField = ({ evaluationType, value, onChange }) => {
  if (evaluationType === "custom") {
    return (
      <Input
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe the threshold..."
        className="bg-background border-border"
      />
    );
  }
  const suffix = THRESHOLD_SUFFIX[evaluationType];
  return (
    <div className="relative">
      <Input
        type="number"
        step="0.1"
        min="0"
        value={typeof value === "number" ? value : ""}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        className={cn("bg-background border-border", suffix && "pr-20")}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
};

// ── Add / Edit Rule Modal ─────────────────────────────────────
const RuleModal = ({ open, onClose, accountId, rule }) => {
  const isEdit = !!rule?._id;
  const { mutate: addRule,    isPending: adding   } = useAddRule(accountId);
  const { mutate: updateRule, isPending: updating } = useUpdateRule(accountId);

  const {
    register, control, handleSubmit, watch, reset, setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      title:          rule?.title          ?? "",
      category:       rule?.category       ?? "custom",
      evaluationType: rule?.evaluationType ?? "custom",
      mode:           rule?.mode           ?? "track",
      enabled:        rule?.enabled        ?? true,
      threshold:      rule?.threshold      ?? "",
    },
  });

  const evaluationType = watch("evaluationType");
  const isPending = adding || updating;

  const handleClose = () => { onClose(); reset(); };

  const handleEvalTypeChange = (val, fieldOnChange) => {
    fieldOnChange(val);
    setValue("threshold", "");
  };

  const onSubmit = (data) => {
    if (isEdit) {
      updateRule({ ruleId: rule._id, data }, { onSuccess: handleClose });
    } else {
      addRule(data, { onSuccess: handleClose });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{isEdit ? "Edit Rule" : "Add Rule"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Rule Title <span className="text-destructive">*</span>
            </Label>
            <Input
              {...register("title")}
              placeholder="e.g. No more than 2% risk per trade"
              className="bg-background border-border"
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Category + Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {Object.entries(CATEGORY_CFG).map(([val, cfg]) => (
                        <SelectItem key={val} value={val}>{cfg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Mode</Label>
              <Controller
                name="mode"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {Object.entries(MODE_CFG).map(([val, cfg]) => (
                        <SelectItem key={val} value={val}>{cfg.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Evaluation Type */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Evaluation Type</Label>
            <Controller
              name="evaluationType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => handleEvalTypeChange(val, field.onChange)}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {EVAL_TYPES.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Threshold */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Threshold</Label>
            <Controller
              name="threshold"
              control={control}
              render={({ field }) => (
                <ThresholdField
                  evaluationType={evaluationType}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Enabled */}
          <div className="flex items-center justify-between py-1">
            <Label className="text-sm text-foreground">Enabled</Label>
            <Controller
              name="enabled"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {isEdit ? "Save Changes" : "Add Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ── Rule Card ─────────────────────────────────────────────────
const RuleCard = ({ rule, accountId }) => {
  const [editOpen,   setEditOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { mutate: toggleRule, isPending: toggling } = useToggleRule(accountId);
  const { mutate: deleteRule, isPending: deleting  } = useDeleteRule(accountId);

  const cat     = CATEGORY_CFG[rule.category] ?? CATEGORY_CFG.custom;
  const mode    = MODE_CFG[rule.mode]          ?? MODE_CFG.track;
  const isLegacy = !VALID_EVAL_TYPES.has(rule.evaluationType);

  return (
    <>
      <div className={cn("trading-card p-4", isLegacy && "opacity-70")}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {rule.violated && (
                <AlertTriangle className="h-3.5 w-3.5 text-[var(--warning)] flex-shrink-0" />
              )}
              <p className="text-sm font-medium text-foreground leading-snug">{rule.title}</p>
              {isLegacy && (
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded border bg-muted text-muted-foreground border-border">
                  Legacy rule type — no longer evaluated
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", cat.cls)}>
                {cat.label}
              </span>
              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", mode.cls)}>
                {mode.label}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Violated {rule.violationsCount ?? 0} time{(rule.violationsCount ?? 0) !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {!isLegacy && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleRule(rule._id)}
                        disabled={toggling}
                        className="scale-90"
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {rule.enabled ? "Disable rule" : "Enable rule"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {!isLegacy && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {!isLegacy && (
        <RuleModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          accountId={accountId}
          rule={rule}
        />
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rule?</AlertDialogTitle>
            <AlertDialogDescription>
              "{rule.title}" will be permanently removed from this account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => deleteRule(rule._id, { onSuccess: () => setDeleteOpen(false) })}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// ── Main ──────────────────────────────────────────────────────
export const TrackRulesTab = ({ account }) => {
  const [addOpen, setAddOpen] = useState(false);

  const { mutate: updateAccount, isPending: updatingMode } = useUpdateAccount(account._id);
  const { mutate: evaluate,      isPending: evaluating    } = useEvaluateRules(account._id);

  const isProp = account.type === "prop";
  const rules  = account.trackRules ?? [];

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground font-heading">Trading Rules</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Personal discipline rules tracked on every trade
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => evaluate()}
            disabled={evaluating}
            className="gap-1.5 h-8 text-xs"
          >
            {evaluating
              ? <Loader2 className="h-3 w-3 animate-spin" />
              : <RefreshCw className="h-3 w-3" />
            }
            Evaluate Rules Now
          </Button>
          <Button
            size="sm"
            className="gap-1.5 h-8 text-xs"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Rule
          </Button>
        </div>
      </div>

      {/* Rule Mode */}
      <div className="trading-card p-4">
        {isProp ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help w-fit">
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-[var(--loss)]/10 text-[var(--loss)] border-[var(--loss)]/20">
                    Enforced
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Rules: Enforced (Prop Firm Required)
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[260px] text-xs">
                Prop accounts always enforce trading rules — this cannot be changed.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Rule Mode</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Controls how violations are handled across all rules
                </p>
              </div>
              <Select
                value={account.ruleMode ?? "track"}
                onValueChange={(val) => updateAccount({ ruleMode: val })}
                disabled={updatingMode}
              >
                <SelectTrigger className="w-36 bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="track">Track</SelectItem>
                  <SelectItem value="enforced">Enforced</SelectItem>
                  <SelectItem value="off">Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {account.ruleMode === "track" && (
              <p className="text-[11px] text-muted-foreground">
                Violations are logged silently. No UI interruption.
              </p>
            )}
            {account.ruleMode === "enforced" && (
              <p className="text-[11px] text-muted-foreground">
                Rules with mode "Enforce" will actively block or flag trades.
              </p>
            )}
            {account.ruleMode === "off" && (
              <p className="text-[11px] text-muted-foreground">
                Rule system is completely disabled. No evaluation occurs.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Rules list */}
      {rules.length === 0 ? (
        <div className="trading-card p-8 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">No rules yet</p>
          <p className="text-xs text-muted-foreground">
            Add a rule to start tracking discipline violations on this account.
          </p>
          <Button size="sm" className="mt-2 gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add Rule
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <RuleCard key={rule._id} rule={rule} accountId={account._id} />
          ))}
        </div>
      )}

      <RuleModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        accountId={account._id}
        rule={null}
      />
    </div>
  );
};
