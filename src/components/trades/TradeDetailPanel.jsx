import { useState, useRef, useCallback } from "react";
import { X, Trash2, Edit2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button }    from "@/components/ui/button";
import { Textarea }  from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DirectionBadge } from "./DirectionBadge";
import { OutcomeBadge }   from "./OutcomeBadge";
import { SessionBadge }   from "./SessionBadge";
import { GradeStars }     from "./GradeStars";
import { useUpdateTrade, useDeleteTrade } from "@/hooks/useTrades";
import { formatPnL, formatCurrency, getPnLColor } from "@/utils/format";
import { cn }  from "@/lib/utils";

const SETUP_OPTIONS = [
  "breakout", "trend_follow", "reversal", "range",
  "news", "scalp", "swing", "support_resistance", "fibonacci",
];

const MetaRow = ({ label, value, mono = false, className }) => (
  <div className="space-y-0.5">
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className={cn("text-sm text-foreground", mono && "font-mono", className)}>{value ?? "—"}</p>
  </div>
);

const formatDuration = (mins) => {
  if (mins == null) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const formatPrice = (v) => v != null ? Number(v).toFixed(5) : "—";

export const TradeDetailPanel = ({ trade, onClose, onDelete }) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [savedNote, setSavedNote]   = useState(false);
  const noteDebounce = useRef(null);

  const { mutate: updateTrade } = useUpdateTrade(trade?._id);
  const { mutate: deleteTrade, isPending: deleting } = useDeleteTrade();

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

  const pnl    = trade.pnl    ?? 0;
  const netPnl = trade.netPnl ?? pnl;
  const commission = trade.commission ?? 0;
  const swap       = trade.swap       ?? 0;

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-mono font-bold text-foreground">{trade.pair}</h2>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <DirectionBadge direction={trade.direction} />
                <OutcomeBadge   outcome={trade.outcome}    />
                <SessionBadge   session={trade.session}    />
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

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Execution metrics */}
          <div className="px-5 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <MetaRow label="Entry Price" value={formatPrice(trade.entryPrice)} mono />
              <MetaRow label="Exit Price"  value={formatPrice(trade.exitPrice)}  mono />
              <MetaRow label="Lot Size"    value={trade.lotSize?.toFixed(2)}     mono />
              <MetaRow label="Duration"    value={formatDuration(trade.durationMinutes)} />
              <MetaRow label="Opened" value={trade.openedAt ? format(new Date(trade.openedAt), "MMM d, HH:mm") : "—"} />
              <MetaRow label="Closed" value={trade.closedAt ? format(new Date(trade.closedAt), "MMM d, HH:mm") : "—"} />
              {trade.weekday && (
                <MetaRow label="Weekday" value={trade.weekday.charAt(0).toUpperCase() + trade.weekday.slice(1)} />
              )}
            </div>

            <Separator />

            {/* P&L Breakdown */}
            <div className="trading-card p-3 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Gross P&amp;L</span>
                <span className={cn("font-mono font-bold text-lg", getPnLColor(pnl))}>
                  {formatPnL(pnl)}
                </span>
              </div>
              {commission > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Commission</span>
                  <span className="font-mono text-muted-foreground">–{formatCurrency(commission)}</span>
                </div>
              )}
              {swap !== 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Swap</span>
                  <span className="font-mono text-muted-foreground">
                    {swap < 0 ? "–" : "+"}{formatCurrency(Math.abs(swap))}
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

            {/* RR + Risk */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {trade.realizedRR != null && (
                <MetaRow label="Realized RR" value={`${trade.realizedRR.toFixed(2)}R`} mono />
              )}
              {trade.plannedRR != null && (
                <MetaRow label="Planned RR"  value={`${trade.plannedRR.toFixed(2)}R`}  mono />
              )}
              {trade.riskPercent != null && (
                <MetaRow label="Risk %" value={`${trade.riskPercent.toFixed(2)}%`} mono />
              )}
              {trade.stopLoss != null && (
                <MetaRow label="Stop Loss"   value={formatPrice(trade.stopLoss)}   mono />
              )}
              {trade.takeProfit != null && (
                <MetaRow label="Take Profit" value={formatPrice(trade.takeProfit)} mono />
              )}
            </div>
          </div>

          <Separator />

          {/* Journal section */}
          <div className="px-5 py-4 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Journal
            </p>

            {/* Grade */}
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Grade</p>
              <GradeStars
                value={trade.setupQualityRating ?? 0}
                onChange={handleGradeChange}
              />
            </div>

            {/* Setup tags */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Setup</p>
              <div className="flex flex-wrap gap-1.5">
                {/* Active tags */}
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
                {/* Available options */}
                {SETUP_OPTIONS.filter((s) => !(trade.tags ?? []).includes(s)).map((opt) => (
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
                  <span className="text-[10px] text-[hsl(var(--profit))]">Saved ✓</span>
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

        {/* Sticky actions */}
        <div className="px-5 py-4 border-t border-border flex-shrink-0 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-border"
            onClick={() => onClose?.()}
          >
            <Edit2 className="h-3.5 w-3.5" />
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
