import { cn } from "@/lib/utils";
import { InfoTooltip } from "@/components/shared/InfoTooltip";

export const DrawdownBar = ({ current = 0, max = 10, className }) => {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0;

  const barColor =
    pct >= 70 ? "bg-[hsl(var(--loss))]"
    : pct >= 50 ? "bg-[hsl(var(--warning))]"
    : "bg-[hsl(var(--profit))]";

  const textColor =
    pct >= 70 ? "text-[hsl(var(--loss))]"
    : pct >= 50 ? "text-[hsl(var(--warning))]"
    : "text-muted-foreground";

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Drawdown</span>
          <InfoTooltip
            content="Current drawdown vs maximum allowed. Red zone means you are approaching your drawdown limit."
            side="top"
          />
        </div>
        <span className={cn("font-mono", textColor)}>
          {current.toFixed(1)}% / {max}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
