import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { StatCards } from "@/components/dashboard/StatCards";
import { BalanceHistoryChart } from "@/components/dashboard/BalanceHistoryChart";
import { AccountSummaryList } from "@/components/dashboard/AccountSummaryList";
import { WinLossDonut } from "@/components/dashboard/WinLossDonut";
import { TopPairsChart } from "@/components/dashboard/TopPairsChart";
import { RecentActivityList } from "@/components/dashboard/RecentActivityList";
import { useAccounts } from "@/hooks/useAccounts";
import { useTradeStats, usePairStats } from "@/hooks/useTrades";
import { useBalanceHistory, useRecentTransactions } from "@/hooks/useTransactions";
import { useUserScore } from "@/hooks/useScore";

export const Dashboard = () => {
  const { data: accountsData, isLoading: accountsLoading } = useAccounts();
  const { data: tradeStatsData, isLoading: statsLoading } = useTradeStats();
  const { data: pairStatsData, isLoading: pairsLoading } = usePairStats();
  const { data: balanceHistoryData, isLoading: historyLoading } = useBalanceHistory();
  const { data: recentTxData, isLoading: txLoading } = useRecentTransactions(5);
  const { data: userScoreData, isLoading: scoreLoading } = useUserScore();

  const accounts = accountsData?.accounts ?? [];
  const tradeStats = tradeStatsData;
  const pairStats = pairStatsData;
  const balanceHistory = balanceHistoryData?.history ?? balanceHistoryData;
  const recentTransactions = recentTxData?.transactions ?? [];
  const userScore = userScoreData;

  // Show full skeleton while primary data loads
  if (accountsLoading) {
    return <DashboardSkeleton />;
  }

  // Empty state: no accounts
  if (!accounts.length) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={PlusCircle}
          title="No accounts yet"
          description="Add your first trading account to start tracking your performance across all your accounts."
          action={
            <Button asChild>
              <Link to="/accounts/new">Create First Account</Link>
            </Button>
          }
        />
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
      />

      {/* Row 2: Balance history + account summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 trading-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-widest">
            Balance History
          </p>
          <div className="h-56">
            <BalanceHistoryChart
              data={balanceHistory}
              isLoading={historyLoading}
            />
          </div>
        </div>
        <div className="trading-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-widest">
            Accounts
          </p>
          <AccountSummaryList
            accounts={accounts}
            isLoading={false}
          />
        </div>
      </div>

      {/* Row 3: Donut + Top pairs + Recent activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="trading-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-widest">
            Win / Loss
          </p>
          <WinLossDonut
            tradeStats={tradeStats}
            isLoading={statsLoading}
          />
        </div>
        <div className="trading-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-widest">
            Top Pairs
          </p>
          <TopPairsChart
            pairStats={pairStats}
            isLoading={pairsLoading}
          />
        </div>
        <div className="trading-card p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-widest">
            Recent Activity
          </p>
          <RecentActivityList
            transactions={recentTransactions}
            isLoading={txLoading}
          />
        </div>
      </div>
    </div>
  );
};
