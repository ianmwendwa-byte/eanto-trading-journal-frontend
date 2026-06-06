import { useState } from "react";
import { motion } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from "recharts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle2 } from "lucide-react";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { cn } from "@/lib/utils";
import { BAND_CONFIG } from "./ScoreDial";

// ── Shared config ─────────────────────────────────────────────────

const PILLAR_KEYS = ["consistency", "riskManagement", "profitability", "discipline", "growth"];

const PILLAR_META = {
  consistency: {
    label: "Consistency",
    radarLabel: "Consistency",
    badgeBg: "bg-blue-500/20",
    badgeText: "text-blue-400",
    tooltip: "Measures how regularly you trade. Consistent trading across multiple days and weeks indicates discipline and reduces emotional decision-making.",
  },
  riskManagement: {
    label: "Risk Management",
    radarLabel: "Risk",
    badgeBg: "bg-orange-500/20",
    badgeText: "text-orange-400",
    tooltip: "Evaluates your position sizing and drawdown control. Keeping risk per trade under 2% and total drawdown controlled is key to this pillar.",
  },
  profitability: {
    label: "Profitability",
    radarLabel: "Profit",
    badgeBg: "bg-[var(--profit)]/20",
    badgeText: "text-[var(--profit)]",
    tooltip: "Based on your win rate, profit factor, and net P&L trend. A profit factor above 1.5 indicates a strong edge in the market.",
  },
  discipline: {
    label: "Discipline",
    radarLabel: "Discipline",
    badgeBg: "bg-primary/20",
    badgeText: "text-[var(--primary)]",
    tooltip: "Measures adherence to your trading rules. Revenge trading, overtrading, and impulsive entries reduce this score significantly.",
  },
  growth: {
    label: "Growth",
    radarLabel: "Growth",
    badgeBg: "bg-purple-500/20",
    badgeText: "text-purple-400",
    tooltip: "Tracks improvement in your overall Business Score over time. Consistent upward trend in score earns points in this pillar.",
  },
};

const getPct = (pillar) =>
  pillar?.percentage ??
  (pillar?.maxScore > 0 ? Math.round((pillar.score / pillar.maxScore) * 100) : 0);

const barColor = (pct) => {
  if (pct >= 80) return "hsl(var(--profit))";
  if (pct >= 60) return "hsl(var(--primary))";
  if (pct >= 40) return "hsl(var(--warning))";
  return "hsl(var(--loss))";
};

const pctTextClass = (pct) => {
  if (pct >= 80) return "text-[var(--profit)]";
  if (pct >= 60) return "text-[var(--primary)]";
  if (pct >= 40) return "text-[var(--warning)]";
  return "text-[var(--loss)]";
};

// ── Calendar helpers ──────────────────────────────────────────────

const getBandKey = (score) => {
  if (score == null) return null;
  if (score <= 20) return "needs_work";
  if (score <= 40) return "developing";
  if (score <= 60) return "progressing";
  if (score <= 80) return "solid";
  return "elite";
};

const CALENDAR_COLORS = {
  needs_work:  "bg-[var(--loss)]/30",
  developing:  "bg-[var(--warning)]/30",
  progressing: "bg-[var(--primary)]/30",
  solid:       "bg-[var(--profit)]/40",
  elite:       "bg-[var(--profit)]/70",
};

const LEGEND_ITEMS = [
  { label: "No data", cls: "bg-muted" },
  { label: "0–20",    cls: CALENDAR_COLORS.needs_work  },
  { label: "21–40",   cls: CALENDAR_COLORS.developing  },
  { label: "41–60",   cls: CALENDAR_COLORS.progressing },
  { label: "61+",     cls: CALENDAR_COLORS.solid       },
];

const weekLabel = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ── Section A: Pillar Bars ────────────────────────────────────────

const PillarBars = ({ pillars }) => (
  <div className="space-y-4">
    {PILLAR_KEYS.map((key, idx) => {
      const pillar = pillars[key];
      if (!pillar) return null;
      const pct    = getPct(pillar);
      const meta   = PILLAR_META[key];
      const color  = barColor(pct);
      const tClass = pctTextClass(pct);

      return (
        <div key={key} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-foreground">{meta.label}</span>
              <InfoTooltip content={meta.tooltip} />
            </div>
            <span className={cn("text-sm font-mono font-bold", tClass)}>{pct}</span>
          </div>

          <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              whileInView={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
              viewport={{ once: true }}
            />
          </div>
        </div>
      );
    })}
  </div>
);

// ── Section B: History Calendar ───────────────────────────────────

const HistoryCalendar = ({ history }) => {
  // history arrives newest-first; display oldest on left
  const cells = Array.isArray(history) ? [...history].reverse() : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-semibold text-foreground">Score History</h3>
        <span className="text-xs text-muted-foreground">Last 12 weeks</span>
      </div>

      <div className="overflow-x-auto">
        <TooltipProvider>
          <div className="flex gap-1.5" style={{ minWidth: "max-content" }}>
            {(cells.length > 0 ? cells : Array.from({ length: 12 })).map((snap, i) => {
              const sc       = snap?.overall ?? snap?.score ?? null;
              const bandKey  = getBandKey(sc);
              const colorCls = bandKey ? CALENDAR_COLORS[bandKey] : "bg-muted";
              const label    = weekLabel(snap?.weekEnding);

              return (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "w-8 h-8 rounded flex-shrink-0 cursor-default border border-transparent hover:border-primary transition-colors",
                        colorCls
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {label ? (
                      <>
                        <p className="text-xs font-medium">Week of {label}</p>
                        <p className="text-xs text-muted-foreground">
                          {sc != null
                            ? `Score: ${sc}${bandKey ? ` — ${BAND_CONFIG[bandKey]?.label}` : ""}`
                            : "No data"}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">No data</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>

      {/* Week labels */}
      {cells.length > 0 && (
        <div className="flex gap-1.5 mt-1" style={{ minWidth: "max-content" }}>
          {cells.map((snap, i) => (
            <div key={i} className="w-8 flex-shrink-0">
              {i % 3 === 0 && (
                <p className="text-[9px] text-muted-foreground truncate">
                  {weekLabel(snap?.weekEnding)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mt-3">
        {LEGEND_ITEMS.map(({ label, cls }) => (
          <div key={label} className="flex items-center gap-1">
            <div className={cn("w-3 h-3 rounded-sm", cls)} />
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {cells.length < 3 && (
        <p className="text-xs text-muted-foreground italic mt-2">
          History builds over time. Come back next week.
        </p>
      )}
    </div>
  );
};

// ── Section C: Insights ───────────────────────────────────────────

const InsightsSection = ({ pillars }) => {
  const [expanded, setExpanded] = useState(false);

  const lowPillars = PILLAR_KEYS.map((key) => {
    const pillar = pillars[key];
    if (!pillar) return null;
    const pct     = getPct(pillar);
    const insight = pillar.insights?.[0] ?? null;
    return { key, pct, insight };
  })
    .filter((p) => p && p.pct < 75 && p.insight)
    .sort((a, b) => a.pct - b.pct);

  const allGood = lowPillars.length === 0;
  const visible = expanded ? lowPillars : lowPillars.slice(0, 3);
  const hidden  = Math.max(0, lowPillars.length - 3);

  const accentColor = (pct) => {
    if (pct < 50) return "bg-[var(--loss)]";
    if (pct < 70) return "bg-[var(--warning)]";
    return "bg-muted-foreground";
  };

  return (
    <div>
      <div className="mb-3">
        <h3 className="font-heading font-semibold text-foreground">What to Improve</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Based on your trading data</p>
      </div>

      {allGood ? (
        <div className="flex flex-col items-center py-6 text-center">
          <CheckCircle2 className="h-8 w-8 text-[var(--profit)] mb-2" />
          <p className="font-medium text-foreground">All pillars performing well</p>
          <p className="text-sm text-muted-foreground mt-1">
            Keep up your consistent trading discipline.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map(({ key, pct, insight }, i) => {
            const meta = PILLAR_META[key];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut", delay: i * 0.08 }}
                viewport={{ once: true }}
                className="flex gap-0 rounded-lg overflow-hidden border border-border bg-card"
              >
                <div className={cn("w-1 flex-shrink-0", accentColor(pct))} />
                <div className="flex-1 p-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mb-1.5 inline-block",
                        meta.badgeBg,
                        meta.badgeText
                      )}
                    >
                      {meta.label}
                    </span>
                    <p className="text-sm text-foreground leading-relaxed">{insight}</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-muted-foreground shrink-0">
                    {pct}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {!expanded && hidden > 0 && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-primary hover:underline"
            >
              + {hidden} more improvement area{hidden !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main ScoreDetail ──────────────────────────────────────────────

export const ScoreDetail = ({ score, history }) => {
  const pillars    = score?.pillars ?? {};
  const hasPillars = Object.keys(pillars).length > 0;

  const radarData = [
    { pillar: "Consistency", score: getPct(pillars.consistency)    },
    { pillar: "Risk",         score: getPct(pillars.riskManagement) },
    { pillar: "Profit",       score: getPct(pillars.profitability)  },
    { pillar: "Discipline",   score: getPct(pillars.discipline)     },
    { pillar: "Growth",       score: getPct(pillars.growth)         },
  ];

  return (
    <div className="flex-1 min-w-0 space-y-4">
      {/* Section A: Radar + Pillar Bars */}
      <div className="trading-card p-6">
        <div className="flex items-center gap-1.5 mb-4">
          <h2 className="font-heading font-semibold text-foreground">Pillar Breakdown</h2>
          <InfoTooltip content="Each pillar is scored 0–100 based on your trading behavior. Hover any pillar name for details." />
        </div>

        {hasPillars ? (
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Radar chart */}
            <div className="flex-shrink-0 self-center">
              <ResponsiveContainer width={200} height={200}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="pillar"
                    tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Radar
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    dot={false}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Pillar bars */}
            <div className="flex-1 min-w-0">
              <PillarBars pillars={pillars} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No pillar data available.</p>
        )}
      </div>

      {/* Section B: History Calendar */}
      <div className="trading-card p-6">
        <HistoryCalendar history={history} />
      </div>

      {/* Section C: Insights */}
      {hasPillars && (
        <div className="trading-card p-6">
          <InsightsSection pillars={pillars} />
        </div>
      )}
    </div>
  );
};
