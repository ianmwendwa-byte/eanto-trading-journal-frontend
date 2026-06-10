import { useState } from "react";
import { Zap, Search, Scale, Calendar, Loader2 } from "lucide-react";
import { Button }    from "@/components/ui/button";
import { Textarea }  from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatPnL, formatCurrency, getPnLColor } from "@/utils/format";
import { cn } from "@/lib/utils";

const TYPE_META = {
  pnl_mismatch:  { icon: Zap,      label: "P&L Mismatch",             color: "text-[var(--warning)]" },
  orphaned_tx:   { icon: Search,    label: "Unmatched Transaction",     color: "text-primary"           },
  balance_gap:   { icon: Scale,     label: "Balance Gap",               color: "text-[var(--loss)]"    },
  time_gap:      { icon: Calendar,  label: "Gap in Trading History",    color: "text-muted-foreground"  },
};

const Row = ({ label, value, valueClass }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className={cn("font-mono font-medium", valueClass)}>{value ?? "—"}</span>
  </div>
);

// ── Resolved overlay ──────────────────────────────────────────
const ResolvedOverlay = () => (
  <div className="absolute inset-0 rounded-xl bg-background/70 flex items-center justify-center">
    <span className="text-xs font-medium text-[var(--profit)] flex items-center gap-1.5">
      <span className="text-base">✓</span> Resolved
    </span>
  </div>
);

// ── Card types ────────────────────────────────────────────────
const PnlMismatchCard = ({ anomaly, onResolve, isPending }) => (
  <>
    <div className="space-y-1.5">
      <Row
        label="MT5 P&L"
        value={anomaly.mt5Value != null ? formatPnL(anomaly.mt5Value) : "—"}
        valueClass={getPnLColor(anomaly.mt5Value)}
      />
      <Row
        label="Kraviq P&L"
        value={anomaly.kraviqValue != null ? formatPnL(anomaly.kraviqValue) : "—"}
        valueClass={getPnLColor(anomaly.kraviqValue)}
      />
      <Separator />
      <Row
        label="Difference"
        value={anomaly.difference != null ? formatPnL(anomaly.difference) : "—"}
        valueClass={cn("font-bold", getPnLColor(anomaly.difference))}
      />
    </div>
    <div className="flex gap-2 pt-1">
      <Button
        size="sm"
        className="flex-1 h-8 text-xs"
        onClick={() => onResolve("accepted_mt5")}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Accept MT5 value"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="flex-1 h-8 text-xs"
        onClick={() => onResolve("kept_kraviq")}
        disabled={isPending}
      >
        Keep Kraviq value
      </Button>
    </div>
  </>
);

const OrphanedTxCard = ({ anomaly, onResolve, isPending }) => (
  <>
    <p className="text-xs text-muted-foreground">
      A transaction in your records has no matching entry in your MT5 history.
    </p>
    <Row
      label="Amount"
      value={anomaly.kraviqValue != null ? formatCurrency(Math.abs(anomaly.kraviqValue)) : "—"}
    />
    <div className="flex gap-2 pt-1">
      <Button
        size="sm"
        className="flex-1 h-8 text-xs"
        onClick={() => onResolve("marked_valid")}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "This is valid"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="flex-1 h-8 text-xs"
        onClick={() => onResolve("kept_kraviq")}
        disabled={isPending}
      >
        Remove it
      </Button>
    </div>
  </>
);

const BalanceGapCard = ({ anomaly, onResolve, isPending }) => (
  <>
    <p className="text-xs text-muted-foreground">
      Your rebuilt balance does not match MT5. Usually caused by swap or commission not fully captured.
    </p>
    <div className="space-y-1.5">
      <Row
        label="MT5 Balance"
        value={anomaly.mt5Value != null ? formatCurrency(anomaly.mt5Value) : "—"}
      />
      <Row
        label="Rebuilt Balance"
        value={anomaly.kraviqValue != null ? formatCurrency(anomaly.kraviqValue) : "—"}
      />
      <Separator />
      <Row
        label="Gap"
        value={anomaly.difference != null ? formatCurrency(Math.abs(anomaly.difference)) : "—"}
        valueClass="text-[var(--loss)]"
      />
    </div>
    <div className="flex gap-2 pt-1">
      <Button
        size="sm"
        className="flex-1 h-8 text-xs"
        onClick={() => onResolve("marked_adjustment")}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Create adjustment"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="flex-1 h-8 text-xs"
        onClick={() => onResolve("marked_valid")}
        disabled={isPending}
      >
        Mark as valid
      </Button>
    </div>
  </>
);

const TimeGapCard = ({ anomaly, onResolve, isPending }) => {
  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <>
      <p className="text-xs text-muted-foreground">No trades recorded between these dates, but your balance changed.</p>
      <div className="space-y-1.5">
        <Row label="From" value={fmt(anomaly.gapStartDate)} />
        <Row label="To"   value={fmt(anomaly.gapEndDate)}   />
        {anomaly.difference != null && (
          <Row
            label="Balance change"
            value={formatPnL(anomaly.difference)}
            valueClass={getPnLColor(anomaly.difference)}
          />
        )}
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          className="flex-1 h-8 text-xs"
          onClick={() => onResolve("marked_valid")}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "No trades — I took a break"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-8 text-xs"
          onClick={() => onResolve("marked_valid", "user flagged gap")}
          disabled={isPending}
        >
          I have missing trades
        </Button>
      </div>
    </>
  );
};

// ── Main AnomalyCard ──────────────────────────────────────────
export const AnomalyCard = ({ anomaly, onResolve: onResolveProp }) => {
  const [isPending, setIsPending] = useState(false);
  const meta = TYPE_META[anomaly.type] ?? TYPE_META.pnl_mismatch;
  const Icon = meta.icon;
  const isResolved = anomaly.status !== "pending";

  const handleResolve = (resolution, note) => {
    setIsPending(true);
    onResolveProp?.({ anomalyId: anomaly._id, resolution, note })
      ?.finally?.(() => setIsPending(false));
  };

  return (
    <div className="relative trading-card p-4 space-y-3">
      {isResolved && <ResolvedOverlay />}

      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4 flex-shrink-0", meta.color)} />
          <p className="text-sm font-semibold text-foreground">{meta.label}</p>
        </div>
        {anomaly.ticketNumber && (
          <span className="text-[10px] font-mono text-muted-foreground">
            #{anomaly.ticketNumber}
          </span>
        )}
      </div>

      {/* Type-specific body */}
      {anomaly.type === "pnl_mismatch"  && <PnlMismatchCard  anomaly={anomaly} onResolve={handleResolve} isPending={isPending && !isResolved} />}
      {anomaly.type === "orphaned_tx"   && <OrphanedTxCard   anomaly={anomaly} onResolve={handleResolve} isPending={isPending && !isResolved} />}
      {anomaly.type === "balance_gap"   && <BalanceGapCard   anomaly={anomaly} onResolve={handleResolve} isPending={isPending && !isResolved} />}
      {anomaly.type === "time_gap"      && <TimeGapCard      anomaly={anomaly} onResolve={handleResolve} isPending={isPending && !isResolved} />}
    </div>
  );
};
