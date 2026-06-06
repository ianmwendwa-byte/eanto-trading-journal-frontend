import { Link, useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WidgetSkeleton } from "@/components/dashboard/WidgetSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatPnL, formatRelativeTime } from "@/utils/format";
import { getPnLColorClass } from "@/utils/dashboardHelpers";
import { cn } from "@/lib/utils";

const DirectionBadge = ({ direction }) => (
  <Badge
    variant="outline"
    className={cn(
      "text-[10px] px-1.5 py-0 h-4",
      direction === "buy"
        ? "text-[var(--profit)] border-[var(--profit)]/30 bg-[var(--profit)]/10"
        : "text-[var(--loss)] border-[var(--loss)]/30 bg-[var(--loss)]/10"
    )}
  >
    {direction === "buy" ? "▲ BUY" : "▼ SELL"}
  </Badge>
);

const TradeRow = ({ trade }) => {
  const pnl      = trade.netPnl ?? trade.pnl ?? 0;
  const pnlColor = getPnLColorClass(pnl);
  const accountName = trade.accountId?.name ?? "Unknown";

  return (
    <Link to={`/trades?trade=${trade._id}`}>
      <div className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono font-semibold text-foreground truncate">
            {trade.pair}
          </p>
          <p className="text-xs text-muted-foreground truncate">{accountName}</p>
        </div>
        <DirectionBadge direction={trade.direction} />
        <div className="text-right shrink-0">
          <p className={cn("text-sm font-mono font-medium", pnlColor)}>
            {formatPnL(pnl)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {formatRelativeTime(trade.closedAt)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export const RecentTradesWidget = ({ data, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) return <WidgetSkeleton size="medium" />;

  const trades = data ?? [];

  return (
    <div className="trading-card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            Recent Trades
          </p>
        </div>
      </div>

      {!trades.length ? (
        <EmptyState
          icon={TrendingUp}
          title="No recent trades"
          description="Add your first trade to get started"
          action={
            <Button size="sm" onClick={() => navigate("/trades/add")}>
              Add Trade
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex-1 space-y-0 divide-y divide-border/50">
            {trades.slice(0, 5).map((trade) => (
              <TradeRow key={trade._id} trade={trade} />
            ))}
          </div>
          <Link
            to="/trades"
            className="text-xs text-primary hover:underline mt-3 block text-right"
          >
            View all trades →
          </Link>
        </>
      )}
    </div>
  );
};
