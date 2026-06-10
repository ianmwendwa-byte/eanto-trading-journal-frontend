import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Pause, Play, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { AccountTypeBadge } from "@/components/accounts/AccountTypeBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { EAStatusDot } from "@/components/ea/EAStatusIndicator";
import { VerificationBadge } from "@/components/ea/VerificationBadge";
import { SyncHistory } from "@/components/ea/SyncHistory";

import { useAccounts } from "@/hooks/useAccounts";
import { useEAStatus } from "@/hooks/useEA";
import { formatRelativeTime, formatCompact } from "@/utils/format";
import { pageVariants, staggerContainerVariants, staggerItemVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

// ── Per-account status polling card ──────────────────────────
const EAAccountCard = ({ account, pollingActive }) => {
  const navigate = useNavigate();

  const { data: liveStatus } = useEAStatus(account._id, { polling: pollingActive });
  const eaSync = liveStatus ?? account.eaSync ?? {};

  const brokerInfo = eaSync.brokerInfo ?? {};
  const failures   = eaSync.consecutiveFailures ?? 0;
  const mismatches = eaSync.balanceMismatchCount ?? 0;

  return (
    <motion.div variants={staggerItemVariants}>
      <div className="trading-card p-4 space-y-3 hover:border-primary/30 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground truncate">{account.name}</p>
              <AccountTypeBadge type={account.type} />
            </div>
            {(account.broker || account.propRules?.propFirmName) && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {account.broker ?? account.propRules?.propFirmName}
              </p>
            )}
          </div>
          <EAStatusDot eaSync={eaSync} size="sm" showLabel />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] text-muted-foreground">Synced</p>
            <p className="text-sm font-bold font-mono text-foreground">{eaSync.totalSynced ?? 0}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Last Sync</p>
            <p className="text-[11px] font-mono text-foreground">
              {eaSync.lastSyncedAt ? formatRelativeTime(eaSync.lastSyncedAt) : "Never"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Verified</p>
            <VerificationBadge
              verificationStatus={eaSync.verificationStatus}
              className="text-[10px] px-1.5 py-0"
            />
          </div>
        </div>

        {/* Broker compact info */}
        {brokerInfo.accountNumber && (
          <div className="text-[11px] text-muted-foreground space-y-0.5 border-t border-border pt-2">
            <div className="flex justify-between">
              <span>Broker:</span>
              <span className="text-foreground font-mono">{brokerInfo.accountCompany ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span>Account:</span>
              <span className="text-foreground font-mono">{brokerInfo.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span className={cn("font-mono", brokerInfo.isLive ? "text-[var(--profit)]" : "text-[var(--warning)]")}>
                {brokerInfo.isLive ? "Live" : "Demo"}
              </span>
            </div>
          </div>
        )}

        {/* Alerts compact */}
        {(failures > 3 || mismatches > 0) && (
          <div className="space-y-1 border-t border-border pt-2">
            {failures > 3 && (
              <p className="text-[11px] text-[var(--loss)]">
                ⚠ {failures} consecutive sync failures
              </p>
            )}
            {mismatches > 0 && (
              <p className="text-[11px] text-[var(--warning)]">
                ⚠ Balance mismatch detected
              </p>
            )}
          </div>
        )}

        {/* Needs review banner */}
        {eaSync.verificationStatus === "needs_review" && (
          <div className="border-t border-[var(--warning)]/30 pt-2">
            <Link
              to={`/accounts/${account._id}/reconciliation`}
              className="flex items-center gap-2 text-[11px] text-[var(--warning)] hover:text-[var(--warning)]/80 transition-colors"
            >
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              Anomalies need review — tap to resolve
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={() => navigate(`/accounts/${account._id}?tab=ea`)}
          >
            View Account
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-7 text-xs"
            onClick={() => navigate(`/accounts/${account._id}?tab=ea`)}
          >
            Manage Key
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// ── Stats summary bar ─────────────────────────────────────────
const EAStatsBar = ({ accounts }) => {
  const stats = useMemo(() => {
    let online = 0, offline = 0, synced = 0, issues = 0;
    accounts.forEach((a) => {
      const es = a.eaSync ?? {};
      if (es.isOnline) online++;
      else offline++;
      synced += es.totalSynced ?? 0;
      if ((es.consecutiveFailures ?? 0) > 3) issues++;
    });
    return { online, offline, synced, issues };
  }, [accounts]);

  const cards = [
    { label: "Online",      value: stats.online,  color: "text-[var(--profit)]" },
    { label: "Offline",     value: stats.offline, color: "text-[var(--loss)]"   },
    { label: "Total Synced",value: formatCompact(stats.synced), color: "text-foreground" },
    { label: "Sync Issues", value: stats.issues,  color: stats.issues > 0 ? "text-[var(--warning)]" : "text-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(({ label, value, color }) => (
        <div key={label} className="trading-card p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className={cn("text-2xl font-bold font-mono mt-1", color)}>{value}</p>
        </div>
      ))}
    </div>
  );
};

// ── Main EASync page ──────────────────────────────────────────
export const EASync = () => {
  const [pollingActive, setPollingActive] = useState(true);
  const { data: accountsData, isLoading } = useAccounts({ limit: 50 });

  const eaAccounts = useMemo(
    () => (accountsData?.accounts ?? []).filter((a) => a.eaSync?.enabled === true),
    [accountsData]
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6 space-y-6"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">EA Sync</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${eaAccounts.length} connected account${eaAccounts.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setPollingActive((p) => !p)}
        >
          {pollingActive
            ? <><Pause className="h-3.5 w-3.5" />Pause Polling</>
            : <><Play className="h-3.5 w-3.5" />Resume Polling</>
          }
        </Button>
      </div>

      {/* ── Loading state ── */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      )}

      {/* ── Stats bar ── */}
      {!isLoading && eaAccounts.length > 0 && (
        <EAStatsBar accounts={eaAccounts} />
      )}

      {/* ── Empty state ── */}
      {!isLoading && eaAccounts.length === 0 && (
        <EmptyState
          icon={Zap}
          title="No EA accounts configured"
          description="Enable EA sync on a trading account to start automatically syncing trades from your MT4/MT5 terminal."
          action={
            <Button onClick={() => window.location.assign("/accounts")}>
              Go to Accounts
            </Button>
          }
        />
      )}

      {/* ── Account cards grid ── */}
      {!isLoading && eaAccounts.length > 0 && (
        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {eaAccounts.map((account) => (
            <EAAccountCard
              key={account._id}
              account={account}
              pollingActive={pollingActive}
            />
          ))}
        </motion.div>
      )}

      {/* ── Sync history ── */}
      {!isLoading && eaAccounts.length > 0 && eaAccounts[0] && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Recent Sync Activity</h2>
          <SyncHistory accountId={eaAccounts[0]._id} compact={false} />
        </div>
      )}
    </motion.div>
  );
};
