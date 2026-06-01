import { Target } from "lucide-react";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { WidgetSkeleton } from "@/components/dashboard/WidgetSkeleton";
import { cn } from "@/lib/utils";

const getWinRateColor = (winRate) => {
  if (winRate >= 60) return "text-[var(--profit)]";
  if (winRate >= 50) return "text-[var(--warning)]";
  return "text-[var(--loss)]";
};

export const WinRateWidget = ({ data, isLoading }) => {
  if (isLoading) return <WidgetSkeleton size="small" />;

  const winRate   = data?.winRate   ?? null;
  const wins      = data?.wins      ?? 0;
  const losses    = data?.losses    ?? 0;
  const totalTrades = data?.totalTrades ?? 0;

  return (
    <div className="trading-card p-4 h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-medium">Win Rate</p>
        </div>
        <InfoTooltip
          content={`Percentage of trades that were winners. Based on ${totalTrades} total trades.`}
        />
      </div>

      {winRate === null || totalTrades === 0 ? (
        <div className="mt-2">
          <p className="text-2xl font-bold font-mono text-muted-foreground">—</p>
          <p className="text-xs text-muted-foreground mt-1">No trades yet</p>
        </div>
      ) : (
        <div className="mt-2">
          <p className={cn("text-2xl font-bold font-mono", getWinRateColor(winRate))}>
            {winRate.toFixed(1)}%
          </p>
          <p className="text-xs font-mono mt-1 text-muted-foreground">
            <span className="text-[var(--profit)]">{wins}W</span>
            {" / "}
            <span className="text-[var(--loss)]">{losses}L</span>
          </p>
        </div>
      )}
    </div>
  );
};
