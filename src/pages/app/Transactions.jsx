import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowLeftRight } from "lucide-react";
import { Button }     from "@/components/ui/button";
import { Separator }  from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState }  from "@/components/shared/EmptyState";
import { ErrorState }  from "@/components/shared/ErrorState";

import { PersonalSummarySection }   from "@/components/transactions/PersonalSummarySection";
import { PropSummarySection }       from "@/components/transactions/PropSummarySection";
import { BalanceChart }             from "@/components/transactions/BalanceChart";
import { TransactionsToolbar }      from "@/components/transactions/TransactionsToolbar";
import { TransactionRow }           from "@/components/transactions/TransactionRow";
import { TransactionRowSkeleton }   from "@/components/transactions/TransactionRowSkeleton";
import { GroupHeader }              from "@/components/transactions/GroupHeader";
import { AddTransactionModal }      from "@/components/transactions/AddTransactionModal";
import { TransactionDetailSheet }   from "@/components/transactions/TransactionDetailSheet";
import { TradeDetailPanel }         from "@/components/trades/TradeDetailPanel";

import {
  useTransactions,
  useBalanceHistory,
} from "@/hooks/useTransactions";
import { useAccounts, useAccount } from "@/hooks/useAccounts";
import { useDashboardOverview }    from "@/hooks/useDashboard";
import { useTrade }                from "@/hooks/useTrades";
import { getSummaryMode }          from "@/utils/transactionSummarySource";
import { TRANSACTION_LABELS, CATEGORY_LABELS } from "@/constants/transactionTypes";
import { formatDate } from "@/utils/format";
import { pageVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

// ── Date range helpers ────────────────────────────────────────
const getDateRange = (period) => {
  const now = new Date();
  const fmt  = (d) => d.toISOString().split("T")[0];
  switch (period) {
    case "today": {
      const s = fmt(now); return { dateFrom: s, dateTo: s };
    }
    case "7d": {
      const s = new Date(now); s.setDate(s.getDate() - 7);
      return { dateFrom: fmt(s), dateTo: fmt(now) };
    }
    case "1m": {
      const s = new Date(now); s.setMonth(s.getMonth() - 1);
      return { dateFrom: fmt(s), dateTo: fmt(now) };
    }
    case "3m": {
      const s = new Date(now); s.setMonth(s.getMonth() - 3);
      return { dateFrom: fmt(s), dateTo: fmt(now) };
    }
    case "ytd":
      return { dateFrom: `${now.getFullYear()}-01-01`, dateTo: fmt(now) };
    default:
      return {};
  }
};

// ── Group transactions for display ────────────────────────────
const groupTransactions = (transactions, groupBy) => {
  if (groupBy === "none" || !transactions.length) return null;

  const groups = new Map();
  transactions.forEach((tx) => {
    let key, label;
    switch (groupBy) {
      case "date": {
        const d = new Date(tx.transactionDate);
        key = d.toISOString().split("T")[0];
        const today     = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        label = key === today ? "Today" : key === yesterday ? "Yesterday" : formatDate(tx.transactionDate);
        break;
      }
      case "type":
        key   = tx.type;
        label = TRANSACTION_LABELS[tx.type] ?? tx.type;
        break;
      case "account":
        key   = tx.accountId?._id ?? tx.accountId ?? "unknown";
        label = tx.accountId?.name ?? key;
        break;
      case "category":
        key   = tx.category ?? "other";
        label = CATEGORY_LABELS[tx.category]
          ?? (tx.category ? tx.category.charAt(0).toUpperCase() + tx.category.slice(1) : "Other");
        break;
      default:
        key = label = "all";
    }
    if (!groups.has(key)) groups.set(key, { key, label, items: [] });
    groups.get(key).items.push(tx);
  });

  return Array.from(groups.values());
};

// ── Main page ─────────────────────────────────────────────────
export const Transactions = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    page:         Number(searchParams.get("page") ?? 1),
    limit:        20,
    accountId:    searchParams.get("accountId") ?? "",
    type:         searchParams.get("type")      ?? "",
    category:     searchParams.get("category")  ?? "",
    period:       searchParams.get("period")    ?? "all",
    search:       searchParams.get("search")    ?? "",
    sortBy:       "transactionDate",
    order:        "desc",
    showReversed: false,
  });

  const [groupBy,          setGroupBy]          = useState("date");
  const [balanceCollapsed, setBalanceCollapsed]  = useState(false);
  const [isAddOpen,        setIsAddOpen]         = useState(false);
  const [selectedTx,       setSelectedTx]        = useState(null);
  const [selectedTradeId,  setSelectedTradeId]   = useState(null);

  // ── URL sync ─────────────────────────────────────────────────
  const handleFilterChange = (updates) => {
    setFilters((prev) => {
      const next = { ...prev, ...updates };
      if (!("page" in updates)) next.page = 1;
      const params = new URLSearchParams();
      ["accountId", "type", "category", "period", "search"].forEach((k) => {
        if (next[k]) params.set(k, next[k]);
      });
      if (next.page > 1) params.set("page", String(next.page));
      setSearchParams(params, { replace: true });
      return next;
    });
  };

  // ── Derived state ─────────────────────────────────────────────
  const isSpecificAccount = !!(filters.accountId && filters.accountId !== "all");

  const apiFilters = useMemo(() => {
    const dateRange = getDateRange(filters.period);
    return {
      page:   filters.page,
      limit:  filters.limit,
      sortBy: filters.sortBy,
      order:  filters.order,
      ...(isSpecificAccount        ? { accountId:    filters.accountId    } : {}),
      ...(filters.type             ? { type:         filters.type         } : {}),
      ...(filters.category         ? { category:     filters.category     } : {}),
      ...(filters.search           ? { search:       filters.search       } : {}),
      ...(filters.showReversed     ? { showReversed: true                 } : {}),
      ...dateRange,
    };
  }, [filters, isSpecificAccount]);

  const chartFilters = useMemo(() => {
    const dateRange = getDateRange(filters.period);
    return {
      ...(isSpecificAccount ? { accountId: filters.accountId } : {}),
      ...dateRange,
    };
  }, [filters.accountId, filters.period, isSpecificAccount]);

  // ── Data fetching ─────────────────────────────────────────────

  // SOURCE 1: Dashboard portfolio (combined summary for "all accounts" mode)
  // Only request the "portfolio" section for efficiency
  const {
    data:      dashboardData,
    isLoading: dashLoading,
  } = useDashboardOverview({ sections: ["portfolio"] });
  const portfolioData = dashboardData?.portfolio;

  // SOURCE 2: Accounts list (for selector + getSummaryMode)
  const { data: accountsData } = useAccounts({ limit: 50 });
  const accounts = useMemo(() => accountsData?.accounts ?? [], [accountsData]);

  // SOURCE 3: Full account object (when a specific account is selected)
  const {
    data:      selectedAccountFull,
    isLoading: accountLoading,
  } = useAccount(isSpecificAccount ? filters.accountId : null);

  // SOURCE 4: Transactions list
  const {
    data, isLoading: txLoading, isError, refetch, isFetching,
  } = useTransactions(apiFilters);
  const transactions = data?.transactions ?? [];
  const pagination   = data?.pagination   ?? {};

  // SOURCE 5: Balance history (only when specific account selected)
  const {
    data:      balanceHistory,
    isLoading: chartLoading,
  } = useBalanceHistory(chartFilters, { enabled: isSpecificAccount });

  // Trade detail
  const { data: selectedTrade } = useTrade(selectedTradeId);

  // ── Summary mode ──────────────────────────────────────────────
  const summaryMode = getSummaryMode(filters.accountId, accounts);
  const isAllMode   = summaryMode.mode === "all";
  const isSingle    = summaryMode.mode === "single";
  const isSingleProp     = isSingle && summaryMode.isProp;
  const isSinglePersonal = isSingle && !summaryMode.isProp;

  // What sections to show
  const showPersonalSection = isAllMode || isSinglePersonal;
  const showPropSection     = isAllMode || isSingleProp;
  const showBothSections    = isAllMode
    && (portfolioData?.personal?.accountCount > 0 || dashLoading)
    && (portfolioData?.prop?.accountCount > 0 || dashLoading);

  // Whether the balance chart should render (only account-scoped is safe)
  const showBalanceChart = isSpecificAccount;

  // Overall loading state for summaries
  const summaryIsLoading = isAllMode ? dashLoading : (dashLoading || accountLoading);
  const summaryAccount   = isSpecificAccount ? selectedAccountFull : null;

  // Active filter detection
  const hasActiveFilters = !!(
    filters.search || filters.type || filters.category ||
    (filters.period && filters.period !== "all") || filters.showReversed
  );

  // Display grouping
  const groups = useMemo(
    () => groupTransactions(transactions, groupBy),
    [transactions, groupBy]
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "p-6 space-y-4 transition-[padding] duration-300",
        selectedTradeId && "pr-[444px]"
      )}
    >
      {/* ── Page header ──────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pagination.total ? `${pagination.total} transactions` : "Your financial history"}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* ── Summary sections ─────────────────────────── */}
      {showPersonalSection && (
        <PersonalSummarySection
          mode={isSinglePersonal ? "single" : "all"}
          data={portfolioData?.personal}
          account={summaryAccount}
          isLoading={summaryIsLoading}
        />
      )}

      {showBothSections && <Separator className="my-1" />}

      {showPropSection && (
        <PropSummarySection
          mode={isSingleProp ? "single" : "all"}
          data={portfolioData?.prop}
          account={summaryAccount}
          isLoading={summaryIsLoading}
        />
      )}

      {/* ── Balance chart (account-scoped only) ──────── */}
      {showBalanceChart && (
        <BalanceChart
          data={balanceHistory}
          isLoading={chartLoading}
          isCollapsed={balanceCollapsed}
          onToggle={() => setBalanceCollapsed((v) => !v)}
        />
      )}

      {/* ── Toolbar ──────────────────────────────────── */}
      <TransactionsToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        totalCount={pagination.total ?? 0}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        accounts={accounts}
      />

      {/* ── Content area ─────────────────────────────── */}
      <div className="trading-card overflow-hidden">
        {/* Column headers */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-muted/20 border-b border-border">
          <div className="w-9 flex-shrink-0" />
          <p className="flex-1 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Description   
          </p>
          <p className="hidden sm:block w-24 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Date
          </p>
          <p className="w-28 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Amount
          </p>
          <p className="hidden md:block w-28 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Balance
          </p>
          <div className="w-7 flex-shrink-0" />
        </div>

        {/* Loading */}
        {txLoading && (
          <div>
            {Array.from({ length: 8 }).map((_, i) => (
              <TransactionRowSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!txLoading && isError && (
          <ErrorState message="Failed to load transactions" onRetry={refetch} className="py-12" />
        )}

        {/* Empty — no transactions */}
        {!txLoading && !isError && transactions.length === 0 && !hasActiveFilters && (
          <EmptyState
            icon={ArrowLeftRight}
            title="No transactions yet"
            description="Transactions are created automatically when you add trades. Add a deposit to get started."
            action={
              <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Deposit
              </Button>
            }
          />
        )}

        {/* Empty — filtered */}
        {!txLoading && !isError && transactions.length === 0 && hasActiveFilters && (
          <div className="py-12 text-center space-y-2">
            <p className="text-sm font-medium text-foreground">No transactions match your filters</p>
            <button
              type="button"
              onClick={() => handleFilterChange({
                search: "", type: "", category: "", period: "all", showReversed: false,
              })}
              className="text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Data — grouped */}
        {!txLoading && !isError && transactions.length > 0 && groups !== null && (
          <div>
            {groups.map((group) => (
              <div key={group.key}>
                <GroupHeader group={group} groupBy={groupBy} />
                {group.items.map((tx) => (
                  <TransactionRow
                    key={tx._id}
                    transaction={tx}
                    showAccount={!isSpecificAccount}
                    onTradeClick={(id) => setSelectedTradeId(id)}
                    onViewDetails={(tx) => setSelectedTx(tx)}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Data — flat */}
        {!txLoading && !isError && transactions.length > 0 && groups === null && (
          <div>
            {transactions.map((tx) => (
              <TransactionRow
                key={tx._id}
                transaction={tx}
                showAccount={!isSpecificAccount}
                onTradeClick={(id) => setSelectedTradeId(id)}
                onViewDetails={(tx) => setSelectedTx(tx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ───────────────────────────────── */}
      {pagination.pages > 1 && (
        <Pagination
          page={filters.page}
          totalPages={pagination.pages}
          total={pagination.total}
          limit={filters.limit}
          onPageChange={(p) => handleFilterChange({ page: p })}
          isFetching={isFetching}
        />
      )}

      {/* ── Add Transaction modal ────────────────────── */}
      <AddTransactionModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        accounts={accounts}
        defaultAccountId={filters.accountId}
      />

      {/* ── Transaction detail sheet ─────────────────── */}
      <Sheet open={!!selectedTx} onOpenChange={(v) => { if (!v) setSelectedTx(null); }}>
        <SheetContent
          side="right"
          className="w-[400px] sm:w-[480px] p-0 bg-card border-border"
        >
          <TransactionDetailSheet
            transaction={selectedTx}
            onClose={() => setSelectedTx(null)}
            onTradeClick={(id) => {
              setSelectedTx(null);
              setSelectedTradeId(id);
            }}
          />
        </SheetContent>
      </Sheet>

      {/* ── Trade detail panel ───────────────────────── */}
      <AnimatePresence>
        {selectedTradeId && (
          <motion.div
            key="tx-trade-panel"
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-14 right-0 h-[calc(100vh-3.5rem)] w-[420px] bg-card border-l border-border z-40 overflow-hidden"
          >
            <TradeDetailPanel
              trade={selectedTrade}
              onClose={() => setSelectedTradeId(null)}
              onDelete={() => setSelectedTradeId(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
