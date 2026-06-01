import { Calendar } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { WidgetSkeleton } from "@/components/dashboard/WidgetSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useTradeWeekdayStats } from "@/hooks/useTrades";
import { cn } from "@/lib/utils";

const DAY_ORDER  = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const DAY_LABELS = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed",
  thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun",
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

export const WeekdayPerformanceWidget = () => {
  const { data, isLoading } = useTradeWeekdayStats();

  if (isLoading) return <WidgetSkeleton size="medium" />;

  const raw      = Array.isArray(data) ? data : (data?.weekdays ?? []);
  const weekdays = DAY_ORDER
    .map((day) => {
      const found = raw.find((d) => d.weekday === day || d.day === day);
      return found
        ? {
            day:         DAY_LABELS[day] ?? day,
            winRate:     typeof found.winRate === "number"
              ? found.winRate * (found.winRate <= 1 ? 100 : 1)
              : 0,
            totalTrades: found.totalTrades ?? found.trades ?? 0,
          }
        : null;
    })
    .filter((d) => d && d.totalTrades > 0);

  return (
    <div className="trading-card p-4 h-full flex flex-col">
      <div className="flex items-center gap-1.5 mb-3">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
          Weekday Performance
        </p>
      </div>

      {!weekdays.length ? (
        <EmptyState
          icon={Calendar}
          title="No weekday data yet"
          description="Add more trades to see performance by day"
        />
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weekdays} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 10, fill: "#94a3b8", fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine y={50} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
            <Tooltip content={<WinRateTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="winRate" radius={[4, 4, 0, 0]} maxBarSize={28}>
              {weekdays.map((d, i) => (
                <Cell key={i} fill={getColor(d.winRate)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
