import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/lib/utils";

// Field names match the backend getTransactionSummary aggregation output exactly:
//   totalCount, totalDeposits, totalWithdrawals, totalPayouts, totalTradeProfit,
//   totalTradeLoss, totalSwap, totalCommission, totalPropFees, totalAdjustmentsUp,
//   totalAdjustmentsDown, netFlow, trueNetPnl, currentBalance
const STATS_CONFIG = [
  {
    key:     "total_deposits",
    label:   "Total Deposits",
    tooltip: "Sum of all deposits",
    field:   "totalDeposits",
    color:   () => "text-[var(--profit)]",
    format:  (v) => formatCurrency(v ?? 0),
  },
  {
    key:     "total_withdrawals",
    label:   "Total Withdrawals",
    tooltip: "Sum of all withdrawals",
    field:   "totalWithdrawals",
    color:   () => "text-[var(--loss)]",
    format:  (v) => formatCurrency(v ?? 0),
  },
  {
    key:     "net_flow",
    label:   "Net Flow",
    tooltip: "Net of all credits minus all debits (from API)",
    field:   "netFlow",
    color:   (v) => v > 0 ? "text-[var(--profit)]" : v < 0 ? "text-[var(--loss)]" : "text-muted-foreground",
    format:  (v) => formatCurrency(v ?? 0),
  },
  {
    key:     "true_net_pnl",
    label:   "True Net PnL",
    tooltip: "Trade profit minus trade losses, swap, commission, and prop fees (from API)",
    field:   "trueNetPnl",
    color:   (v) => v > 0 ? "text-[var(--profit)]" : v < 0 ? "text-[var(--loss)]" : "text-muted-foreground",
    format:  (v) => formatCurrency(v ?? 0),
  },
  {
    key:     "total_prop_fees",
    label:   "Prop Fees",
    tooltip: "Total challenge fees paid to prop firms",
    field:   "totalPropFees",
    color:   () => "text-[var(--loss)]",
    format:  (v) => formatCurrency(v ?? 0),
  },
  {
    key:     "total_payouts",
    label:   "Total Payouts",
    tooltip: "Total payouts received from prop firms",
    field:   "totalPayouts",
    color:   () => "text-[var(--profit)]",
    format:  (v) => formatCurrency(v ?? 0),
  },
  {
    key:     "total_swap",
    label:   "Total Swap",
    tooltip: "Total swap costs",
    field:   "totalSwap",
    color:   () => "text-[var(--loss)]",
    format:  (v) => formatCurrency(v ?? 0),
  },
  {
    key:     "total_commission",
    label:   "Commission",
    tooltip: "Total commission costs",
    field:   "totalCommission",
    color:   () => "text-[var(--loss)]",
    format:  (v) => formatCurrency(v ?? 0),
  },
  {
    key:     "current_balance",
    label:   "Current Balance",
    tooltip: "Balance after the most recent transaction (from API)",
    field:   "currentBalance",
    color:   () => "text-foreground",
    format:  (v) => formatCurrency(v ?? 0),
  },
  {
    key:     "transaction_count",
    label:   "Transactions",
    tooltip: "Total number of transactions in the filtered period",
    field:   "totalCount",
    color:   () => "text-foreground",
    format:  (v) => String(v ?? 0),
  },
];

const DEFAULT_VISIBLE = ["total_deposits", "total_withdrawals", "net_flow", "current_balance"];

export { DEFAULT_VISIBLE };

export const TransactionStats = ({
  summary,
  isLoading,
  visibleStats,
  onToggleStat,
}) => {
  const [showToggle, setShowToggle] = useState(false);
  const visible = STATS_CONFIG.filter((s) => visibleStats.includes(s.key));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
          Account Summary
        </p>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowToggle((v) => !v)}
          >
            <Settings2 className="h-3.5 w-3.5" />
          </Button>

          {showToggle && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowToggle(false)} />
              <div className="absolute right-0 top-8 z-50 bg-card border border-border rounded-xl p-3 shadow-lg w-56 space-y-2">
                <p className="text-xs font-medium text-muted-foreground pb-1">
                  Visible Stats
                </p>
                {STATS_CONFIG.map((stat) => (
                  <label
                    key={stat.key}
                    className="flex items-center gap-2.5 cursor-pointer py-0.5"
                  >
                    <Checkbox
                      checked={visibleStats.includes(stat.key)}
                      onCheckedChange={() => onToggleStat(stat.key)}
                    />
                    <span className="text-xs text-foreground">{stat.label}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="trading-card p-3.5 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))
          : visible.map((stat) => {
              const value = summary?.[stat.field] ?? null;
              const colorClass = stat.color(value);
              return (
                <div key={stat.key} className="trading-card p-3.5">
                  <div className="flex items-center gap-1 mb-1.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex-1 truncate">
                      {stat.label}
                    </p>
                    <InfoTooltip content={stat.tooltip} />
                  </div>
                  <p className={cn("text-xl font-mono font-bold leading-none", colorClass)}>
                    {value !== null ? stat.format(value) : "—"}
                  </p>
                </div>
              );
            })}
      </div>
    </div>
  );
};
