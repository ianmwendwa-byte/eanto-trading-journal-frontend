import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { ErrorState } from "@/components/shared/ErrorState";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { StatCards } from "@/components/dashboard/StatCards";
import { BalanceHistoryChart } from "@/components/dashboard/BalanceHistoryChart";
import { AccountSummaryList } from "@/components/dashboard/AccountSummaryList";
import { WinLossDonut } from "@/components/dashboard/WinLossDonut";
import { TopPairsChart } from "@/components/dashboard/TopPairsChart";
import { RecentActivityList } from "@/components/dashboard/RecentActivityList";
import { useAccounts } from "@/hooks/useAccounts";
import { useTradeStats, useTradePairStats as usePairStats } from "@/hooks/useTrades";
import { useBalanceHistory, useRecentTransactions } from "@/hooks/useTransactions";
import { useUserScore } from "@/hooks/useScore";
import { useAuthStore } from "@/store/useAuthStore";

export const Dashboard = () => {
  const { mongoUser } = useAuthStore();
  const hasShownWelcome    = useRef(false);
  const hasShownScoreToast = useRef(false);

  const {
    data:    accountsData,
    isLoading: accountsLoading,
    isError:   accountsIsError,
    refetch:   refetchAccounts,
  } = useAccounts();

  const {
    data:    tradeStatsData,
    isLoading: statsLoading,
    isError:   statsIsError,
    refetch:   refetchStats,
  } = useTradeStats();

  const {
    data:    pairStatsData,
    isLoading: pairsLoading,
    isError:   pairsIsError,
    refetch:   refetchPairs,
  } = usePairStats();

  const {
    data:    balanceHistoryData,
    isLoading: historyLoading,
    isError:   historyIsError,
    refetch:   refetchHistory,
  } = useBalanceHistory();

  const {
    data:    recentTxData,
    isLoading: txLoading,
    isError:   txIsError,
    refetch:   refetchTx,
  } = useRecentTransactions(5);

  const {
    data:    userScoreData,
    isLoading: scoreLoading,
    isError:   scoreIsError,
    refetch:   refetchScore,
  } = useUserScore();

  const accounts          = accountsData?.accounts ?? [];
  const tradeStats        = tradeStatsData;
  const pairStats         = pairStatsData;
  const balanceHistory    = balanceHistoryData?.history ?? balanceHistoryData;
  const recentTransactions = recentTxData?.transactions ?? [];
  const userScore         = userScoreData;

  // Welcome toast — fires once for new users
  useEffect(() => {
    if (mongoUser?.created && !hasShownWelcome.current) {
      toast.success("Welcome to Tradecore! 🎉 Start by adding your first trading account.");
      hasShownWelcome.current = true;
    }
  }, [mongoUser]);

  // Score unlock toast — fires once when user has < 10 trades
  useEffect(() => {
    if (!tradeStatsData || hasShownScoreToast.current) return;
    const tradeCount =
      (tradeStats?.wins ?? 0) + (tradeStats?.losses ?? 0) + (tradeStats?.breakeven ?? 0);
  }, [tradeStatsData]); // eslint-disable-line react-hooks/exhaustive-deps

  if (accountsLoading) {
    return <DashboardSkeleton />;
  }

  if (accountsIsError) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <ErrorState
          message="Failed to load your accounts"
          onRetry={refetchAccounts}
        />
      </div>
    );
  }

  if (!accounts.length) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="rounded-2xl bg-primary/10 p-5 border border-primary/20">
          <LayoutDashboard className="h-16 w-16 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Welcome to Tradecore</h1>
          <p className="text-muted-foreground font-medium">Your trading business OS is ready</p>
          <p className="text-sm text-muted-foreground max-w-md">
            Start by adding your first trading account. Track your performance, manage prop firm
            challenges, and grow your trading business.
          </p>
        </div>
        <Button asChild>
          <Link to="/accounts/new">Add Your First Account</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Row 1: Stat cards */}
      <StatCards
        accounts={accounts}
        tradeStats={tradeStats}
        userScore={userScore}
        statsIsError={statsIsError}
        onRetryStats={refetchStats}
        scoreIsError={scoreIsError}
        onRetryScore={refetchScore}
      />

      {/* Row 2: Balance history + account summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 trading-card p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Balance History
            </p>
            <InfoTooltip
              content="Your combined account balance over time. Each point represents your total balance at that date across all accounts."
            />
          </div>
          <div className="h-56">
            <BalanceHistoryChart
              data={balanceHistory}
              isLoading={historyLoading}
              isError={historyIsError}
              onRetry={refetchHistory}
            />
          </div>
        </div>
        <div className="trading-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Accounts
            </p>
            <InfoTooltip
              content="Overview of all your trading accounts. Click any account to view its full details."
            />
          </div>
          <AccountSummaryList
            accounts={accounts}
            isLoading={false}
          />
        </div>
      </div>

      {/* Row 3: Donut + Top pairs + Recent activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="trading-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Win / Loss
            </p>
            <InfoTooltip
              content="Distribution of winning, losing and breakeven trades in the last 30 days."
            />
          </div>
          <WinLossDonut
            tradeStats={tradeStats}
            isLoading={statsLoading}
            isError={statsIsError}
            onRetry={refetchStats}
          />
        </div>
        <div className="trading-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Top Pairs
            </p>
            <InfoTooltip
              content="Your best performing currency pairs ranked by win rate. Minimum 3 trades per pair."
            />
          </div>
          <TopPairsChart
            pairStats={pairStats}
            isLoading={pairsLoading}
            isError={pairsIsError}
            onRetry={refetchPairs}
          />
        </div>
        <div className="trading-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Recent Activity
            </p>
            <InfoTooltip
              content="Your most recent transactions across all accounts including deposits, withdrawals and trade results."
            />
          </div>
          <RecentActivityList
            transactions={recentTransactions}
            isLoading={txLoading}
            isError={txIsError}
            onRetry={refetchTx}
          />
        </div>
      </div>
    </div>
  );
};
