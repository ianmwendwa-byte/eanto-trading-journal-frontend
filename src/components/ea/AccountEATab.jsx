import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useEAStatus } from "@/hooks/useEA";
import { formatRelativeTime } from "@/utils/format";

import { EAStatusDot }         from "./EAStatusIndicator";
import { EAKeyManager }        from "./EAKeyManager";
import { EASetupInstructions } from "./EASetupInstructions";
import { BrokerInfoCard }      from "./BrokerInfoCard";
import { BalanceMismatchAlert } from "./BalanceMismatchAlert";
import { SyncFailureAlert }    from "./SyncFailureAlert";
import { SyncHistory }         from "./SyncHistory";
import { EAConfigPanel }       from "./EAConfigPanel";

export const AccountEATab = ({ account, isTabActive }) => {
  const {
    data: liveStatus,
    isLoading: statusLoading,
    refetch,
    isFetching,
  } = useEAStatus(account._id, { polling: isTabActive });

  // /ea/status is the authoritative real-time source (isOnline, hasApiKey, brokerInfo, etc.)
  // account.eaSync is only a fallback while the first status fetch is in flight.
  const eaSync = liveStatus ?? account.eaSync ?? {};

  if (statusLoading && !account.eaSync) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  const lastBeat = eaSync.lastHeartbeatAt ?? eaSync.lastHeartbeat;

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-foreground">EA Sync</h2>
          <EAStatusDot eaSync={eaSync} size="md" showLabel />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {lastBeat && <span>Last heartbeat: {formatRelativeTime(lastBeat)}</span>}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* ── Alerts (stacked) ── */}
      {(eaSync.consecutiveFailures > 3 || eaSync.balanceMismatchCount > 0) && (
        <div className="space-y-3">
          <SyncFailureAlert eaSync={eaSync} />
          <BalanceMismatchAlert eaSync={eaSync} accountId={account._id} />
        </div>
      )}

      {/* ── EA stats row ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="trading-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Synced</p>
          <p className="text-xl font-bold font-mono text-foreground">{eaSync.totalSynced ?? 0}</p>
        </div>
        <div className="trading-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Last Sync</p>
          <p className="text-xs font-mono text-foreground mt-1">
            {eaSync.lastSyncedAt ? formatRelativeTime(eaSync.lastSyncedAt) : "Never"}
          </p>
        </div>
        <div className="trading-card p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mode</p>
          <p className="text-xs font-mono text-foreground mt-1">
            {eaSync.syncMode === "all" ? "All Trades" : eaSync.syncMode === "new_only" ? "New Only" : "—"}
          </p>
        </div>
      </div>

      {/* ── Main 2-col layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Key manager + instructions */}
        <div className="space-y-4">
          <EAKeyManager account={account} eaSync={eaSync} />
          <EASetupInstructions />
        </div>

        {/* Right: Broker info */}
        <div className="space-y-4">
          <BrokerInfoCard eaSync={eaSync} />
        </div>
      </div>

      {/* ── Sync history ── */}
      <SyncHistory accountId={account._id} compact />

      {/* ── Advanced config ── */}
      <EAConfigPanel account={account} eaSync={eaSync} />
    </div>
  );
};
