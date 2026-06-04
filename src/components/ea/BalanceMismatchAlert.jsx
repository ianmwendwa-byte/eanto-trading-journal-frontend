import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatRelativeTime } from "@/utils/format";

export const BalanceMismatchAlert = ({ eaSync, accountId }) => {
  const [dismissed, setDismissed] = useState(false);

  const count  = eaSync?.balanceMismatchCount ?? 0;
  const lastAt = eaSync?.lastMismatchAt;
  const amount = eaSync?.lastMismatchAmount;

  if (count === 0 || dismissed) return null;

  return (
    <div className="p-4 rounded-xl bg-[var(--warning)]/10 border border-[var(--warning)]/25 space-y-3">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="h-4 w-4 text-[var(--warning)] shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--warning)]">Balance Mismatch Detected</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your EA reported a balance different from what Kraviq has on record.
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-[10px] text-muted-foreground">Mismatches</p>
          <p className="text-sm font-bold font-mono text-foreground">{count}</p>
        </div>
        {lastAt && (
          <div>
            <p className="text-[10px] text-muted-foreground">Last Mismatch</p>
            <p className="text-xs font-mono text-foreground">{formatRelativeTime(lastAt)}</p>
          </div>
        )}
        {amount != null && (
          <div>
            <p className="text-[10px] text-muted-foreground">Difference</p>
            <p className="text-xs font-bold font-mono text-[var(--loss)]">
              {formatCurrency(Math.abs(amount))}
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        A balance mismatch can occur when trades were opened before EA sync started,
        manual adjustments were made, or the EA was temporarily offline.
      </p>

      <div className="flex gap-2">
        <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => setDismissed(true)}>
          Dismiss
        </Button>
      </div>
    </div>
  );
};
