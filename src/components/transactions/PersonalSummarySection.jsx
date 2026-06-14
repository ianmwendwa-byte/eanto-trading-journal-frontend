import { Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { AccountTypeBadge } from "@/components/accounts/AccountTypeBadge";
import { formatCurrency, formatPnL, formatPercent } from "@/utils/format";
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

// ── Mode: all personal accounts (from dashboard portfolio API) ─
const AllPersonalSummary = ({ data, isLoading }) => {
  const noAccounts = !isLoading && (!data || data.accountCount === 0);

  return (
    <div className="trading-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Personal Portfolio
          </p>
          {!isLoading && data && (
            <span className="text-[10px] text-muted-foreground/60">
              {data.normalCount ?? 0} Normal · {data.warCount ?? 0} War
            </span>
          )}
        </div>
        <InfoTooltip content="Your own personal trading capital across normal and war accounts" />
      </div>

      {noAccounts ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No personal accounts yet
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Stat
            label="Current Balance"
            value={data?.totalCapital != null ? formatCurrency(data.totalCapital) : null}
            tooltip="Combined balance across all normal and war accounts (your real money)"
            isLoading={isLoading}
          />
          <Stat
            label="Total P&L"
            value={data?.totalPnl != null ? formatPnL(data.totalPnl) : null}
            valueClass={pnlColor(data?.totalPnl)}
            tooltip="Total trading profit and loss"
            isLoading={isLoading}
          />
          <Stat
            label="True Net P&L"
            value={data?.trueNetPnl != null ? formatPnL(data.trueNetPnl) : null}
            valueClass={pnlColor(data?.trueNetPnl)}
            tooltip="Net P&L after all costs and cash flows"
            isLoading={isLoading}
          />
          <Stat
            label="Return"
            value={data?.returnPercent != null
              ? `${data.returnPercent >= 0 ? "+" : ""}${data.returnPercent.toFixed(2)}%`
              : null}
            valueClass={pnlColor(data?.returnPercent)}
            tooltip="Return on starting capital"
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};

// ── Mode: single personal account (from /accounts/:id) ────────
const SinglePersonalSummary = ({ account, isLoading }) => {
  if (isLoading) {
    return (
      <div className="trading-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
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

  const perf    = account.performance    ?? {};
  const metrics = account.personalMetrics ?? {};

  return (
    <div className="trading-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">{account.name}</p>
          <AccountTypeBadge type={account.type} />
          {account.broker && (
            <span className="text-xs text-muted-foreground">{account.broker}</span>
          )}
        </div>
        <InfoTooltip content="Live balance and performance for this account (your real money)" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Balance"
          value={account.balanceSnapshot != null
            ? formatCurrency(account.balanceSnapshot)
            : null}
          tooltip="Current account balance from latest transaction"
        />
        <Stat
          label="Total P&L"
          value={perf.totalPnl != null ? formatPnL(perf.totalPnl) : null}
          valueClass={pnlColor(perf.totalPnl)}
          tooltip="Total trading profit and loss"
        />
        <Stat
          label="Win Rate"
          value={perf.winRate != null ? `${perf.winRate.toFixed(1)}%` : null}
          valueClass={winRateColor(perf.winRate)}
          tooltip="Win rate from all closed trades"
        />
        <Stat
          label="True Net P&L"
          value={metrics.trueNetPnl != null ? formatPnL(metrics.trueNetPnl) : null}
          valueClass={pnlColor(metrics.trueNetPnl)}
          tooltip="Net P&L after all trading costs and cash flows"
        />
      </div>

      {/* Second row — additional metrics */}
      {(metrics.totalDeposits != null || metrics.totalWithdrawals != null || metrics.returnOnCapital != null) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
          <Stat
            label="Deposits"
            value={metrics.totalDeposits != null ? formatCurrency(metrics.totalDeposits) : null}
            valueClass="text-[var(--loss)]"
            tooltip="Total deposited into this account"
          />
          <Stat
            label="Withdrawals"
            value={metrics.totalWithdrawals != null ? formatCurrency(metrics.totalWithdrawals) : null}
            valueClass="text-[var(--profit)]"
            tooltip="Total withdrawn from this account"
          />
          <Stat
            label="Return on Capital"
            value={metrics.returnOnCapital != null
              ? `${metrics.returnOnCapital >= 0 ? "+" : ""}${metrics.returnOnCapital.toFixed(2)}%`
              : null}
            valueClass={pnlColor(metrics.returnOnCapital)}
            tooltip="Return on starting capital"
          />
          <Stat
            label="Trades"
            value={perf.totalTrades != null ? String(perf.totalTrades) : null}
            tooltip="Total number of closed trades"
          />
        </div>
      )}
    </div>
  );
};

// ── Public export — selects mode automatically ─────────────────
export const PersonalSummarySection = ({ mode, data, account, isLoading }) => {
  if (mode === "single") {
    return <SinglePersonalSummary account={account} isLoading={isLoading} />;
  }
  return <AllPersonalSummary data={data} isLoading={isLoading} />;
};
