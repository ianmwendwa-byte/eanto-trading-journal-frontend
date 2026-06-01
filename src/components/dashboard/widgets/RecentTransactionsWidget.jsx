import { Link } from "react-router-dom";
import {
  ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown,
  RefreshCw, Minus, Trophy, Gift, DollarSign, Plus,
} from "lucide-react";
import { WidgetSkeleton } from "@/components/dashboard/WidgetSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency, formatRelativeTime } from "@/utils/format";
import { getTransactionColorClass } from "@/utils/dashboardHelpers";
import { cn } from "@/lib/utils";

const TX_CONFIG = {
  deposit:             { icon: ArrowDownLeft, label: "Deposit" },
  withdrawal:          { icon: ArrowUpRight,  label: "Withdrawal" },
  trade_profit:        { icon: TrendingUp,    label: "Trade Win" },
  trade_loss:          { icon: TrendingDown,  label: "Trade Loss" },
  swap:                { icon: RefreshCw,     label: "Swap" },
  commission:          { icon: Minus,         label: "Commission" },
  prop_challenge_fee:  { icon: Trophy,        label: "Challenge Fee" },
  payout:              { icon: Gift,          label: "Payout" },
  adjustment_increase: { icon: Plus,          label: "Adjustment +" },
  adjustment_decrease: { icon: Minus,         label: "Adjustment −" },
};

const TxRow = ({ tx }) => {
  const config    = TX_CONFIG[tx.type] ?? { icon: DollarSign, label: tx.type };
  const Icon      = config.icon;
  const colorClass = getTransactionColorClass(tx.type);
  const accountName = tx.accountId?.name ?? "Unknown";

  return (
    <div className="flex items-center gap-3 py-2">
      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0", `${colorClass}/10`)}>
        <Icon className={cn("h-3.5 w-3.5", colorClass)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{config.label}</p>
        <p className="text-xs text-muted-foreground truncate">{accountName}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={cn("text-sm font-mono font-medium", colorClass)}>
          {formatCurrency(Math.abs(tx.amount ?? 0))}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {formatRelativeTime(tx.transactionDate ?? tx.createdAt)}
        </p>
      </div>
    </div>
  );
};

export const RecentTransactionsWidget = ({ data, isLoading }) => {
  if (isLoading) return <WidgetSkeleton size="medium" />;

  const transactions = data ?? [];

  return (
    <div className="trading-card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
          Recent Transactions
        </p>
      </div>

      {!transactions.length ? (
        <EmptyState
          icon={DollarSign}
          title="No recent transactions"
          description="Add a transaction to your account"
        />
      ) : (
        <>
          <div className="flex-1 space-y-0 divide-y divide-border/50">
            {transactions.slice(0, 5).map((tx) => (
              <TxRow key={tx._id} tx={tx} />
            ))}
          </div>
          <Link
            to="/transactions"
            className="text-xs text-primary hover:underline mt-3 block text-right"
          >
            View all →
          </Link>
        </>
      )}
    </div>
  );
};
