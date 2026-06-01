import { useRef } from "react";
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
  const stats = getDayStats(trades);

  if (!day.isCurrentMonth) {
    return (
      <div className="h-20 rounded-lg bg-muted/20 border border-transparent opacity-30 p-1.5">
        <span className="text-xs text-muted-foreground">{day.dayNumber}</span>
      </div>
    );
  }

  const cellCls = cn(
    "h-20 rounded-lg border p-1.5 relative transition-all duration-150",
    stats
      ? stats.isProfit
        ? "bg-[hsl(var(--profit)/0.08)] border-[hsl(var(--profit)/0.25)] hover:bg-[hsl(var(--profit)/0.15)] hover:border-[hsl(var(--profit)/0.4)] cursor-pointer"
        : stats.isLoss
          ? "bg-[hsl(var(--loss)/0.08)] border-[hsl(var(--loss)/0.25)] hover:bg-[hsl(var(--loss)/0.15)] hover:border-[hsl(var(--loss)/0.4)] cursor-pointer"
          : "bg-muted/50 border-border hover:bg-muted cursor-pointer"
      : "bg-card/50 border-border/50"
  );

  const cell = (
    <div className={cellCls} onClick={stats ? () => onClick?.(day.dateStr, trades) : undefined}>
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
            <span className={cn(
              "text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full",
              stats.isProfit
                ? "bg-[hsl(var(--profit)/0.15)] text-[var(--profit)]"
                : stats.isLoss
                  ? "bg-[hsl(var(--loss)/0.15)] text-[var(--loss)]"
                  : "bg-muted text-muted-foreground"
            )}>
              {formatPnL(stats.netPnl)}
            </span>
          </div>

          {/* Bottom row */}
          <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between">
            <span className="text-[9px] text-muted-foreground">
              {stats.count}t
            </span>
            {/* Outcome dots */}
            <div className="flex items-center gap-0.5">
              {Array.from({ length: Math.min(stats.wins, 4) }).map((_, i) => (
                <span key={`w${i}`} className="w-1.5 h-1.5 rounded-full bg-[var(--profit)]" />
              ))}
              {Array.from({ length: Math.min(stats.losses, 4 - Math.min(stats.wins, 4)) }).map((_, i) => (
                <span key={`l${i}`} className="w-1.5 h-1.5 rounded-full bg-[var(--loss)]" />
              ))}
              {stats.breakeven > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--breakeven))]" />
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
        <TooltipContent side="top" className="bg-card border-border text-xs space-y-0.5">
          <p className="font-semibold">{format(day.date, "MMM d")}</p>
          <p>{stats.count} trade{stats.count !== 1 ? "s" : ""}</p>
          <p className={cn("font-mono", getPnLColor(stats.netPnl))}>
            Net P&L: {formatPnL(stats.netPnl)}
          </p>
          <p className="text-muted-foreground">
            W: {stats.wins} · L: {stats.losses} · B: {stats.breakeven}
          </p>
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
