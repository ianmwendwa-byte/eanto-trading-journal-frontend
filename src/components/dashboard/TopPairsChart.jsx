import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className="font-mono text-muted-foreground">
        Win rate: {(payload[0].value ?? 0).toFixed(1)}%
      </p>
      {payload[0].payload.trades !== undefined && (
        <p className="font-mono text-muted-foreground">
          Trades: {payload[0].payload.trades}
        </p>
      )}
    </div>
  );
};

export const TopPairsChart = ({ pairStats, isLoading }) => {
  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-lg" />;
  }

  const pairs = (pairStats?.pairs ?? pairStats ?? [])
    .slice(0, 5)
    .map((p) => ({
      pair: p.pair,
      winRate: typeof p.winRate === "number" ? p.winRate * (p.winRate <= 1 ? 100 : 1) : 0,
      trades: p.trades ?? p.totalTrades ?? 0,
    }));

  if (!pairs.length) {
    return (
      <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
        No pair data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={pairs} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)", fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="pair"
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.6)", fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="winRate" radius={[0, 4, 4, 0]} maxBarSize={14}>
          {pairs.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.winRate >= 50 ? "hsl(var(--profit))" : "hsl(var(--loss))"}
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
