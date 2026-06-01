import { Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { AccountTypeBadge } from "@/components/accounts/AccountTypeBadge";
import { AccountStatusBadge } from "@/components/accounts/AccountStatusBadge";
import { formatCurrency, formatPnL } from "@/utils/format";
import { cn } from "@/lib/utils";

// ── Reusable stat cell ────────────────────────────────────────
const Stat = ({ label, value, valueClass, tooltip, isLoading }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1">
      <p className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
        {label}
      </p>
      {tooltip && <InfoTooltip content={tooltip} />}
    </div>
    {isLoading ? (
      <Skeleton className="h-6 w-24" />
    ) : (
      <p className={cn("text-lg font-mono font-bold leading-none", valueClass ?? "text-foreground")}>
        {value ?? "—"}
      </p>
    )}
  </div>
);

const winRateColor = (wr) => {
  if (wr == null) return "text-muted-foreground";
  if (wr >= 60) return "text-[var(--profit)]";
  if (wr >= 50) return "text-[var(--warning)]";
  return "text-[var(--loss)]";
};

const pnlColor = (v) => {
  if (v == null) return "text-muted-foreground";
  if (v > 0) return "text-[var(--profit)]";
  if (v < 0) return "text-[var(--loss)]";
  return "text-muted-foreground";
};

// ── Challenge progress bar ────────────────────────────────────
const ChallengeBar = ({ label, current, target, colorMode = "drawdown", tooltip }) => {
  if (target == null || target <= 0) return null;
  const pct = Math.min(100, (current / target) * 100);

  const barColor = colorMode === "profit"
    ? "bg-[var(--profit)]"
    : pct >= 85 ? "bg-[var(--loss)]"
    : pct >= 70 ? "bg-[var(--warning)]"
    : "bg-[var(--profit)]";

  const textColor = colorMode === "profit"
    ? "text-foreground"
    : pct >= 85 ? "text-[var(--loss)]"
    : pct >= 70 ? "text-[var(--warning)]"
    : "text-muted-foreground";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">{label}</span>
          {tooltip && <InfoTooltip content={tooltip} />}
        </div>
        <span className={cn("font-mono", textColor)}>
          {current?.toFixed(2)}% / {target}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ── Mode: all prop accounts (from dashboard portfolio API) ─────
const AllPropSummary = ({ data, isLoading }) => {
  const noAccounts = !isLoading && (!data || data.accountCount === 0);

  return (
    <div className="trading-card p-4 border-blue-500/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-[var(--warning)]" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Prop Firm Portfolio
          </p>
          {!isLoading && data && (
            <span className="text-[10px] text-muted-foreground/60">
              {data.activeCount ?? 0} active · {data.passedCount ?? 0} passed · {data.failedCount ?? 0} failed
            </span>
          )}
        </div>
        <InfoTooltip content="Prop firm funded accounts. The funded capital is the firm's money, not yours." />
      </div>

      {noAccounts ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No prop accounts yet
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat
            label="Total Funded"
            value={data?.totalFunded != null ? formatCurrency(data.totalFunded) : null}
            tooltip="Total capital funded by prop firms — this is the firms' money, not yours"
            isLoading={isLoading}
          />
          <Stat
            label="Fees Invested"
            value={data?.totalInvested != null ? formatCurrency(data.totalInvested) : null}
            valueClass="text-[var(--loss)]"
            tooltip="Total challenge fees you have paid (your real money spent)"
            isLoading={isLoading}
          />
          <Stat
            label="Payouts Received"
            value={data?.totalPayoutsReceived != null
              ? formatCurrency(data.totalPayoutsReceived)
              : null}
            valueClass="text-[var(--profit)]"
            tooltip="Total payouts received from prop firms across all accounts"
            isLoading={isLoading}
          />
          <Stat
            label="Net ROI"
            value={data?.netROI != null ? formatPnL(data.netROI) : null}
            valueClass={pnlColor(data?.netROI)}
            tooltip="Total payouts received minus total fees invested (from API)"
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};

// ── Mode: single prop account (from /accounts/:id) ────────────
const SinglePropSummary = ({ account, isLoading }) => {
  if (isLoading) {
    return (
      <div className="trading-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!account) return null;

  const propRules  = account.propRules  ?? {};
  const propMetrics = account.propMetrics ?? {};
  const perf       = account.performance ?? {};
  const challenge  = account.challenge   ?? {};

  const propFirmName = propRules.propFirmName ?? "Prop Firm";
  const splitPct     = propRules.payoutRules?.profitSplitPercent;

  return (
    <div className="trading-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Trophy className="h-3.5 w-3.5 text-[var(--warning)]" />
          <p className="text-sm font-semibold text-foreground">{account.name}</p>
          <AccountTypeBadge type="prop" />
          <span className="text-xs text-muted-foreground">{propFirmName}</span>
          <AccountStatusBadge status={account.status} />
        </div>
        <InfoTooltip content="Prop firm account — funded capital is the firm's money. Your profit is your percentage split." />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Funded Capital"
          value={account.accountSize != null ? formatCurrency(account.accountSize) : null}
          tooltip="Capital provided by the prop firm — this is NOT your money"
        />
        <Stat
          label="Fees Invested"
          value={propMetrics.totalFeesSpent != null
            ? formatCurrency(propMetrics.totalFeesSpent)
            : null}
          valueClass="text-[var(--loss)]"
          tooltip="Total challenge fees you have paid to this prop firm"
        />
        <Stat
          label="Payouts Received"
          value={propMetrics.totalPayoutsReceived != null
            ? formatCurrency(propMetrics.totalPayoutsReceived)
            : null}
          valueClass="text-[var(--profit)]"
          tooltip="Total payouts received from this prop firm"
        />
        <Stat
          label="Net ROI"
          value={propMetrics.netROI != null ? formatPnL(propMetrics.netROI) : null}
          valueClass={pnlColor(propMetrics.netROI)}
          tooltip="Payouts received minus fees paid (from API)"
        />
      </div>

      {/* Trading performance row */}
      {perf.totalPnl != null && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
          <Stat
            label="Trading P&L"
            value={formatPnL(perf.totalPnl)}
            valueClass={pnlColor(perf.totalPnl)}
            tooltip="Total trading profit on this account (all closed trades)"
          />
          <Stat
            label="Win Rate"
            value={perf.winRate != null ? `${perf.winRate.toFixed(1)}%` : null}
            valueClass={winRateColor(perf.winRate)}
            tooltip="Win rate from all closed trades"
          />
          <Stat
            label="Total Trades"
            value={perf.totalTrades != null ? String(perf.totalTrades) : null}
            tooltip="Total number of closed trades"
          />
          <Stat
            label="Profit Split"
            value={splitPct != null ? `${splitPct}%` : null}
            tooltip="Your percentage share of trading profits"
          />
        </div>
      )}

      {/* Challenge progress */}
      {(propMetrics.currentProfitPercent != null || propRules.maxDrawdownPercent != null) && (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Challenge Progress
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ChallengeBar
              label="Profit Target"
              current={propMetrics.currentProfitPercent ?? 0}
              target={propRules.profitTarget}
              colorMode="profit"
              tooltip={`Current profit vs target. Need ${propRules.profitTarget}% to pass.`}
            />
            <ChallengeBar
              label="Max Drawdown"
              current={propMetrics.currentDrawdownPercent ?? 0}
              target={propRules.maxDrawdownPercent}
              colorMode="drawdown"
              tooltip={`Current drawdown vs maximum allowed. Account blown at ${propRules.maxDrawdownPercent}%.`}
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2">
            {propMetrics.isPayoutEligible ? (
              <Badge
                variant="outline"
                className="text-[10px] bg-[var(--profit)]/10 text-[var(--profit)] border-[var(--profit)]/20"
              >
                Payout Eligible ✓
              </Badge>
            ) : (
              <p className="text-xs text-muted-foreground">Not payout eligible yet</p>
            )}

            {splitPct != null && (
              <p className="text-xs text-muted-foreground font-mono">
                {splitPct}% profit split
              </p>
            )}

            {propMetrics.totalPayoutsReceived != null && propMetrics.totalPayoutsReceived > 0 && (
              <p className="text-xs text-muted-foreground font-mono">
                Earned: <span className="text-[var(--profit)]">{formatCurrency(propMetrics.totalPayoutsReceived)}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Public export ─────────────────────────────────────────────
export const PropSummarySection = ({ mode, data, account, isLoading }) => {
  if (mode === "single") {
    return <SinglePropSummary account={account} isLoading={isLoading} />;
  }
  return <AllPropSummary data={data} isLoading={isLoading} />;
};
