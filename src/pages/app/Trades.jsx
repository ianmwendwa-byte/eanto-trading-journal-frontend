import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Button }    from "@/components/ui/button";
import { Skeleton }  from "@/components/ui/skeleton";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState }  from "@/components/shared/EmptyState";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { TradesToolbar }    from "@/components/trades/TradesToolbar";
import { TradesTable }      from "@/components/trades/TradesTable";
import { TradesCalendar }   from "@/components/trades/TradesCalendar";
import { TradeDetailPanel } from "@/components/trades/TradeDetailPanel";
import { AddTradeSheet }    from "@/components/trades/AddTradeSheet";
import { DayDetailSheet }   from "@/components/trades/DayDetailSheet";
import { useTrades, useTrade, useCalendarTrades, useTradeStats } from "@/hooks/useTrades";
import { useAccounts } from "@/hooks/useAccounts";
import { groupTradesByDate } from "@/utils/calendar";
import { formatPnL, getPnLColor } from "@/utils/format";
import { pageVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

const now = new Date();

// ── Compact stat card ─────────────────────────────────────────
const TradeStatCard = ({ label, value, valueColor, tooltip, isLoading }) => (
  <div className="trading-card p-3.5">
    <div className="flex items-center justify-between mb-1.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      {tooltip && <InfoTooltip content={tooltip} />}
    </div>
    {isLoading ? (
      <Skeleton className="h-6 w-24 mt-1" />
    ) : (
      <p className={cn("text-xl font-mono font-bold text-foreground", valueColor)}>
        {value ?? "—"}
      </p>
    )}
  </div>
);

// ── Main page ─────────────────────────────────────────────────
export const Trades = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [view, setView]               = useState(() => searchParams.get("view") ?? "table");
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [isAddOpen, setIsAddOpen]     = useState(() => searchParams.get("add") === "true");

  // Auto-open detail panel when ?trade=<id> is in the URL (e.g. from dashboard widget)
  const linkedTradeId = searchParams.get("trade");
  const { data: linkedTrade } = useTrade(linkedTradeId);
  useEffect(() => {
    if (linkedTrade && (!selectedTrade || selectedTrade._id !== linkedTrade._id)) {
      setSelectedTrade(linkedTrade);
    }
  }, [linkedTrade]);
  const [calYear,  setCalYear]        = useState(now.getFullYear());
  const [calMonth, setCalMonth]       = useState(now.getMonth());
  const [dayDetail, setDayDetail]     = useState(null);

  const [filters, setFilters] = useState({
    search:    searchParams.get("search")    ?? "",
    pair:      searchParams.get("pair")      ?? "",
    direction: searchParams.get("direction") ?? "",
    outcome:   searchParams.get("outcome")   ?? "",
    session:   searchParams.get("session")   ?? "",
    period:    searchParams.get("period")    ?? "all",
    sort:      searchParams.get("sort")      ?? "closedAt_desc",
    page:      Number(searchParams.get("page") ?? 1),
    accountId: searchParams.get("accountId") ?? "",
    limit:     20,
  });

  const handleFilterChange = (updates) => {
    setFilters((prev) => {
      const next = { ...prev, ...updates };
      if (!("page" in updates)) next.page = 1;
      const params = new URLSearchParams();
      const syncKeys = ["search", "pair", "direction", "outcome", "session", "period", "sort", "accountId"];
      syncKeys.forEach((k) => { if (next[k]) params.set(k, next[k]); });
      if (next.page > 1) params.set("page", String(next.page));
      if (view !== "table") params.set("view", view);
      setSearchParams(params, { replace: true });
      return next;
    });
  };

  const handleViewChange = (v) => {
    setView(v);
    const params = new URLSearchParams(searchParams);
    if (v === "table") params.delete("view");
    else params.set("view", v);
    setSearchParams(params, { replace: true });
  };

  // ── Data ──────────────────────────────────────────────────────
  const { data: accountsData } = useAccounts({ limit: 50 });
  const accounts = accountsData?.accounts ?? [];

  const { data: tradesData, isLoading: tradesLoading, isFetching: tradesFetching } = useTrades(filters);
  const trades      = tradesData?.trades                    ?? [];
  const totalPages  = tradesData?.pagination?.totalPages    ?? 1;
  const totalTrades = tradesData?.pagination?.total         ?? 0;

  const { data: calendarTradesRaw, isLoading: calLoading } = useCalendarTrades(
    calYear, calMonth, filters.accountId || undefined
  );
  const tradesByDate = useMemo(() => groupTradesByDate(calendarTradesRaw ?? []), [calendarTradesRaw]);

  const statsFilters = {
    ...(filters.accountId ? { accountId: filters.accountId } : {}),
    ...(filters.period && filters.period !== "all" ? { period: filters.period } : {}),
  };
  const { data: stats, isLoading: statsLoading } = useTradeStats(statsFilters);

  const winRate    = stats?.winRate     ?? null;
  const avgRR      = stats?.avgRR       ?? stats?.averageRR   ?? null;
  const netPnl     = stats?.netPnl      ?? stats?.totalNetPnl ?? null;
  const statTrades = stats?.totalTrades ?? null;

  // ── Handlers ──────────────────────────────────────────────────
  const isPanelOpen = !!selectedTrade;

  const handlePanelClose = () => {
    setSelectedTrade(null);
    const params = new URLSearchParams(searchParams);
    params.delete("trade");
    setSearchParams(params, { replace: true });
  };

  const handleRowClick = (trade) => {
    setSelectedTrade((prev) => (prev?._id === trade._id ? null : trade));
  };

  const handleDayClick = (dateStr, dayTrades) => {
    setDayDetail({ dateStr, trades: dayTrades });
  };

  const handleDayTradeClick = (trade) => {
    setDayDetail(null);
    handleViewChange("table");
    setSelectedTrade(trade);
  };

  const handleAddClose = () => {
    setIsAddOpen(false);
    const params = new URLSearchParams(searchParams);
    params.delete("add");
    setSearchParams(params, { replace: true });
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "p-6 space-y-4 transition-[padding] duration-300",
        isPanelOpen && "pr-[444px]"
      )}
    >
      {/* ── Page header ──────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Trade Journal</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {statTrades != null ? `${statTrades.toLocaleString()} closed trades` : "Your closed trade history"}
          </p>
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <TradeStatCard
          label="Total Trades"
          value={statTrades != null ? statTrades.toLocaleString() : null}
          tooltip="Closed trades for the selected period"
          isLoading={statsLoading}
        />
        <TradeStatCard
          label="Win Rate"
          value={winRate != null ? `${(winRate * (winRate <= 1 ? 100 : 1)).toFixed(1)}%` : null}
          tooltip="Percentage of winning trades"
          isLoading={statsLoading}
        />
        <TradeStatCard
          label="Net P&L"
          value={netPnl != null ? formatPnL(netPnl) : null}
          valueColor={netPnl != null ? getPnLColor(netPnl) : undefined}
          tooltip="Total net P&L after commissions and swap"
          isLoading={statsLoading}
        />
        <TradeStatCard
          label="Avg R:R"
          value={avgRR != null ? `${Number(avgRR).toFixed(2)}R` : null}
          tooltip="Average realized reward:risk ratio"
          isLoading={statsLoading}
        />
      </div>

      {/* ── Toolbar ──────────────────────────────────── */}
      <TradesToolbar
        view={view}
        onViewChange={handleViewChange}
        filters={filters}
        onFilterChange={handleFilterChange}
        accounts={accounts}
        totalCount={view === "table" ? totalTrades : (calendarTradesRaw?.length ?? 0)}
        isLoading={view === "table" ? tradesLoading : calLoading}
        onAddTrade={() => setIsAddOpen(true)}
      />

      {/* ── Content ──────────────────────────────────── */}
      {view === "table" ? (
        <div className="space-y-3">
          {trades.length === 0 && !tradesLoading ? (
            <EmptyState
              title="No trades found"
              description={
                filters.direction || filters.outcome || filters.session || filters.search
                  ? "Try adjusting your filters."
                  : "Add your first trade to start journaling."
              }
              action={
                !filters.direction && !filters.outcome && !filters.session && !filters.search ? (
                  <Button size="sm" className="gap-1.5" onClick={() => setIsAddOpen(true)}>
                    <Plus className="h-3.5 w-3.5" />
                    Add Trade
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <TradesTable
              trades={trades}
              isLoading={tradesLoading}
              isFetching={tradesFetching}
              sort={filters.sort}
              onSort={(sort) => handleFilterChange({ sort })}
              onRowClick={handleRowClick}
              onEdit={handleRowClick}
              onDelete={() => {}}
              selectedTradeId={selectedTrade?._id}
            />
          )}

          {totalPages > 1 && (
            <Pagination
              page={filters.page}
              totalPages={totalPages}
              onPageChange={(page) => handleFilterChange({ page })}
            />
          )}
        </div>
      ) : (
        <TradesCalendar
          year={calYear}
          month={calMonth}
          tradesByDate={tradesByDate}
          isLoading={calLoading}
          onDayClick={handleDayClick}
          onPrevMonth={() => {
            if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
            else setCalMonth((m) => m - 1);
          }}
          onNextMonth={() => {
            if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
            else setCalMonth((m) => m + 1);
          }}
        />
      )}

      {/* ── Fixed trade detail panel ──────────────────── */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            key="trade-detail-panel"
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-14 right-0 h-[calc(100vh-3.5rem)] w-[420px] bg-card border-l border-border z-40 overflow-hidden"
          >
            <TradeDetailPanel
              trade={selectedTrade}
              onClose={handlePanelClose}
              onDelete={handlePanelClose}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add Trade Sheet ───────────────────────────── */}
      <AddTradeSheet
        isOpen={isAddOpen}
        onClose={handleAddClose}
        defaultAccountId={filters.accountId || undefined}
      />

      {/* ── Day Detail Sheet ──────────────────────────── */}
      <DayDetailSheet
        isOpen={!!dayDetail}
        onClose={() => setDayDetail(null)}
        dateStr={dayDetail?.dateStr}
        trades={dayDetail?.trades ?? []}
        onTradeClick={handleDayTradeClick}
      />
    </motion.div>
  );
};
