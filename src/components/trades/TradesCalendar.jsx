import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCalendarDays, getDayStats, getMonthSummary } from "@/utils/calendar";
import { formatPnL, getPnLColor } from "@/utils/format";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ── Color intensity helpers ────────────────────────────────────

const TYPE_HEX = {
  profit:    "#22C55E",
  loss:      "#EF4444",
  breakeven: "#6B7280",
};

// Color type is always driven by net P&L so that a big win covering
// multiple losses still shows as a profit day (green), not a loss day.
const getDominantType = ({ netPnl }) =>
  netPnl > 0 ? "profit" : netPnl < 0 ? "loss" : "breakeven";

const getDominantCount = (stats, type) =>
  type === "profit"    ? stats.wins
  : type === "loss"    ? stats.losses
  : (stats.breakeven || stats.count);

// Dynamic background + border via color-mix, scales with trade count
const buildCellStyle = (type, count, hovered = false) => {
  const hex = TYPE_HEX[type];
  // bg:     8% for 1 trade, +6.5% per extra trade, max 42%
  // border: 18% for 1 trade, +9%   per extra trade, max 68%
  const bgBase     = Math.min(8  + (count - 1) * 6.5, 42);
  const borderBase = Math.min(18 + (count - 1) * 9,   68);
  const bg     = hovered ? bgBase + 8      : bgBase;
  const border = hovered ? borderBase + 10 : borderBase;
  return {
    backgroundColor: `color-mix(in srgb, ${hex} ${bg.toFixed(0)}%, transparent)`,
    borderColor:     `color-mix(in srgb, ${hex} ${border.toFixed(0)}%, transparent)`,
  };
};

// ── Skeleton ──────────────────────────────────────────────────
export const CalendarSkeleton = () => (
  <div className="space-y-3">
    <div className="flex items-center justify-between px-1">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-6 w-36" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    <div className="grid grid-cols-7 gap-1">
      {WEEKDAYS.map((d) => (
        <div key={d} className="text-center py-2">
          <Skeleton className="h-3 w-8 mx-auto" />
        </div>
      ))}
      {Array.from({ length: 42 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-lg" />
      ))}
    </div>
  </div>
);

// ── Day Cell ──────────────────────────────────────────────────
const DayCell = ({ day, trades, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const stats = getDayStats(trades);

  if (!day.isCurrentMonth) {
    return (
      <div className="h-20 rounded-lg bg-muted/20 border border-transparent opacity-30 p-1.5">
        <span className="text-xs text-muted-foreground">{day.dayNumber}</span>
      </div>
    );
  }

  // Determine color based on dominant outcome type
  const dominantType  = stats ? getDominantType(stats) : null;
  const dominantCount = dominantType ? getDominantCount(stats, dominantType) : 0;
  const colorStyle    = stats ? buildCellStyle(dominantType, dominantCount, hovered) : {};

  const baseCellCls = cn(
    "h-20 rounded-lg border p-1.5 relative transition-colors duration-150",
    stats ? "cursor-pointer" : "bg-card/50 border-border/50"
  );

  const cell = (
    <div
      className={baseCellCls}
      style={colorStyle}
      onMouseEnter={() => stats && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={stats ? () => onClick?.(day.dateStr, trades) : undefined}
    >
      {/* Date number */}
      <div className="flex justify-between items-start">
        {day.isToday ? (
          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center leading-none">
            {day.dayNumber}
          </span>
        ) : (
          <span className={cn(
            "text-xs font-medium",
            day.isWeekend ? "text-muted-foreground/70" : "text-foreground"
          )}>
            {day.dayNumber}
          </span>
        )}
      </div>

      {stats && (
        <>
          {/* P&L pill */}
          <div className="flex justify-center mt-1">
            <span
              className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `color-mix(in srgb, ${TYPE_HEX[dominantType]} 15%, transparent)`,
                color: TYPE_HEX[dominantType],
              }}
            >
              {formatPnL(stats.netPnl)}
            </span>
          </div>

          {/* Bottom row — trade count + outcome dots */}
          <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between">
            <span className="text-[9px] text-muted-foreground">
              {stats.count}t
            </span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: Math.min(stats.wins, 4) }).map((_, i) => (
                <span key={`w${i}`} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TYPE_HEX.profit }} />
              ))}
              {Array.from({ length: Math.min(stats.losses, 4 - Math.min(stats.wins, 4)) }).map((_, i) => (
                <span key={`l${i}`} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TYPE_HEX.loss }} />
              ))}
              {stats.breakeven > 0 && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TYPE_HEX.breakeven }} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (!stats) return cell;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{cell}</TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={6}
          className="z-50 w-52 p-0 rounded-xl shadow-xl bg-popover text-popover-foreground border border-border overflow-hidden"
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-muted/30">
            <span className="text-xs font-semibold text-foreground">
              {format(day.date, "EEE, MMM d")}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {stats.count} trade{stats.count !== 1 ? "s" : ""}
            </span>
          </div>

          {/* W / L / B row */}
          <div className="flex items-center divide-x divide-border/60 border-b border-border/60">
            {[
              { label: "W", count: stats.wins,     color: TYPE_HEX.profit    },
              { label: "L", count: stats.losses,   color: TYPE_HEX.loss      },
              { label: "B", count: stats.breakeven, color: TYPE_HEX.breakeven },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex-1 flex flex-col items-center py-2 gap-0.5">
                <span className="text-sm font-bold font-mono" style={{ color }}>
                  {count}
                </span>
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* P&L stats */}
          <div className="px-3 py-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Net P&L</span>
              <span className="font-mono font-bold" style={{ color: stats.netPnl >= 0 ? TYPE_HEX.profit : TYPE_HEX.loss }}>
                {formatPnL(stats.netPnl)}
              </span>
            </div>
            {stats.bestTrade !== stats.worstTrade && (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Best trade</span>
                  <span className="font-mono" style={{ color: TYPE_HEX.profit }}>
                    {formatPnL(stats.bestTrade)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Worst trade</span>
                  <span className="font-mono" style={{ color: TYPE_HEX.loss }}>
                    {formatPnL(stats.worstTrade)}
                  </span>
                </div>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ── Month Summary Bar ─────────────────────────────────────────
const MonthSummaryBar = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <div className="trading-card p-3 flex items-center gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-6 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const pills = [
    {
      label: "Profitable Days",
      value: summary.profitableDays,
      cls:   "bg-[var(--profit)]/10 text-[var(--profit)] border-[var(--profit)]/20",
      tooltip: "Days with positive net P&L",
    },
    {
      label: "Losing Days",
      value: summary.losingDays,
      cls:   "bg-[var(--loss)]/10 text-[var(--loss)] border-[var(--loss)]/20",
      tooltip: "Days with negative net P&L",
    },
    {
      label: "Total P&L",
      value: formatPnL(summary.totalNetPnl),
      cls:   summary.totalNetPnl >= 0
        ? "bg-[var(--profit)]/10 text-[var(--profit)] border-[var(--profit)]/20"
        : "bg-[var(--loss)]/10 text-[var(--loss)] border-[var(--loss)]/20",
      tooltip: "Total net P&L for the month",
      mono: true,
    },
    {
      label: "Win Rate",
      value: `${summary.winRate.toFixed(1)}%`,
      cls:   "bg-muted text-foreground border-border",
      tooltip: "Percentage of winning trades",
    },
    {
      label: "Total Trades",
      value: summary.totalTrades,
      cls:   "bg-muted text-foreground border-border",
      tooltip: "Total closed trades this month",
    },
  ];

  return (
    <div className="trading-card p-3 flex items-center gap-2 flex-wrap">
      {pills.map((p) => (
        <div
          key={p.label}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium",
            p.cls
          )}
        >
          <span className="text-muted-foreground text-[10px]">{p.label}</span>
          <span className={cn("font-semibold", p.mono && "font-mono")}>{p.value}</span>
          <InfoTooltip content={p.tooltip} />
        </div>
      ))}
    </div>
  );
};

// ── Main Calendar ─────────────────────────────────────────────
export const TradesCalendar = ({
  year,
  month,
  tradesByDate = {},
  isLoading = false,
  onDayClick,
  onPrevMonth,
  onNextMonth,
}) => {
  const direction   = useRef(1);
  const calendarKey = `${year}-${month}`;
  const days        = getCalendarDays(year, month);
  const summary     = getMonthSummary(tradesByDate, year, month);
  const monthLabel  = format(new Date(year, month, 1), "MMMM yyyy");

  const handlePrev = () => { direction.current = -1; onPrevMonth?.(); };
  const handleNext = () => { direction.current  = 1; onNextMonth?.(); };

  const calVariants = {
    enter:  (d) => ({ x: d * 40, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
    exit:   (d) => ({ x: d * -40, opacity: 0, transition: { duration: 0.15, ease: "easeIn" } }),
  };

  if (isLoading) return <CalendarSkeleton />;

  return (
    <div className="space-y-3">
      {/* Month summary */}
      <MonthSummaryBar summary={summary} isLoading={isLoading} />

      {/* Calendar header */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={handlePrev}
          className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="font-heading font-semibold text-lg text-foreground">
          {monthLabel}
        </h2>
        <button
          type="button"
          onClick={handleNext}
          className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center py-1.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {d}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar grid with month transition */}
      <AnimatePresence mode="wait" custom={direction.current}>
        <motion.div
          key={calendarKey}
          custom={direction.current}
          variants={calVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="grid grid-cols-7 gap-1"
        >
          {days.map((day) => (
            <DayCell
              key={day.dateStr}
              day={day}
              trades={tradesByDate[day.dateStr]}
              onClick={onDayClick}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
