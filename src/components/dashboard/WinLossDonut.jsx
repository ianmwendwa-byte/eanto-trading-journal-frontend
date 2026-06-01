import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/ErrorState";

const SLICES = [
  { key: "wins",      label: "Win",       color: "var(--profit)" },
  { key: "losses",    label: "Loss",      color: "var(--loss)" },
  { key: "breakeven", label: "Breakeven", color: "var(--breakeven)" },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { label, value } = payload[0].payload;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{label}</p>
      <p className="font-mono text-muted-foreground">{value} trades</p>
    </div>
  );
};

export const WinLossDonut = ({ tradeStats, isLoading, isError, onRetry }) => {
  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-lg" />;
  }

  if (isError) {
    return (
      <ErrorState
        message="Failed to load chart data"
        onRetry={onRetry}
        className="min-h-[10rem]"
      />
    );
  }

  const data = SLICES.map((s) => ({
    label: s.label,
    value: tradeStats?.[s.key] ?? 0,
    color: s.color,
  })).filter((d) => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (!total) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
        No trade data yet
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={66}
            dataKey="value"
            strokeWidth={2}
            stroke="hsl(var(--card))"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-lg font-bold font-mono text-foreground">{total}</p>
          <p className="text-[10px] text-muted-foreground">trades</p>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-1">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
};
