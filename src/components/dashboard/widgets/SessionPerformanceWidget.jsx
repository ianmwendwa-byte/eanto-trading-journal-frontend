import { Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { WidgetSkeleton } from "@/components/dashboard/WidgetSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useTradeSessionStats } from "@/hooks/useTrades";
import { tooltipStyle } from "@/lib/rechartsTheme";
import { cn } from "@/lib/utils";

const SESSION_LABELS = {
  london:   "London",
  new_york: "New York",
  tokyo:    "Tokyo",
  sydney:   "Sydney",
  overlap:  "Overlap",
};

const WinRateTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className="font-mono text-muted-foreground">
        Win rate: {(payload[0]?.value ?? 0).toFixed(1)}%
      </p>
      {payload[0]?.payload?.totalTrades != null && (
        <p className="font-mono text-muted-foreground">
          Trades: {payload[0].payload.totalTrades}
        </p>
      )}
    </div>
  );
};

const getColor = (winRate) => {
  if (winRate >= 60) return "var(--profit)";
  if (winRate >= 50) return "var(--warning)";
  return "var(--loss)";
};

export const SessionPerformanceWidget = () => {
  const { data, isLoading } = useTradeSessionStats();

  if (isLoading) return <WidgetSkeleton size="medium" />;

  // Normalise — API may return array or { sessions: [] }
  const raw     = Array.isArray(data) ? data : (data?.sessions ?? []);
  const sessions = raw
    .map((s) => ({
      session:     SESSION_LABELS[s.session] ?? s.session,
      winRate:     typeof s.winRate === "number"
        ? s.winRate * (s.winRate <= 1 ? 100 : 1)
        : 0,
      totalTrades: s.totalTrades ?? s.trades ?? 0,
    }))
    .filter((s) => s.totalTrades > 0);

  return (
    <div className="trading-card p-4 h-full flex flex-col">
      <div className="flex items-center gap-1.5 mb-3">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
          Session Performance
        </p>
      </div>

      {!sessions.length ? (
        <EmptyState
          icon={Clock}
          title="No session data yet"
          description="Add trades with session tags to see this chart"
        />
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={sessions}
            layout="vertical"
            margin={{ top: 0, right: 8, left: 4, bottom: 0 }}
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
              dataKey="session"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <ReferenceLine x={50} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
            <Tooltip content={<WinRateTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="winRate" radius={[0, 4, 4, 0]} maxBarSize={14}>
              {sessions.map((s, i) => (
                <Cell key={i} fill={getColor(s.winRate)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
