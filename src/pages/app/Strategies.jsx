import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, Layers, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button }   from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter,
} from "@/components/ui/alert-dialog";

import { useStrategies, useStrategyTemplates, useCreateStrategy, useDeleteStrategy } from "@/hooks/useStrategies";
import { pageVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

// ── Category config ───────────────────────────────────────────
const CATEGORY_LABELS = {
  ict:                "ICT",
  smc:                "SMC",
  support_resistance: "S&R",
  supply_demand:      "S&D",
  volume_profile:     "VP",
  price_action:       "PA",
  indicator_based:    "Indicator",
  hybrid:             "Hybrid",
  custom:             "Custom",
};

const CategoryBadge = ({ category }) => (
  <span className="inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-medium bg-primary/10 text-primary border-primary/20">
    {CATEGORY_LABELS[category] ?? category}
  </span>
);

const SessionLabel = { asian: "Asian", london: "London", new_york: "New York", sydney: "Sydney" };

// ── Strategy card ─────────────────────────────────────────────
const StrategyCard = ({ strategy, onDelete }) => {
  const navigate = useNavigate();
  const risk     = strategy.riskRules?.maxRiskPerTrade;
  const minRR    = strategy.riskRules?.minRR;
  const criteria = strategy.setupCriteria?.length ?? 0;
  const sessions = (strategy.sessions ?? [])
    .map((s) => SessionLabel[s] ?? s)
    .join(", ");

  return (
    <div className="trading-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold text-foreground">{strategy.name}</p>
            <CategoryBadge category={strategy.category} />
          </div>
          {strategy.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">{strategy.description}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Risk: {risk != null ? `${risk}%` : "—"}
            {" · "}
            Min RR: {minRR != null ? `1:${minRR}` : "—"}
            {" · "}
            {criteria} setup criteri{criteria !== 1 ? "a" : "on"}
            {sessions && ` · ${sessions}`}
          </p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => navigate(`/strategies/${strategy._id}/edit`)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(strategy)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Template card ─────────────────────────────────────────────
const TemplateCard = ({ template, onUse }) => {
  const risk     = template.riskRules?.maxRiskPerTrade;
  const minRR    = template.riskRules?.minRR;
  const criteria = template.setupCriteria?.length ?? 0;

  return (
    <div className="trading-card p-4 space-y-3 border-primary/20 hover:border-primary/40 transition-colors">
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-foreground">{template.name}</p>
          <CategoryBadge category={template.category} />
        </div>
        {template.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Risk: {risk != null ? `${risk}%` : "—"}
          {" · "}
          RR: {minRR != null ? `1:${minRR}` : "—"}
          {" · "}
          {criteria} criteri{criteria !== 1 ? "a" : "on"}
        </p>
      </div>
      <Button size="sm" className="w-full gap-1.5" onClick={() => onUse(template)}>
        <Copy className="h-3 w-3" />
        Use This
      </Button>
    </div>
  );
};

// ── Template picker modal ─────────────────────────────────────
const TemplatePicker = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { data: templates = [], isLoading } = useStrategyTemplates();
  const { mutate: createStrategy, isPending } = useCreateStrategy();

  const handleUse = (template) => {
    createStrategy(
      { cloneFrom: template._id },
      {
        onSuccess: (res) => {
          const id = res?.strategy?._id;
          onClose();
          if (id) navigate(`/strategies/${id}/edit`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="font-heading">Choose a Template</DialogTitle>
            <Button variant="outline" size="sm" onClick={() => { onClose(); navigate("/strategies/new"); }}>
              Start Blank
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 mt-3">
            {[1,2,3,4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : templates.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No templates available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {templates.map((t) => (
              <TemplateCard key={t._id} template={t} onUse={handleUse} />
            ))}
          </div>
        )}

        {isPending && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cloning template...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ── Main page ─────────────────────────────────────────────────
export const Strategies = () => {
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [deleteTarget,       setDeleteTarget]       = useState(null);

  const { data: strategies = [], isLoading } = useStrategies();
  const { mutate: deleteStrategy, isPending: deleting } = useDeleteStrategy();

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteStrategy(deleteTarget._id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">My Strategies</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Build, refine, and assign your trading strategies across accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setTemplatePickerOpen(true)}>
            <Layers className="h-3.5 w-3.5" />
            From Template
          </Button>
          <Button size="sm" className="gap-1.5" asChild>
            <Link to="/strategies/new">
              <Plus className="h-3.5 w-3.5" />
              New Strategy
            </Link>
          </Button>
        </div>
      </div>

      {/* Strategy list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : strategies.length === 0 ? (
        <div className="trading-card p-12 flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Layers className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">No strategies yet</p>
            <p className="text-xs text-muted-foreground">
              Create your first strategy or start from a proven template
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" asChild>
              <Link to="/strategies/new">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create Strategy
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setTemplatePickerOpen(true)}>
              Browse Templates
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {strategies.map((s) => (
            <StrategyCard key={s._id} strategy={s} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {/* Template picker */}
      <TemplatePicker open={templatePickerOpen} onClose={() => setTemplatePickerOpen(false)} />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Strategy?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span>?
              This will remove it from all assigned accounts and untag it from any trades.
              Trades themselves are not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
