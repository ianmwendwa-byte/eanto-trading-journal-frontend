import { BarChart2 } from "lucide-react";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { WidgetSkeleton } from "@/components/dashboard/WidgetSkeleton";
import { cn } from "@/lib/utils";

const getAvgRRColor = (rr) => {
  if (rr >= 2.0) return "text-[var(--profit)]";
  if (rr >= 1.0) return "text-[var(--warning)]";
  return "text-[var(--loss)]";
};

export const AvgRRWidget = ({ data, isLoading }) => {
  if (isLoading) return <WidgetSkeleton size="small" />;

  const avgRR = data?.avgRR ?? null;

  return (
    <div className="trading-card p-4 h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-medium">Avg R:R</p>
        </div>
        <InfoTooltip
          content="Average reward to risk ratio. 1.5:1 means you earn $1.50 for every $1 risked."
        />
      </div>

      {!avgRR ? (
        <div className="mt-2">
          <p className="text-2xl font-bold font-mono text-muted-foreground">—</p>
          <p className="text-xs text-muted-foreground mt-1">No trades yet</p>
        </div>
      ) : (
        <div className="mt-2">
          <p className={cn("text-2xl font-bold font-mono", getAvgRRColor(avgRR))}>
            {avgRR.toFixed(2)}:1
          </p>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Reward to risk
          </p>
        </div>
      )}
    </div>
  );
};
