import {
  ArrowDownToLine, ArrowUpFromLine, TrendingUp, TrendingDown,
  Repeat2, DollarSign, MinusCircle, PlusCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { formatCurrency, formatRelativeTime, getPnLColor } from "@/utils/format";
import { cn } from "@/lib/utils";

const POSITIVE_TYPES = new Set([
  "deposit", "payout", "trade_profit", "adjustment_increase",
]);

const TYPE_CONFIG = {
  deposit:             { icon: ArrowDownToLine, label: "Deposit" },
  withdrawal:          { icon: ArrowUpFromLine, label: "Withdrawal" },
  payout:              { icon: DollarSign,      label: "Payout" },
  trade_profit:        { icon: TrendingUp,      label: "Trade Win" },
  trade_loss:          { icon: TrendingDown,    label: "Trade Loss" },
  swap:                { icon: Repeat2,         label: "Swap" },
  commission:          { icon: MinusCircle,     label: "Commission" },
  prop_challenge_fee:  { icon: MinusCircle,     label: "Challenge Fee" },
  adjustment_increase: { icon: PlusCircle,      label: "Adjustment +" },
  adjustment_decrease: { icon: MinusCircle,     label: "Adjustment −" },
};

const ActivityRow = ({ tx }) => {
  const isPositive = POSITIVE_TYPES.has(tx.type);
  const config     = TYPE_CONFIG[tx.type] ?? { icon: DollarSign, label: tx.type };
  const Icon       = config.icon;

  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
        isPositive
          ? "bg-[var(--profit)]/10 text-[var(--profit)]"
          : "bg-[var(--loss)]/10 text-[var(--loss)]"
      )}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{config.label}</p>
        <p className="text-xs text-muted-foreground">{formatRelativeTime(tx.createdAt)}</p>
      </div>
      <p className={cn("text-sm font-mono font-medium flex-shrink-0", getPnLColor(isPositive ? 1 : -1))}>
        {isPositive ? "+" : "−"}{formatCurrency(Math.abs(tx.amount ?? 0))}
      </p>
    </div>
  );
};

export const RecentActivityList = ({ transactions, isLoading, isError, onRetry }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-7 w-7 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="Failed to load transactions"
        onRetry={onRetry}
        className="py-6"
      />
    );
  }

  const items = transactions ?? [];

  if (!items.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No recent activity
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((tx) => (
        <ActivityRow key={tx._id} tx={tx} />
      ))}
    </div>
  );
};
