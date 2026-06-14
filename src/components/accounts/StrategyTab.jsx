import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Star, Trash2, Loader2, ExternalLink } from "lucide-react";

import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import {
  useAccountStrategies, useAssignStrategy,
  useUnassignStrategy, useSetDefaultStrategy,
} from "@/hooks/useStrategyAssignments";
import { useStrategies } from "@/hooks/useStrategies";
import { useUpdateAccount } from "@/hooks/useAccounts";
import { cn } from "@/lib/utils";

// ── Category badge label ──────────────────────────────────────
const CATEGORY_LABELS = {
  ict:                  "ICT",
  smc:                  "SMC",
  support_resistance:   "S&R",
  supply_demand:        "S&D",
  volume_profile:       "VP",
  price_action:         "PA",
  indicator_based:      "Indicator",
  hybrid:               "Hybrid",
  custom:               "Custom",
};

const CategoryBadge = ({ category }) => (
  <span className="inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-medium bg-primary/10 text-primary border-primary/20">
    {CATEGORY_LABELS[category] ?? category}
  </span>
);

// ── Assign Strategy modal ─────────────────────────────────────
const AssignStrategyModal = ({ open, onClose, accountId, assignedIds }) => {
  const [selectedId, setSelectedId] = useState("");
  const [isDefault,  setIsDefault]  = useState(false);

  const { data: strategies = [], isLoading } = useStrategies();
  const { mutate: assign, isPending }         = useAssignStrategy(accountId);

  const available = strategies.filter((s) => !assignedIds.includes(s._id));

  const handleSubmit = () => {
    if (!selectedId) return;
    assign(
      { strategyId: selectedId, isDefault },
      {
        onSuccess: () => {
          setSelectedId("");
          setIsDefault(false);
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    setSelectedId("");
    setIsDefault(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Assign Strategy</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {isLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : available.length === 0 ? (
            <div className="text-center py-4 space-y-2">
              <p className="text-sm text-muted-foreground">All your strategies are already assigned.</p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/strategies/new">Create a new strategy →</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Strategy</Label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select a strategy..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {available.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-3.5 w-3.5 rounded accent-[var(--primary)]"
                />
                <span className="text-sm text-foreground">Set as default for this account</span>
              </label>
            </>
          )}
        </div>

        {available.length > 0 && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!selectedId || isPending}>
              {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ── Strategy Risk Fallback (normal accounts) ──────────────────
const RiskFallbackSection = ({ account }) => {
  const { mutate: updateAccount, isPending } = useUpdateAccount(account._id);
  const [value, setValue] = useState(account.normalConfig?.maxRiskPerTradePercent ?? "");

  const handleSave = () => {
    const num = value === "" || value == null ? null : Number(value);
    updateAccount({ normalConfig: { maxRiskPerTradePercent: Number.isNaN(num) ? null : num } });
  };

  return (
    <div className="trading-card p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-foreground">Strategy Risk Fallback</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Used only when no strategy is assigned to this account.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative w-36">
          <Input
            type="number"
            step="0.1"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 1"
            className="bg-background border-border pr-6"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            %
          </span>
        </div>
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
        </Button>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────
export const StrategyTab = ({ account }) => {
  const [assignOpen,   setAssignOpen]   = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  const { data: assignments = [], isLoading } = useAccountStrategies(account._id);
  const { mutate: unassign,    isPending: removing    } = useUnassignStrategy(account._id);
  const { mutate: setDefault,  isPending: settingDefault } = useSetDefaultStrategy(account._id);

  const assignedIds = assignments.map((a) => a.strategy?._id ?? a.strategy);
  const isNormal    = account.type === "normal";
  const isProp      = account.type === "prop";

  const emptyStateText = isProp
    ? "No strategy assigned. Risk and RR compliance based on strategy rules won't apply, and discipline scoring will be unavailable until you assign one."
    : isNormal
    ? "No strategy assigned. Trades will use your Strategy Risk Fallback (below) for risk compliance. Minimum RR and discipline scoring require an assigned strategy."
    : "No strategy assigned. Discipline scoring requires an assigned strategy.";

  const handleRemoveConfirm = () => {
    if (!removeTarget) return;
    unassign(removeTarget.strategy?._id ?? removeTarget.strategy, {
      onSuccess: () => setRemoveTarget(null),
    });
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground font-heading">Strategy</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage which strategies are active on this account
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" asChild>
            <Link to="/strategies">
              <ExternalLink className="h-3 w-3" />
              Manage Library
            </Link>
          </Button>
          <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setAssignOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Assign Strategy
          </Button>
        </div>
      </div>

      {/* Assigned strategies list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : assignments.length === 0 ? (
        <div className="trading-card p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">{emptyStateText}</p>
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" onClick={() => setAssignOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Assign Strategy
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/strategies/new">Create New Strategy →</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {assignments.map((assignment) => {
            const strategy = assignment.strategy ?? {};
            const name     = strategy.name     ?? "Unnamed";
            const category = strategy.category ?? "custom";
            const risk     = strategy.riskRules?.maxRiskPerTrade;
            const minRR    = strategy.riskRules?.minRR;
            const criteria = strategy.setupCriteria?.length ?? 0;

            return (
              <div key={assignment._id} className="trading-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {assignment.isDefault && (
                        <Star className="h-3.5 w-3.5 text-[var(--warning)] fill-[var(--warning)] flex-shrink-0" />
                      )}
                      <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                      <CategoryBadge category={category} />
                      {assignment.isDefault && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Risk: {risk != null ? `${risk}%` : "—"}
                      {" · "}
                      Min RR: {minRR != null ? `1:${minRR}` : "—"}
                      {" · "}
                      {criteria} setup criteri{criteria !== 1 ? "a" : "on"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!assignment.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        disabled={settingDefault}
                        onClick={() => setDefault(strategy._id ?? assignment.strategy)}
                      >
                        <Star className="h-3 w-3" />
                        Set Default
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setRemoveTarget(assignment)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Risk fallback for normal accounts */}
      {isNormal && <RiskFallbackSection account={account} />}

      {/* Assign modal */}
      <AssignStrategyModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        accountId={account._id}
        assignedIds={assignedIds}
      />

      {/* Remove confirm */}
      <AlertDialog open={!!removeTarget} onOpenChange={(o) => { if (!o) setRemoveTarget(null); }}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Strategy?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove{" "}
              <span className="font-semibold text-foreground">
                {removeTarget?.strategy?.name ?? "this strategy"}
              </span>{" "}
              from this account? The strategy itself will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveConfirm} disabled={removing}>
              {removing ? "Removing..." : "Remove"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
