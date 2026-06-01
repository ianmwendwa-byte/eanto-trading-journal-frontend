import { TrendingUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { WidgetSkeleton } from "@/components/dashboard/WidgetSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useUserScoreHistory } from "@/hooks/useScore";

const BAND_LINES = [
  { y: 81, color: "rgba(245,158,11,0.4)"  },
  { y: 61, color: "rgba(34,197,94,0.4)"   },
  { y: 41, color: "rgba(23,61,237,0.4)"   },
  { y: 21, color: "rgba(245,158,11,0.4)"  },
];

const ScoreTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-mono font-medium text-foreground">
        {payload[0]?.value}/100
      </p>
    </div>
  );
};

const formatWeek = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const ScoreHistoryWidget = () => {
  const { data, isLoading } = useUserScoreHistory(12);

  if (isLoading) return <WidgetSkeleton size="medium" />;

  const history = Array.isArray(data) ? [...data].reverse() : [];
  const formatted = history.map((snap) => ({
    week:  formatWeek(snap.weekEnding),
    score: snap.overall ?? snap.score ?? 0,
  }));

  return (
    <div className="trading-card p-4 h-full flex flex-col">
      <div className="flex items-center gap-1.5 mb-3">
        <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
          Score History
        </p>
      </div>

      {!formatted.length ? (
        <EmptyState
          icon={TrendingUp}
          title="No score history yet"
          description="Score snapshots are saved weekly once you have 10+ trades"
        />
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={formatted} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#94a3b8", fontFamily: "JetBrains Mono" }}
              axisLine={false}
              tickLine={false}
            />
            {BAND_LINES.map(({ y, color }) => (
              <ReferenceLine
                key={y}
                y={y}
                stroke={color}
                strokeDasharray="3 3"
              />
            ))}
            <Tooltip content={<ScoreTooltip />} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ fill: "var(--primary)", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
