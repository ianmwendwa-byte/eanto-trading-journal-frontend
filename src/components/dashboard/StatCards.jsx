import { TrendingUp, TrendingDown, Wallet, Target, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercent, getPnLColor } from "@/utils/format";
import { cn } from "@/lib/utils";

const SCORE_BANDS = {
  needs_work:  { label: "Needs Work",  color: "text-destructive" },
  developing:  { label: "Developing",  color: "text-orange-400" },
  progressing: { label: "Progressing", color: "text-warning" },
  solid:       { label: "Solid",       color: "text-[hsl(var(--profit))]" },
  elite:       { label: "Elite",       color: "text-blue-400" },
};

const StatCard = ({ icon: Icon, label, value, subValue, subColor, loading }) => (
  <div className="trading-card p-4">
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </div>
    {loading ? (
      <>
        <Skeleton className="h-7 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </>
    ) : (
      <>
        <p className="text-2xl font-bold font-mono text-foreground leading-none mb-1">
          {value ?? "—"}
        </p>
        {subValue && (
          <p className={cn("text-xs font-mono", subColor ?? "text-muted-foreground")}>
            {subValue}
          </p>
        )}
      </>
    )}
  </div>
);

export const StatCards = ({ accounts, tradeStats, userScore }) => {
  const nonWarAccounts = (accounts ?? []).filter((a) => a.type !== "war");
  const totalBalance = nonWarAccounts.reduce(
    (sum, a) => sum + (a.currentBalance ?? a.startingBalance ?? 0),
    0
  );

  const todayPnl = tradeStats?.todayPnl ?? tradeStats?.todaysPnl ?? null;
  const winRate = tradeStats?.winRate ?? null;

  const scoreData = userScore?.score;
  const hasScoreData = scoreData?.metadata?.hasMinimumData !== false;
  const scoreOverall = hasScoreData ? scoreData?.overall : null;
  const scoreBand = scoreData?.band;
  const bandInfo = SCORE_BANDS[scoreBand] ?? null;

  const accountsLoading = accounts === undefined;
  const statsLoading = tradeStats === undefined;
  const scoreLoading = userScore === undefined;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={Wallet}
        label="Total Balance"
        loading={accountsLoading}
        value={formatCurrency(totalBalance)}
        subValue={`${nonWarAccounts.length} account${nonWarAccounts.length !== 1 ? "s" : ""}`}
      />
      <StatCard
        icon={todayPnl >= 0 ? TrendingUp : TrendingDown}
        label="Today's P&L"
        loading={statsLoading}
        value={todayPnl !== null ? formatCurrency(todayPnl) : "—"}
        subValue={todayPnl !== null ? (todayPnl >= 0 ? "Positive day" : "Negative day") : undefined}
        subColor={todayPnl !== null ? getPnLColor(todayPnl) : undefined}
      />
      <StatCard
        icon={Target}
        label="Win Rate"
        loading={statsLoading}
        value={winRate !== null ? formatPercent(winRate) : "—"}
        subValue={
          tradeStats
            ? `${tradeStats.wins ?? 0}W / ${tradeStats.losses ?? 0}L`
            : undefined
        }
      />
      <StatCard
        icon={Trophy}
        label="Business Score"
        loading={scoreLoading}
        value={
          scoreLoading
            ? undefined
            : scoreOverall !== null
            ? String(scoreOverall)
            : "—"
        }
        subValue={
          !hasScoreData
            ? "Need 10+ trades"
            : bandInfo
            ? bandInfo.label
            : undefined
        }
        subColor={bandInfo?.color}
      />
    </div>
  );
};
