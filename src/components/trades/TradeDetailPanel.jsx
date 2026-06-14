import { useState, useRef, useCallback } from "react";
import {
  X, Trash2, AlertTriangle, HelpCircle, CheckCircle2,
  RefreshCw, Loader2, BookOpen, Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Button }    from "@/components/ui/button";
import { Textarea }  from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton }  from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { DirectionBadge }         from "./DirectionBadge";
import { OutcomeBadge }           from "./OutcomeBadge";
import { SessionBadge, SessionBadges } from "./SessionBadge";
import { GradeStars }             from "./GradeStars";
import { PropComplianceBadge }    from "./PropComplianceBadge";
import { DisciplineScoreBadge }   from "./DisciplineScoreBadge";
import { SetupCriteriaChecklist } from "@/components/strategy/SetupCriteriaChecklist";
import { useUpdateTrade, useDeleteTrade } from "@/hooks/useTrades";
import { useCheckCompliance }     from "@/hooks/useTradeCompliance";
import { useStrategies, useStrategy } from "@/hooks/useStrategies";
import { useTagTradeStrategy }    from "@/hooks/useTradeStrategy";
import { useAccountStrategies }   from "@/hooks/useStrategyAssignments";
import { formatPnL, formatCurrency, getPnLColor, formatPips, formatRelativeTime } from "@/utils/format";
import { getTradeDuration, isShortDuration } from "@/utils/tradeDuration";
import { cn } from "@/lib/utils";

const EXIT_REASON_MAP = {
  tp_hit:        { label: "Take Profit Hit ✓", cls: "text-[var(--profit)]" },
  sl_hit:        { label: "Stop Loss Hit ✗",   cls: "text-[var(--loss)]"   },
  manual:        { label: "Manual Close",       cls: "text-foreground"      },
  trailing_stop: { label: "Trailing Stop",      cls: "text-muted-foreground" },
};

const FLAG_LABELS = {
  NO_STOP_LOSS:   "No stop loss set",
  NO_TAKE_PROFIT: "No take profit set",
  POOR_RR:        "Risk:Reward below 1:1",
  HIGH_RISK:      "Risk above 2% per trade",
};

const SEVERITY_STYLES = {
  warning:  "bg-[var(--warning)]/10 border-[var(--warning)]/30 text-[var(--warning)]",
  low:      "bg-primary/10 border-primary/30 text-[color:var(--primary)]",
  medium:   "bg-[var(--warning)]/10 border-[var(--warning)]/30 text-[var(--warning)]",
  high:     "bg-[var(--loss)]/10 border-[var(--loss)]/30 text-[var(--loss)]",
  critical: "bg-[var(--loss)]/15 border-[var(--loss)]/50 text-[var(--loss)]",
};

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, warning: 3 };

const formatRuleName = (rule) =>
  rule
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatViolationValue = (rule, value) => {
  if (value == null) return null;
  if (rule.includes("_PERCENT") || rule.includes("RISK") || rule.includes("DRAWDOWN")) {
    return `${Number(value).toFixed(2)}%`;
  }
  if (rule.includes("RR") || rule.includes("_RR")) {
    return `${Number(value).toFixed(2)}R`;
  }
  if (rule.includes("LOT")) {
    return `${Number(value).toFixed(2)} lots`;
  }
  return String(value);
};

const CHECK_LABELS = {
  stopLoss:      "Stop Loss",
  takeProfit:    "Take Profit",
  riskPercent:   "Risk %",
  rrRatio:       "RR Ratio",
  dailyDrawdown: "Daily Drawdown",
  lotSize:       "Lot Size",
  session:       "Session",
  newsWindow:    "News Window",
};

const getRiskQualityClass = (score) => {
  if (score == null) return "text-muted-foreground";
  if (score >= 80) return "text-[var(--profit)]";
  if (score >= 60) return "text-[var(--primary)]";
  if (score >= 40) return "text-[var(--warning)]";
  return "text-[var(--loss)]";
};

const SETUP_TAGS = [
  "breakout", "trend_follow", "reversal", "range",
  "news", "scalp", "swing", "support_resistance", "fibonacci",
];

const formatPrice = (v) => v != null ? Number(v).toFixed(5) : "—";

const SectionTitle = ({ children }) => (
  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
    {children}
  </p>
);

const MetaRow = ({ label, value, mono = false, className }) => (
  <div className="space-y-0.5">
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className={cn("text-sm text-foreground", mono && "font-mono", className)}>{value ?? "—"}</p>
  </div>
);

const CheckRow = ({ label, value }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className={value === true ? "text-[var(--profit)]" : value === false ? "text-[var(--loss)]" : "text-muted-foreground"}>
      {value === true ? "✓ Valid" : value === false ? "✗ Invalid" : "—"}
    </span>
  </div>
);

const PROP_ONLY_CHECK_KEYS = new Set(["dailyDrawdown", "lotSize", "session", "newsWindow"]);

// ── Score color helper ────────────────────────────────────────
const getScoreColor = (score) => {
  if (score >= 80) return "var(--profit)";
  if (score >= 60) return "var(--primary)";
  if (score >= 40) return "var(--warning)";
  return "var(--loss)";
};

const getScoreTextClass = (score) => {
  if (score >= 80) return "text-[var(--profit)]";
  if (score >= 60) return "text-primary";
  if (score >= 40) return "text-[var(--warning)]";
  return "text-[var(--loss)]";
};

// ── Strategy & Setup display ──────────────────────────────────
const StrategySetupDisplay = ({ trade, onEditSetup }) => {
  const { data: strategy, isLoading } = useStrategy(
    typeof trade.strategy === "string" ? trade.strategy : trade.strategy?._id
  );

  if (isLoading) return <Skeleton className="h-12 w-full" />;

  const strategyName     = strategy?.name ?? "—";
  const strategyCategory = strategy?.category ?? null;
  const hasCriteria      = (strategy?.setupCriteria?.length ?? 0) > 0;
  const setup            = trade.setup;

  const CATEGORY_LABELS = {
    ict: "ICT", smc: "SMC", support_resistance: "S&R",
    supply_demand: "S&D", volume_profile: "VP", price_action: "PA",
    indicator_based: "Indicator", hybrid: "Hybrid", custom: "Custom",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-foreground">{strategyName}</p>
        {strategyCategory && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-medium bg-primary/10 text-primary border-primary/20">
            {CATEGORY_LABELS[strategyCategory] ?? strategyCategory}
          </span>
        )}
      </div>

      {hasCriteria && setup?.criteriaChecked?.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Setup Criteria</p>
          {strategy.setupCriteria.map((c) => {
            const checked = setup.criteriaChecked.find((x) => x.id === c.id)?.checked ?? false;
            return (
              <div key={c.id} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{c.label}</span>
                <span className={checked ? "text-[var(--profit)]" : "text-[var(--loss)]"}>
                  {checked ? "✓" : "✗"}
                </span>
              </div>
            );
          })}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
            <span className="font-medium text-foreground">Confluence</span>
            <span className={setup.confluenceMet ? "text-[var(--profit)]" : "text-[var(--loss)]"}>
              {setup.confluenceMet ? "✓ Met" : "✗ Not Met"}
            </span>
          </div>
        </div>
      )}

      {hasCriteria && !setup && (
        <p className="text-xs text-muted-foreground">
          Setup criteria not yet assessed.{" "}
          <button
            type="button"
            onClick={onEditSetup}
            className="text-primary hover:underline"
          >
            Assess now
          </button>
        </p>
      )}

      <button
        type="button"
        onClick={onEditSetup}
        className="text-[10px] text-primary hover:underline"
      >
        {setup ? "Edit Setup" : "Assess Setup"}
      </button>
    </div>
  );
};

// ── Discipline section ────────────────────────────────────────
const DisciplineSection = ({ trade, onAssignStrategy }) => {
  const discipline = trade.discipline;

  // No discipline object at all — no effective strategy found
  if (!discipline || discipline.score === null) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          {!trade.strategy
            ? "No strategy linked to this account."
            : "Strategy required for scoring."}
        </p>
        {discipline?.feedback?.[0] && (
          <p className="text-xs text-muted-foreground">{discipline.feedback[0]}</p>
        )}
        <button
          type="button"
          onClick={onAssignStrategy}
          className="text-xs text-primary hover:underline"
        >
          {trade.strategy ? "Change Strategy →" : "Assign a Strategy →"}
        </button>
      </div>
    );
  }

  const { score, isDisciplined, violations = {}, feedback = [], calculatedAt } = discipline;

  // Fetch strategy to determine whether setupCriteria exists (for setup row null handling)
  const strategyId = typeof trade.strategy === "string"
    ? trade.strategy
    : trade.strategy?._id;
  const { data: strategy } = useStrategy(strategyId);
  const hasCriteria = (strategy?.setupCriteria?.length ?? 0) > 0;

  const setupViolation = violations.setup;

  return (
    <div className="space-y-3">
      {/* Score + bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className={cn("text-lg font-mono font-bold", getScoreTextClass(score))}>
            {score} / 100
          </span>
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded border",
            isDisciplined
              ? "bg-[var(--profit)]/10 text-[var(--profit)] border-[var(--profit)]/20"
              : "bg-[var(--loss)]/10 text-[var(--loss)] border-[var(--loss)]/20"
          )}>
            {isDisciplined ? "✓ Disciplined" : "✗ Not Disciplined"}
          </span>
        </div>
        <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all"
            style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }}
          />
        </div>
      </div>

      {/* Violation rows */}
      <div className="space-y-1.5">
        {[
          { key: "session", label: "Session" },
          { key: "risk",    label: "Risk" },
          { key: "rr",      label: "RR" },
        ].map(({ key, label }) => {
          const violated = violations[key];
          return (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className={violated ? "text-[var(--loss)]" : "text-[var(--profit)]"}>
                {violated ? "✗ Violated" : "✓ OK"}
              </span>
            </div>
          );
        })}

        {/* Setup row — three states */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Setup</span>
          {setupViolation === null ? (
            <span className="text-muted-foreground">
              {hasCriteria
                ? "— Not assessed"
                : "— N/A (no setup criteria defined)"}
            </span>
          ) : setupViolation ? (
            <span className="text-[var(--loss)]">✗ Violated</span>
          ) : (
            <span className="text-[var(--profit)]">✓ OK</span>
          )}
        </div>

        {/* Prompt to assess when strategy has criteria but setup is null */}
        {setupViolation === null && hasCriteria && !trade.setup && (
          <p className="text-[11px] text-muted-foreground pl-0.5">
            This strategy has setup criteria.{" "}
            <button
              type="button"
              onClick={onAssignStrategy}
              className="text-primary hover:underline"
            >
              Assess Setup →
            </button>
          </p>
        )}
      </div>

      {/* Feedback */}
      {feedback.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Feedback</p>
          <ul className="space-y-1">
            {feedback.map((f, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground leading-snug">
                <span className="mt-0.5 flex-shrink-0">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {calculatedAt && (
        <p className="text-[10px] text-muted-foreground">
          Last calculated: {formatRelativeTime(calculatedAt)}
        </p>
      )}
    </div>
  );
};

// ── Tag Strategy Modal ────────────────────────────────────────
const TagStrategyModal = ({ open, onClose, trade, account }) => {
  const [selectedId,       setSelectedId]       = useState(trade?.strategy ?? "");
  const [criteriaChecked,  setCriteriaChecked]  = useState(trade?.setup?.criteriaChecked ?? []);

  const { data: accountStrategies = [] } = useAccountStrategies(account?._id);
  const { data: allStrategies = [] }     = useStrategies();
  const { data: selectedStrategy }       = useStrategy(selectedId || null);
  const { mutate: tagStrategy, isPending } = useTagTradeStrategy(trade?._id);

  // account-assigned strategies first, then remaining
  const accountStrategyIds = accountStrategies.map((a) => a.strategy?._id ?? a.strategy);
  const ordered = [
    ...accountStrategies.map((a) => a.strategy).filter(Boolean),
    ...allStrategies.filter((s) => !accountStrategyIds.includes(s._id)),
  ];

  const handleSubmit = () => {
    if (!selectedId) return;
    tagStrategy(
      { strategyId: selectedId, criteriaChecked },
      { onSuccess: onClose }
    );
  };

  const handleClose = () => {
    setSelectedId(trade?.strategy ?? "");
    setCriteriaChecked(trade?.setup?.criteriaChecked ?? []);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="bg-card border-border max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {trade?.strategy ? "Change Strategy" : "Tag Strategy"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Strategy</label>
            <Select value={selectedId} onValueChange={(v) => { setSelectedId(v); setCriteriaChecked([]); }}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select a strategy..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {ordered.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name}
                    {accountStrategyIds.includes(s._id) ? " ★" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStrategy && selectedStrategy.setupCriteria?.length > 0 && (
            <SetupCriteriaChecklist
              strategy={selectedStrategy}
              initialChecked={criteriaChecked}
              onSubmit={(checked) => setCriteriaChecked(checked)}
            />
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={!selectedId || isPending}>
              {isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const TradeDetailPanel = ({ trade, account, onClose, onDelete }) => {
  const [deleteOpen,       setDeleteOpen]       = useState(false);
  const [savedNote,        setSavedNote]        = useState(false);
  const [complianceChecks, setComplianceChecks] = useState(null);
  const [checksExpanded,   setChecksExpanded]   = useState(false);
  const [tagStrategyOpen,  setTagStrategyOpen]  = useState(false);
  const noteDebounce = useRef(null);

  const { mutate: updateTrade } = useUpdateTrade(trade?._id);
  const { mutate: deleteTrade, isPending: deleting } = useDeleteTrade();
  const { mutate: checkCompliance, isPending: checkingCompliance } = useCheckCompliance(trade?._id);

  const handleGradeChange = (val) => {
    updateTrade({ setupQualityRating: val || null });
  };

  const handleNoteChange = useCallback((e) => {
    const val = e.target.value;
    clearTimeout(noteDebounce.current);
    noteDebounce.current = setTimeout(() => {
      updateTrade({ note: val }, {
        onSuccess: () => {
          setSavedNote(true);
          setTimeout(() => setSavedNote(false), 2000);
        },
      });
    }, 1500);
  }, [updateTrade]);

  const handleTagToggle = (tag) => {
    const current = trade.tags ?? [];
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    updateTrade({ tags: next });
  };

  const handleDeleteConfirm = () => {
    deleteTrade(trade._id, {
      onSuccess: () => {
        setDeleteOpen(false);
        onDelete?.();
      },
    });
  };

  if (!trade) return null;

  const grossPnl   = trade.grossPnl   ?? trade.pnl ?? 0;
  const netPnl     = trade.netPnl     ?? grossPnl;
  const commission = trade.commission ?? 0;
  const swap       = trade.swap       ?? 0;
  const duration   = getTradeDuration(trade.openedAt, trade.closedAt);
  const shortDuration = isShortDuration(trade.openedAt, trade.closedAt);

  const propCompliance = trade.propCompliance ?? {};
  const discipline     = trade.discipline     ?? {};
  const behavioural    = trade.behavioural    ?? {};
  const slMgmt         = trade.stopLossManagement ?? {};

  const weekdayDisplay = trade.weekday
    ? trade.weekday.charAt(0).toUpperCase() + trade.weekday.slice(1)
    : null;

  return (
    <>
      <div className="flex flex-col h-full">
        {/* ── Header ────────────────────────────────── */}
        <div className="px-5 pt-5 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-mono font-bold text-foreground">{trade.pair}</h2>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <DirectionBadge direction={trade.direction} />
                <OutcomeBadge   outcome={trade.outcome}    />
                {(trade.sessions?.length > 0) && trade.sessions.map((s) => (
                  <SessionBadge key={s} session={s} small />
                ))}
                {propCompliance.checked && (
                  <PropComplianceBadge propCompliance={propCompliance} />
                )}
                {trade.source && trade.source !== "manual" && (
                  <span className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border",
                    trade.source === "ea"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted text-muted-foreground border-border"
                  )}>
                    {trade.source === "ea" ? "EA" : "CSV"}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Critical violation banner (above all content) ──── */}
        {(trade.complianceViolations ?? []).some((v) => v.severity === "critical") && (
          <div className="flex items-start gap-2.5 px-4 py-3 bg-[var(--loss)]/10 border-b border-[var(--loss)]/30 flex-shrink-0">
            <span className="text-[var(--loss)] text-base flex-shrink-0 mt-0.5">⚠</span>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[var(--loss)]">Critical Prop Firm Violation</p>
              <p className="text-xs text-[var(--loss)]/80 leading-snug">
                This trade may have breached your prop firm rules. Review immediately.
              </p>
            </div>
          </div>
        )}

        {/* ── Scrollable content ────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Section 1 — Execution */}
          <div className="px-5 py-4 space-y-3">
            <SectionTitle>Execution</SectionTitle>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <MetaRow label="Entry Price"  value={formatPrice(trade.entryPrice)}  mono />
              <MetaRow label="Exit Price"   value={formatPrice(trade.exitPrice)}   mono />
              <MetaRow label="Stop Loss"    value={trade.stopLoss   != null ? formatPrice(trade.stopLoss)   : null} mono />
              <MetaRow label="Take Profit"  value={trade.takeProfit != null ? formatPrice(trade.takeProfit) : null} mono />
              <MetaRow label="Lot Size"     value={trade.lotSize?.toFixed(2)} mono />
              {trade.magicNumber != null && trade.magicNumber !== 0 && (
                <MetaRow label="EA Magic" value={String(trade.magicNumber)} mono />
              )}
              {trade.eaData?.comment && (
                <div className="col-span-2 space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Comment</p>
                  <p className="text-sm text-foreground">{trade.eaData.comment}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Section 2 — Results */}
          <div className="px-5 py-4 space-y-3">
            <SectionTitle>Results</SectionTitle>
            <div className="trading-card p-3 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Gross P&amp;L</span>
                <span className={cn("font-mono font-bold text-lg", getPnLColor(grossPnl))}>
                  {formatPnL(grossPnl)}
                </span>
              </div>
              {commission !== 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Commission</span>
                  <span className={cn("font-mono", commission < 0 ? "text-[var(--loss)]" : "text-muted-foreground")}>
                    {formatPnL(commission)}
                  </span>
                </div>
              )}
              {swap !== 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Swap</span>
                  <span className={cn("font-mono", swap < 0 ? "text-[var(--loss)]" : "text-muted-foreground")}>
                    {formatPnL(swap)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net P&amp;L</span>
                <span className={cn("font-mono font-bold text-xl", getPnLColor(netPnl))}>
                  {formatPnL(netPnl)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <MetaRow
                label="Realized R:R"
                value={trade.realizedRR != null ? `${trade.realizedRR.toFixed(2)}:1` : null}
                mono
              />
              <MetaRow
                label="Planned R:R"
                value={trade.plannedRR  != null ? `${trade.plannedRR.toFixed(2)}:1`  : null}
                mono
              />
            </div>
          </div>

          {/* Section 2b — Risk */}
          <Separator />
          <div className="px-5 py-4 space-y-3">
            <SectionTitle>Risk</SectionTitle>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk Amount</p>
                {trade.riskAmount != null ? (
                  <TooltipProvider>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-mono text-foreground">
                        {trade.riskEstimated ? "~" : ""}{formatCurrency(trade.riskAmount)}
                      </p>
                      {trade.riskEstimated && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertTriangle className="h-3 w-3 text-[var(--warning)] cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[200px] text-xs">
                            Estimated from actual loss — no stop loss was set
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TooltipProvider>
                ) : (
                  <TooltipProvider>
                    <div className="flex items-center gap-1">
                      <p className="text-sm text-muted-foreground">N/A</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[200px] text-xs">
                          Risk cannot be calculated without a stop loss on a winning trade
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                )}
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk %</p>
                {trade.riskPercent != null ? (
                  <div className="flex items-center gap-1">
                    <p className={cn(
                      "text-sm font-mono",
                      trade.riskPercent > 5 ? "text-[var(--loss)]" :
                      trade.riskPercent > 2 ? "text-[var(--warning)]" :
                      "text-foreground"
                    )}>
                      {trade.riskEstimated ? "~" : ""}{trade.riskPercent.toFixed(2)}%
                    </p>
                    {trade.riskPercent > 5 && (
                      <AlertTriangle className="h-3 w-3 text-[var(--loss)]" />
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2c — Pips (forex only — hidden when null) */}
          {trade.pipsGained != null && (
            <>
              <Separator />
              <div className="px-5 py-4 space-y-3">
                <SectionTitle>Pips</SectionTitle>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <MetaRow
                    label="Pips Gained"
                    value={formatPips(trade.pipsGained)}
                    mono
                    className={trade.pipsGained > 0 ? "text-[var(--profit)]" : trade.pipsGained < 0 ? "text-[var(--loss)]" : undefined}
                  />
                  <MetaRow
                    label="Pips Risked"
                    value={trade.pipsRisked != null ? `${Number(trade.pipsRisked).toFixed(1)} pips` : null}
                    mono
                  />
                </div>
              </div>
            </>
          )}

          {/* Section 2d — Exit Analysis */}
          {trade.exitReason && (
            <>
              <Separator />
              <div className="px-5 py-4 space-y-2">
                <SectionTitle>Exit</SectionTitle>
                <p className={cn(
                  "text-sm font-medium",
                  EXIT_REASON_MAP[trade.exitReason]?.cls ?? "text-foreground"
                )}>
                  {EXIT_REASON_MAP[trade.exitReason]?.label ?? trade.exitReason}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Section 3 — Timing */}
          <div className="px-5 py-4 space-y-3">
            <SectionTitle>Timing</SectionTitle>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <MetaRow
                label="Opened"
                value={trade.openedAt ? format(new Date(trade.openedAt), "MMM d, HH:mm") : null}
              />
              <MetaRow
                label="Closed"
                value={trade.closedAt ? format(new Date(trade.closedAt), "MMM d, HH:mm") : null}
              />
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Duration</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-mono text-foreground">{duration}</p>
                  {shortDuration && (
                    <span className="flex items-center gap-0.5 text-[10px] text-[var(--warning)]">
                      <AlertTriangle className="h-3 w-3" /> Short
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Session</p>
                {trade.sessions?.length > 0
                  ? <SessionBadges sessions={trade.sessions} small />
                  : <p className="text-sm text-muted-foreground">—</p>
                }
              </div>
              {weekdayDisplay && <MetaRow label="Weekday" value={weekdayDisplay} />}
              <MetaRow
                label="Period"
                value={trade.tradeMonth && trade.tradeYear
                  ? `${trade.tradeMonth}/${trade.tradeYear}`
                  : null}
              />
            </div>
          </div>

          {/* Section 3a — Strategy & Setup */}
          <Separator />
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <SectionTitle>Strategy</SectionTitle>
              <button
                type="button"
                onClick={() => setTagStrategyOpen(true)}
                className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
              >
                <Pencil className="h-3 w-3" />
                {trade.strategy ? "Change" : "Tag Strategy"}
              </button>
            </div>

            {trade.strategy ? (
              <StrategySetupDisplay trade={trade} onEditSetup={() => setTagStrategyOpen(true)} />
            ) : (
              <p className="text-xs text-muted-foreground">No strategy tagged</p>
            )}
          </div>

          {/* Section 3b — Risk Quality */}
          {trade.riskQualityScore != null && (
            <>
              <Separator />
              <div className="px-5 py-4 space-y-3">
                <SectionTitle>Risk Quality</SectionTitle>
                <div className="flex items-center justify-between">
                  <div className="relative h-1.5 rounded-full bg-muted overflow-hidden flex-1 mr-3">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full transition-all"
                      style={{
                        width: `${trade.riskQualityScore}%`,
                        backgroundColor: trade.riskQualityScore >= 80 ? "hsl(var(--profit))"
                          : trade.riskQualityScore >= 60 ? "hsl(var(--primary))"
                          : trade.riskQualityScore >= 40 ? "hsl(var(--warning))"
                          : "hsl(var(--loss))",
                      }}
                    />
                  </div>
                  <span className={cn("text-sm font-mono font-bold shrink-0", getRiskQualityClass(trade.riskQualityScore))}>
                    {trade.riskQualityScore}/100
                  </span>
                </div>
                {(trade.riskQualityFlags ?? []).length > 0 ? (
                  <div className="space-y-1.5">
                    {trade.riskQualityFlags.map((flag) => (
                      <div key={flag} className="flex items-center gap-1.5 text-xs text-[var(--warning)]">
                        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                        <span>{FLAG_LABELS[flag] ?? flag}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--profit)]">✓ No risk concerns</p>
                )}
              </div>
            </>
          )}

          {/* Section 3c — Trade Compliance */}
          <>
            <Separator />
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <SectionTitle>Compliance</SectionTitle>
                <button
                  type="button"
                  onClick={() =>
                    checkCompliance(undefined, {
                      onSuccess: (res) => {
                        setComplianceChecks(res?.checks ?? null);
                        setChecksExpanded(true);
                      },
                    })
                  }
                  disabled={checkingCompliance}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {checkingCompliance
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : <RefreshCw className="h-3 w-3" />
                  }
                  Re-check Compliance
                </button>
              </div>

              {trade.isCompliant == null ? (
                <p className="text-xs text-muted-foreground">Not checked yet</p>
              ) : trade.isCompliant ? (
                <div className="flex items-center gap-1.5 text-xs text-[var(--profit)]">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Trade compliant</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...(trade.complianceViolations ?? [])]
                    .sort((a, b) =>
                      (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99)
                    )
                    .map((v, i) => (
                      <div
                        key={i}
                        className={cn(
                          "px-2.5 py-2 rounded-lg border text-xs space-y-0.5",
                          SEVERITY_STYLES[v.severity] ?? SEVERITY_STYLES.warning,
                          v.severity === "critical" && "animate-pulse"
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="flex-shrink-0">{v.severity === "critical" ? "✗" : "⚠"}</span>
                          <p className="font-semibold">{formatRuleName(v.rule)}</p>
                          <span className="ml-auto text-[9px] font-medium uppercase opacity-70">{v.severity}</span>
                        </div>
                        {v.message && <p className="opacity-80 leading-snug pl-4">{v.message}</p>}
                        {(v.actual != null || v.limit != null) && (
                          <p className="opacity-70 text-[10px] pl-4 font-mono">
                            {v.actual != null && `Actual: ${formatViolationValue(v.rule, v.actual)}`}
                            {v.actual != null && v.limit != null && "  •  "}
                            {v.limit != null && `Limit: ${formatViolationValue(v.rule, v.limit)}`}
                          </p>
                        )}
                      </div>
                    ))
                  }
                  {(trade.complianceViolations ?? []).length === 0 && (
                    <p className="text-xs text-muted-foreground">No violation details</p>
                  )}
                  {/* Prop challenge warning for high/critical on enforced prop accounts */}
                  {account?.type === "prop" &&
                    (trade.complianceViolations ?? []).some(
                      (v) => v.severity === "high" || v.severity === "critical"
                    ) && (
                      <p className="text-[11px] text-[var(--warning)] border-t border-[var(--warning)]/20 pt-2 mt-1">
                        ⚠ This violation may affect your prop challenge.
                      </p>
                    )
                  }
                </div>
              )}

              {/* Checks detail table — shown after re-check */}
              {complianceChecks && (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setChecksExpanded((p) => !p)}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {checksExpanded ? "Hide" : "Show"} check details
                  </button>
                  {checksExpanded && (
                    <div className="trading-card p-3 space-y-1.5">
                      {Object.entries(complianceChecks)
                        .filter(([key]) =>
                          account?.type === "prop" || !PROP_ONLY_CHECK_KEYS.has(key)
                        )
                        .map(([key, passed]) => (
                          <div key={key} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {CHECK_LABELS[key] ?? key}
                            </span>
                            <span className={passed ? "text-[var(--profit)]" : "text-[var(--loss)]"}>
                              {passed ? "✓ Pass" : "✗ Fail"}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>

          {/* Section 4 — Compliance (only if checked) */}
          {propCompliance.checked && (
            <>
              <Separator />
              <div className="px-5 py-4 space-y-3">
                <SectionTitle>Prop Compliance</SectionTitle>
                <PropComplianceBadge propCompliance={propCompliance} large />

                {(propCompliance.violations ?? []).length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {propCompliance.violations.map((v, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-[var(--loss)]">
                        <span className="mt-0.5 flex-shrink-0">✗</span>
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2 mt-2">
                  <CheckRow label="Duration valid"  value={propCompliance.tradeDurationValid} />
                  <CheckRow label="News window"     value={propCompliance.newsWindowValid}    />
                  <CheckRow label="Session valid"   value={propCompliance.sessionValid}       />
                </div>
              </div>
            </>
          )}

          {/* Section 5 — Discipline Score */}
          <Separator />
          <div className="px-5 py-4 space-y-3">
            <SectionTitle>Discipline Score</SectionTitle>
            <DisciplineSection trade={trade} onAssignStrategy={() => setTagStrategyOpen(true)} />
          </div>

          {/* Section 6 — Behavioural */}
          {(behavioural.isRevengeTrade || behavioural.isOvertrade || behavioural.afterConsecutiveLosses > 0) && (
            <>
              <Separator />
              <div className="px-5 py-4 space-y-2.5">
                <SectionTitle>Behavioural</SectionTitle>
                {behavioural.isRevengeTrade && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/20">
                    <AlertTriangle className="h-3.5 w-3.5 text-[var(--warning)] flex-shrink-0" />
                    <span className="text-xs font-medium text-[var(--warning)]">Revenge Trade ⚠</span>
                  </div>
                )}
                {behavioural.isOvertrade && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/20">
                    <AlertTriangle className="h-3.5 w-3.5 text-[var(--warning)] flex-shrink-0" />
                    <span className="text-xs font-medium text-[var(--warning)]">Overtrading ⚠</span>
                  </div>
                )}
                {behavioural.afterConsecutiveLosses > 0 && (
                  <p className="text-xs text-muted-foreground">
                    After {behavioural.afterConsecutiveLosses} consecutive loss{behavioural.afterConsecutiveLosses === 1 ? "" : "es"}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Section 7 — Stop Loss Management */}
          {(slMgmt.wasMovedToBreakeven || slMgmt.wasTrailed) && (
            <>
              <Separator />
              <div className="px-5 py-4 space-y-2.5">
                <SectionTitle>SL Management</SectionTitle>
                {slMgmt.wasMovedToBreakeven && (
                  <p className="text-xs text-[var(--profit)]">✓ Moved to breakeven</p>
                )}
                {slMgmt.wasTrailed && (
                  <p className="text-xs text-[var(--profit)]">✓ Trailed stop loss</p>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Section 8 — Journal */}
          <div className="px-5 py-4 space-y-5">
            <SectionTitle>Journal</SectionTitle>

            {/* Quality rating */}
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Setup Quality</p>
              <GradeStars
                value={trade.setupQualityRating ?? 0}
                onChange={handleGradeChange}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Setup Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {(trade.tags ?? []).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    {tag}
                    <X className="h-2.5 w-2.5" />
                  </button>
                ))}
                {SETUP_TAGS.filter((s) => !(trade.tags ?? []).includes(s)).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleTagToggle(opt)}
                    className="px-2 py-0.5 rounded-md text-xs border border-border text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Notes</p>
                {savedNote && (
                  <span className="text-[10px] text-[var(--profit)]">Saved ✓</span>
                )}
              </div>
              <Textarea
                key={trade._id}
                defaultValue={trade.note ?? ""}
                onChange={handleNoteChange}
                rows={4}
                placeholder={"What did you observe?\nWhat went well?\nWhat would you do differently?"}
                className="bg-background border-border resize-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* ── Sticky actions ─────────────────────────── */}
        <div className="px-5 py-4 border-t border-border flex-shrink-0 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-border"
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
            Close
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5 ml-auto"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tag / change strategy modal */}
      <TagStrategyModal
        open={tagStrategyOpen}
        onClose={() => setTagStrategyOpen(false)}
        trade={trade}
        account={account}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this trade?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The trade and all its journal data will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
