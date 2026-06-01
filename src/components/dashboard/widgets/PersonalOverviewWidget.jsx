import { Wallet } from "lucide-react";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { WidgetSkeleton } from "@/components/dashboard/WidgetSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency, formatPercent } from "@/utils/format";
import { getPnLColorClass } from "@/utils/dashboardHelpers";
import { cn } from "@/lib/utils";

export const PersonalOverviewWidget = ({ data, isLoading }) => {
  if (isLoading) return <WidgetSkeleton size="medium" />;

  if (!data || data.accountCount === 0) {
    return (
      <div className="trading-card p-4 h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
              Personal Portfolio
            </p>
          </div>
          <InfoTooltip content="Your personal trading capital across normal and war accounts. This is your real money." />
        </div>
        <EmptyState
          icon={Wallet}
          title="No personal accounts yet"
          description="Add a Normal or War account"
        />
      </div>
    );
  }

  const pnlColor = getPnLColorClass(data.totalPnl);

  return (
    <div className="trading-card p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            Personal Portfolio
          </p>
        </div>
        <InfoTooltip content="Your personal trading capital across normal and war accounts. This is your real money." />
      </div>

      {/* Main stat */}
      <p className="text-2xl font-bold font-mono text-foreground leading-none">
        {formatCurrency(data.totalCapital)}
      </p>

      {/* Return row */}
      <div className="flex items-center gap-3 mt-2">
        <span className={cn("text-sm font-mono font-medium", pnlColor)}>
          {data.totalPnl >= 0 ? "+" : ""}
          {formatCurrency(data.totalPnl)}
        </span>
        <span className={cn("text-xs font-mono", pnlColor)}>
          {formatPercent(data.returnPercent)}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Normal</p>
          <p className="text-sm font-mono font-medium text-foreground">{data.normalCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">War</p>
          <p className="text-sm font-mono font-medium text-foreground">{data.warCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-sm font-mono font-medium text-foreground">{data.accountCount}</p>
        </div>
      </div>
    </div>
  );
};
