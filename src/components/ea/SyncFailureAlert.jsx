import { XCircle } from "lucide-react";

export const SyncFailureAlert = ({ eaSync }) => {
  const failures  = eaSync?.consecutiveFailures ?? 0;
  const lastError = eaSync?.lastSyncError;

  if (failures <= 3) return null;

  return (
    <div className="p-4 rounded-xl bg-[var(--loss)]/10 border border-[var(--loss)]/25 space-y-3">
      <div className="flex items-start gap-2.5">
        <XCircle className="h-4 w-4 text-[var(--loss)] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[var(--loss)]">EA Sync Issues Detected</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your EA has failed to sync{" "}
            <span className="font-mono font-bold text-foreground">{failures}</span>{" "}
            times in a row.
          </p>
        </div>
      </div>

      {lastError && (
        <div className="p-2 rounded bg-background border border-border">
          <p className="font-mono text-[11px] text-muted-foreground break-all">{lastError}</p>
        </div>
      )}

      <div className="space-y-1">
        <p className="text-xs font-medium text-foreground">Possible causes:</p>
        <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
          <li>EA auto-trading is disabled in MT4/MT5</li>
          <li>Internet connection issues on your terminal</li>
          <li>MetaTrader terminal is closed</li>
          <li>API key may have been revoked</li>
        </ul>
      </div>
    </div>
  );
};
