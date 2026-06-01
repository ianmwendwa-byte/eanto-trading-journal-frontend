import { Trophy } from "lucide-react";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { WidgetSkeleton } from "@/components/dashboard/WidgetSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/lib/utils";

export const PropOverviewWidget = ({ data, isLoading }) => {
  if (isLoading) return <WidgetSkeleton size="medium" />;

  if (!data || data.accountCount === 0) {
    return (
      <div className="trading-card p-4 h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
              Prop Firm Portfolio
            </p>
          </div>
          <InfoTooltip content="Your prop firm funded accounts. Total funded shows the firm's capital you are trading, not your money." />
        </div>
        <EmptyState
          icon={Trophy}
          title="No prop accounts yet"
          description="Add a Prop account to track your funded trading"
        />
      </div>
    );
  }

  return (
    <div className="trading-card p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            Prop Firm Portfolio
          </p>
        </div>
        <InfoTooltip content="Your prop firm funded accounts. Total funded shows the firm's capital you are trading, not your money." />
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground">Total Funded</p>
            <InfoTooltip content="Total capital funded by prop firms. This is the firm's money, not yours." />
          </div>
          <p className="text-xl font-bold font-mono text-foreground mt-0.5">
            {formatCurrency(data.totalFunded)}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground">Fees Invested</p>
            <InfoTooltip content="Total challenge fees you have paid" />
          </div>
          <p className="text-xl font-bold font-mono text-[var(--loss)] mt-0.5">
            {formatCurrency(data.totalInvested)}
          </p>
        </div>
      </div>

      {/* Challenge status row */}
      <div className="flex items-center gap-4 mt-2 pt-3 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-sm font-mono font-medium text-primary">{data.activeCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Passed</p>
          <p className="text-sm font-mono font-medium text-[var(--profit)]">{data.passedCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Failed</p>
          <p className="text-sm font-mono font-medium text-[var(--loss)]">{data.failedCount}</p>
        </div>
      </div>

      {/* Performance row */}
      {(data.combinedWinRate > 0 || data.combinedAvgRR > 0) && (
        <div className="flex items-center gap-4 mt-2">
          <div>
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className="text-sm font-mono font-medium text-foreground">
              {data.combinedWinRate?.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg R:R</p>
            <p className="text-sm font-mono font-medium text-foreground">
              {data.combinedAvgRR?.toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
