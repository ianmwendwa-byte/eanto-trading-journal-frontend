import { format, isToday } from "date-fns";

export const groupTradesByDate = (trades) => {
  const grouped = {};
  for (const trade of trades) {
    if (!trade.closedAt) continue;
    const dateStr = trade.closedAt.split("T")[0];
    if (!grouped[dateStr]) grouped[dateStr] = [];
    grouped[dateStr].push(trade);
  }
  return grouped;
};

export const getDayStats = (trades) => {
  if (!trades?.length) return null;
  const netPnl     = trades.reduce((sum, t) => sum + (t.netPnl ?? t.pnl ?? 0), 0);
  const wins       = trades.filter((t) => t.outcome === "win").length;
  const losses     = trades.filter((t) => t.outcome === "loss").length;
  const breakeven  = trades.filter((t) => t.outcome === "breakeven").length;
  const pnls       = trades.map((t) => t.netPnl ?? t.pnl ?? 0);
  return {
    count:       trades.length,
    netPnl,
    wins,
    losses,
    breakeven,
    isProfit:    netPnl > 0,
    isLoss:      netPnl < 0,
    isBreakeven: netPnl === 0,
    bestTrade:   pnls.length ? Math.max(...pnls) : 0,
    worstTrade:  pnls.length ? Math.min(...pnls) : 0,
  };
};

export const getCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Convert Sunday-based getDay() to Monday-based (0=Mon … 6=Sun)
  const startPad = (firstDay.getDay() + 6) % 7;

  const cells = [];

  // Prev-month padding cells
  for (let i = startPad; i > 0; i--) {
    const date = new Date(year, month, 1 - i);
    cells.push(makeDayObj(date, month));
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push(makeDayObj(date, month));
  }

  // Next-month fill to reach 42
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i);
    cells.push(makeDayObj(date, month));
  }

  return cells;
};

const makeDayObj = (date, currentMonth) => ({
  date,
  dateStr:        format(date, "yyyy-MM-dd"),
  isCurrentMonth: date.getMonth() === currentMonth,
  isToday:        isToday(date),
  dayNumber:      date.getDate(),
  isWeekend:      date.getDay() === 0 || date.getDay() === 6,
});

export const getMonthSummary = (tradesByDate, year, month) => {
  let totalTrades   = 0;
  let profitableDays = 0;
  let losingDays    = 0;
  let totalNetPnl   = 0;
  let totalWins     = 0;
  let bestDay       = { date: null, pnl: -Infinity };
  let worstDay      = { date: null, pnl: Infinity };

  for (const [dateStr, trades] of Object.entries(tradesByDate)) {
    const d = new Date(dateStr);
    if (d.getFullYear() !== year || d.getMonth() !== month) continue;

    const stats = getDayStats(trades);
    if (!stats) continue;

    totalTrades  += stats.count;
    totalNetPnl  += stats.netPnl;
    totalWins    += stats.wins;

    if (stats.netPnl > 0) {
      profitableDays++;
      if (stats.netPnl > bestDay.pnl) bestDay = { date: dateStr, pnl: stats.netPnl };
    }
    if (stats.netPnl < 0) {
      losingDays++;
      if (stats.netPnl < worstDay.pnl) worstDay = { date: dateStr, pnl: stats.netPnl };
    }
  }

  return {
    totalTrades,
    profitableDays,
    losingDays,
    totalNetPnl,
    winRate:  totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0,
    bestDay:  bestDay.date  ? bestDay  : null,
    worstDay: worstDay.date ? worstDay : null,
  };
};

// Detect trading session from a datetime string (UTC hours)
export const detectSession = (dateStr) => {
  if (!dateStr) return null;
  const h = new Date(dateStr).getUTCHours();
  if (h >= 12 && h < 15) return "overlap";
  if (h >= 7  && h < 12) return "london";
  if (h >= 15 && h < 21) return "new_york";
  if (h >= 21)            return "sydney";
  return "tokyo";
};
