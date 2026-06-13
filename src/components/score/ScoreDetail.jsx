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

// ── Config ────────────────────────────────────────────────────────

const PILLAR_KEYS = ["consistency", "riskManagement", "profitability", "discipline", "growth"];

const PILLAR_META = {
  consistency: {
    label:      "Consistency",
    radarLabel: "Consistency",
    color:      "var(--primary)",
    tooltip:    "Measures how regularly you trade. Consistent trading across multiple days and weeks indicates discipline and reduces emotional decision-making.",
  },
  riskManagement: {
    label:      "Risk Management",
    radarLabel: "Risk",
    color:      "var(--warning)",
    tooltip:    "Evaluates your position sizing and drawdown control. Keeping risk per trade under 2% and total drawdown controlled is key to this pillar.",
  },
  profitability: {
    label:      "Profitability",
    radarLabel: "Profit",
    color:      "var(--profit)",
    tooltip:    "Based on your win rate, profit factor, and net P&L trend. A profit factor above 1.5 indicates a strong edge in the market.",
  },
  discipline: {
    label:      "Discipline",
    radarLabel: "Discipline",
    color:      "var(--info)",
    tooltip:    "Measures adherence to your trading rules. Revenge trading, overtrading, and impulsive entries reduce this score significantly.",
  },
  growth: {
    label:      "Growth",
    radarLabel: "Growth",
    color:      "var(--chart-5)",
    tooltip:    "Tracks improvement in your overall Business Score over time. Consistent upward trend in score earns points in this pillar.",
  },
};

const getPct = (pillar) => {
  if (!pillar || !pillar.maxScore) return 0;
  return Math.round((pillar.score / pillar.maxScore) * 100);
};

const barColor = (pct) => {
  if (pct >= 80) return "var(--profit)";
  if (pct >= 60) return "var(--primary)";
  if (pct >= 40) return "var(--warning)";
  return "var(--loss)";
};

const pctTextClass = (pct) => {
  if (pct >= 80) return "text-[var(--profit)]";
  if (pct >= 60) return "text-[color:var(--primary)]";
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
  progressing: "bg-[color:var(--primary)]/30",
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

// ── Section A: Pillar bars ────────────────────────────────────────

const PillarBars = ({ pillars }) => (
  <div className="space-y-5">
    {PILLAR_KEYS.map((key, idx) => {
      const pillar = pillars[key];
      if (!pillar) return null;
      const pct   = getPct(pillar);
      const meta  = PILLAR_META[key];
      const color = barColor(pct);
      const tCls  = pctTextClass(pct);

      return (
        <div key={key}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: meta.color }}
              />
              <span className="text-sm font-medium text-foreground">{meta.label}</span>
              <InfoTooltip content={meta.tooltip} />
            </div>
            <span className={cn("text-sm font-mono font-bold tabular-nums", tCls)}>
              {pct}%
            </span>
          </div>

          {/* Track */}
          <div className="relative h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: "easeOut", delay: idx * 0.08 }}
            />
          </div>
        </div>
      );
    })}
  </div>
);

// ── Section B: History Calendar ───────────────────────────────────

const HistoryCalendar = ({ history }) => {
  const cells = Array.isArray(history) ? [...history].reverse() : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
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
                        "w-9 h-9 rounded-lg flex-shrink-0 cursor-default border border-transparent",
                        "hover:border-[color:var(--primary)] transition-colors",
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
        <div className="flex gap-1.5" style={{ minWidth: "max-content" }}>
          {cells.map((snap, i) => (
            <div key={i} className="w-9 flex-shrink-0">
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
      <div className="flex flex-wrap items-center gap-3">
        {LEGEND_ITEMS.map(({ label, cls }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={cn("w-3 h-3 rounded-sm", cls)} />
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {cells.length < 3 && (
        <p className="text-xs text-muted-foreground italic">
          History builds over time — come back next week.
        </p>
      )}
    </div>
  );
};

// ── Section C: Insights ───────────────────────────────────────────

const InsightsSection = ({ pillars }) => {
  const [expanded, setExpanded] = useState(false);

  // Pillars with scores but no insights text → data not available yet
  const hasInsightData = PILLAR_KEYS.some((key) => pillars[key]?.insights?.length > 0);

  const lowPillars = PILLAR_KEYS.map((key) => {
    const pillar  = pillars[key];
    if (!pillar) return null;
    const pct     = getPct(pillar);
    const insight = pillar.insights?.[0] ?? null;
    return { key, pct, insight };
  })
    .filter((p) => p && p.pct < 75 && p.insight)
    .sort((a, b) => a.pct - b.pct);

  const visible = expanded ? lowPillars : lowPillars.slice(0, 3);
  const hidden  = Math.max(0, lowPillars.length - 3);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-heading font-semibold text-foreground">What to Improve</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Based on your trading data</p>
      </div>

      {!hasInsightData ? (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No insight data yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
            Insights will appear after your score has been calculated.
          </p>
        </div>
      ) : lowPillars.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <CheckCircle2 className="h-9 w-9 text-[var(--profit)] mb-3" />
          <p className="font-semibold text-foreground">All pillars performing well</p>
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut", delay: i * 0.06 }}
                className="flex gap-0 rounded-xl overflow-hidden border border-border bg-card"
              >
                {/* Left accent bar using pillar identity color */}
                <div
                  className="w-1 flex-shrink-0"
                  style={{ backgroundColor: meta.color }}
                />
                <div className="flex-1 p-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-2 inline-block"
                      style={{
                        color:      meta.color,
                        background: `color-mix(in srgb, ${meta.color} 15%, transparent)`,
                      }}
                    >
                      {meta.label}
                    </span>
                    <p className="text-sm text-foreground leading-relaxed">{insight}</p>
                  </div>
                  <span className={cn("font-mono text-sm font-bold shrink-0 mt-0.5", pctTextClass(pct))}>
                    {pct}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {!expanded && hidden > 0 && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-[color:var(--primary)] hover:underline"
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
    { pillar: "Risk",        score: getPct(pillars.riskManagement) },
    { pillar: "Profit",      score: getPct(pillars.profitability)  },
    { pillar: "Discipline",  score: getPct(pillars.discipline)     },
    { pillar: "Growth",      score: getPct(pillars.growth)         },
  ];

  return (
    <div className="space-y-4">
      {/* ── Card 1: Pillar bars + Radar ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
        className="trading-card p-6"
      >
        <div className="flex items-center gap-1.5 mb-5">
          <h2 className="font-heading font-semibold text-foreground">Pillar Breakdown</h2>
          <InfoTooltip content="Each pillar is scored 0–100 based on your trading behaviour. Hover a pillar name for details." />
        </div>

        {hasPillars ? (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Bars — constrained width */}
            <div className="w-full lg:w-52 flex-shrink-0">
              <PillarBars pillars={pillars} />
            </div>

            {/* Radar — takes remaining space */}
            <div className="flex-1 self-center min-w-0">
              <ResponsiveContainer width="100%" height={260} minWidth={200}>
                <RadarChart
                  data={radarData}
                  margin={{ top: 12, right: 32, bottom: 12, left: 32 }}
                >
                  <PolarGrid stroke="var(--border)" strokeOpacity={0.7} />
                  <PolarAngleAxis
                    dataKey="pillar"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontWeight: 500 }}
                  />
                  <Radar
                    dataKey="score"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.18}
                    strokeWidth={2}
                    dot={{ fill: "var(--primary)", r: 3, strokeWidth: 0 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No pillar data available.</p>
        )}
      </motion.div>

      {/* ── Cards 2 + 3: History | Insights (2-col on md+) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
          className="trading-card p-6"
        >
          <HistoryCalendar history={history} />
        </motion.div>

        {hasPillars && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.32 }}
            className="trading-card p-6"
          >
            <InsightsSection pillars={pillars} />
          </motion.div>
        )}
      </div>
    </div>
  );
};
