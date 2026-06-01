import { BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { WidgetSkeleton } from "@/components/dashboard/WidgetSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { tooltipStyle } from "@/lib/rechartsTheme";

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

export const PairPerformanceWidget = ({ data, isLoading }) => {
  if (isLoading) return <WidgetSkeleton size="medium" />;

  const pairs = (data ?? []).slice(0, 6).map((p) => ({
    pair:    p.pair,
    winRate: typeof p.winRate === "number"
      ? p.winRate * (p.winRate <= 1 ? 100 : 1)
      : 0,
    trades:  p.trades ?? p.totalTrades ?? 0,
  }));

  return (
    <div className="trading-card p-4 h-full">
      <div className="flex items-center gap-1.5 mb-3">
        <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
          Top Pairs
        </p>
      </div>

      {!pairs.length ? (
        <EmptyState
          icon={BarChart3}
          title="No pair data yet"
          description="Need 3+ trades per pair to show performance"
        />
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={pairs}
            layout="vertical"
            margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 10, fill: "#94a3b8", fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="pair"
              tick={{ fontSize: 10, fill: "#94a3b8", fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="winRate" radius={[0, 4, 4, 0]} maxBarSize={12}>
              {pairs.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.winRate >= 50 ? "var(--profit)" : "var(--loss)"}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
