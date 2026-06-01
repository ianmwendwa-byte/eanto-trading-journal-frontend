import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEASyncHistory } from "@/hooks/useEA";
import { formatRelativeTime, formatPnL, getPnLColor } from "@/utils/format";
import { cn } from "@/lib/utils";

const EVENT_ICON = {
  success: { Icon: CheckCircle2, class: "text-[var(--profit)]" },
  failed:  { Icon: XCircle,      class: "text-[var(--loss)]"   },
  partial: { Icon: AlertCircle,  class: "text-[var(--warning)]" },
};

const HistoryRow = ({ event }) => {
  const { Icon, class: iconClass } = EVENT_ICON[event.status] ?? EVENT_ICON.success;

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border last:border-0">
      <Icon className={cn("h-4 w-4 flex-shrink-0", iconClass)} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{event.description}</p>
        {event.pairs && (
          <p className="text-[11px] text-muted-foreground font-mono">{event.pairs}</p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        {event.pnl != null && (
          <p className={cn("text-xs font-mono font-bold", getPnLColor(event.pnl))}>
            {formatPnL(event.pnl)}
          </p>
        )}
        <p className="text-[11px] text-muted-foreground">{formatRelativeTime(event.timestamp)}</p>
      </div>
    </div>
  );
};

export const SyncHistory = ({ accountId, compact = true }) => {
  const limit = compact ? 10 : 50;
  const { data: events, isLoading, refetch, isFetching } = useEASyncHistory(accountId, { limit });

  return (
    <div className="trading-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <p className="text-sm font-semibold text-foreground">Sync History</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={cn("h-3.5 w-3.5 text-muted-foreground", isFetching && "animate-spin")} />
        </Button>
      </div>

      {isLoading ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      ) : !events?.length ? (
        <div className="py-10 text-center">
          <p className="text-sm font-medium text-foreground">No sync history yet</p>
          <p className="text-xs text-muted-foreground mt-1">Connect your EA to start syncing</p>
        </div>
      ) : (
        <div>
          {events.map((event) => (
            <HistoryRow key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};
