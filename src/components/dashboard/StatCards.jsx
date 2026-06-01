import { useEffect } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { formatCurrency, formatPercent, getPnLColor } from "@/utils/format";
import { cn } from "@/lib/utils";

const SCORE_BANDS = {
  needs_work:  { label: "Needs Work",  color: "text-destructive" },
  developing:  { label: "Developing",  color: "text-orange-400" },
  progressing: { label: "Progressing", color: "text-warning" },
  solid:       { label: "Solid",       color: "text-[var(--profit)]" },
  elite:       { label: "Elite",       color: "text-blue-400" },
};

const StatCard = ({ label, tooltip, value, subValue, subColor, loading, isError, onRetry }) => (
  <div className="trading-card p-4">
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <InfoTooltip content={tooltip} />
    </div>
    {loading ? (
      <>
        <Skeleton className="h-7 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </>
    ) : isError ? (
      <div className="flex flex-col items-start gap-1.5 py-1">
        <p className="text-xs text-muted-foreground">Failed to load</p>
        {onRetry && (
          <button
            onClick={() => { toast.info("Retrying..."); onRetry(); }}
            className="text-xs text-primary hover:underline"
          >
            Retry
          </button>
        )}
      </div>
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

export const StatCards = ({
  accounts,
  tradeStats,
  userScore,
  statsIsError,
  onRetryStats,
  scoreIsError,
  onRetryScore,
}) => {
  useEffect(() => {
    if (statsIsError) toast.error("Failed to load trade data. Please try again.");
  }, [statsIsError]);

  useEffect(() => {
    if (scoreIsError) toast.error("Failed to load business score. Please try again.");
  }, [scoreIsError]);

  // Prop firm capital and personal account balances cannot be summed — they are
  // different money (prop = firm's capital; personal = your own capital).
  // Use the dashboard overview API (overview.portfolio.*) for account-type-scoped totals.
  const accountCount = (accounts ?? []).length;

  const todayPnl = tradeStats?.todayPnl ?? tradeStats?.todaysPnl ?? null;
  const winRate   = tradeStats?.winRate ?? null;

  const scoreData    = userScore?.score ?? null;
  const hasScoreData = scoreData != null && scoreData.metadata?.hasMinimumData !== false;
  const scoreOverall = hasScoreData ? (scoreData?.overall ?? null) : null;
  const scoreBand    = scoreData?.band;
  const bandInfo     = SCORE_BANDS[scoreBand] ?? null;

  const accountsLoading = accounts === undefined;
  const statsLoading    = tradeStats === undefined && !statsIsError;
  const scoreLoading    = userScore === undefined && !scoreIsError;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Active Accounts"
        tooltip="Total number of active trading accounts (personal + prop). Use the Portfolio widgets for type-separated totals."
        loading={accountsLoading}
        value={accountCount > 0 ? String(accountCount) : "—"}
        subValue={accountCount > 0 ? `${accountCount} account${accountCount !== 1 ? "s" : ""}` : undefined}
      />
      <StatCard
        label="Today's P&L"
        tooltip="Total profit and loss from all trades closed today across all accounts"
        loading={statsLoading}
        isError={statsIsError}
        onRetry={onRetryStats}
        value={todayPnl !== null ? formatCurrency(todayPnl) : "—"}
        subValue={todayPnl !== null ? (todayPnl >= 0 ? "Positive day" : "Negative day") : undefined}
        subColor={todayPnl !== null ? getPnLColor(todayPnl) : undefined}
      />
      <StatCard
        label="Win Rate"
        tooltip="Percentage of winning trades out of total closed trades in the last 30 days"
        loading={statsLoading}
        isError={statsIsError}
        onRetry={onRetryStats}
        value={winRate !== null ? formatPercent(winRate) : "—"}
        subValue={
          tradeStats
            ? `${tradeStats.wins ?? 0}W / ${tradeStats.losses ?? 0}L`
            : undefined
        }
      />
      <StatCard
        label="Business Score"
        tooltip="A 0-100 composite score measuring how well you are running your trading business. Calculated weekly based on consistency, risk management, profitability, discipline and growth. Requires 10+ trades."
        loading={scoreLoading}
        isError={scoreIsError}
        onRetry={onRetryScore}
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
