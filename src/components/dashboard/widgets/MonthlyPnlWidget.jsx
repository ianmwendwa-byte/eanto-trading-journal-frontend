import { BarChart2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { WidgetSkeleton } from "@/components/dashboard/WidgetSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useTradeMonthlyStats } from "@/hooks/useTrades";
import { tooltipStyle } from "@/lib/rechartsTheme";

const PnlTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className="font-mono" style={{ color: val >= 0 ? "var(--profit)" : "var(--loss)" }}>
        {val >= 0 ? "+" : ""}${val.toFixed(2)}
      </p>
    </div>
  );
};

const formatMonth = (monthStr) => {
  if (!monthStr) return "";
  const [year, month] = String(monthStr).split("-");
  return new Date(Number(year), Number(month) - 1)
    .toLocaleString("default", { month: "short" });
};

export const MonthlyPnlWidget = () => {
  const { data, isLoading } = useTradeMonthlyStats();

  if (isLoading) return <WidgetSkeleton size="medium" />;

  // Normalise — API may return array or { monthly: [] }
  // Stats endpoint returns { year, month (number), totalPnl }
  // Dashboard overview returns { month: "YYYY-MM", pnl }
  const raw     = Array.isArray(data) ? data : (data?.monthly ?? data?.months ?? []);
  const monthly = raw
    .map((m) => {
      const rawMonth = m.month ?? m.yearMonth;
      const monthStr =
        rawMonth && typeof rawMonth === "string" && rawMonth.includes("-")
          ? rawMonth
          : m.year && rawMonth
          ? `${m.year}-${String(rawMonth).padStart(2, "0")}`
          : null;
      return {
        month: monthStr,
        label: formatMonth(monthStr),
        pnl:   m.pnl ?? m.netPnl ?? m.totalPnl ?? 0,
      };
    })
    .filter((m) => m.month)
    .slice(-12);

  return (
    <div className="trading-card p-4 h-full flex flex-col">
      <div className="flex items-center gap-1.5 mb-3">
        <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
          Monthly P&L
        </p>
      </div>

      {!monthly.length ? (
        <EmptyState
          icon={BarChart2}
          title="No monthly data yet"
          description="Trade for at least one full month to see this chart"
        />
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthly} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8", fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                `${Math.abs(v) >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`}`
              }
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
            <Tooltip content={<PnlTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]} maxBarSize={28}>
              {monthly.map((m, i) => (
                <Cell
                  key={i}
                  fill={m.pnl >= 0 ? "var(--profit)" : "var(--loss)"}
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
