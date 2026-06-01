import { Zap } from "lucide-react";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { WidgetSkeleton } from "@/components/dashboard/WidgetSkeleton";
import { getStreakColorClass, formatStreakLabel } from "@/utils/dashboardHelpers";
import { cn } from "@/lib/utils";

export const StreakWidget = ({ data, isLoading }) => {
  if (isLoading) return <WidgetSkeleton size="small" />;

  const streak     = data?.currentStreak ?? 0;
  const bestStreak = data?.bestStreak    ?? 0;

  return (
    <div className="trading-card p-4 h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-medium">Streak</p>
        </div>
        <InfoTooltip
          content="Your current consecutive winning or losing streak. Green = winning streak, Red = losing streak."
        />
      </div>

      {streak === 0 ? (
        <div className="mt-2">
          <p className="text-2xl font-bold font-mono text-muted-foreground">—</p>
          <p className="text-xs text-muted-foreground mt-1">No active streak</p>
        </div>
      ) : (
        <div className="mt-2">
          <p className={cn("text-2xl font-bold font-mono", getStreakColorClass(streak))}>
            {Math.abs(streak)}
          </p>
          <p className={cn("text-xs font-mono mt-1", getStreakColorClass(streak))}>
            {formatStreakLabel(streak)}
          </p>
        </div>
      )}

      {bestStreak > 0 && (
        <p className="text-xs text-muted-foreground mt-2 font-mono">
          Best: {bestStreak}W
        </p>
      )}
    </div>
  );
};
