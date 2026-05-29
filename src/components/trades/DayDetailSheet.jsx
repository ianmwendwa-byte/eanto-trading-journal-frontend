import { format } from "date-fns";
import { X } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { DirectionBadge } from "./DirectionBadge";
import { SessionBadge }   from "./SessionBadge";
import { getDayStats }    from "@/utils/calendar";
import { formatPnL, getPnLColor, formatCurrency } from "@/utils/format";
import { cn } from "@/lib/utils";

export const DayDetailSheet = ({
  isOpen,
  onClose,
  dateStr,
  trades = [],
  onTradeClick,
}) => {
  const stats = getDayStats(trades);
  const parsedDate = dateStr ? new Date(dateStr) : null;

  const totalCommission = trades.reduce((s, t) => s + (t.commission ?? 0), 0);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[460px] bg-card border-l border-border p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-heading text-base font-semibold">
              {parsedDate ? format(parsedDate, "EEEE, MMM d, yyyy") : "—"}
            </SheetTitle>
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Day summary */}
          {stats && (
            <div className="px-5 py-4 border-b border-border">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Net P&amp;L
                  </p>
                  <p className={cn("text-lg font-mono font-bold", getPnLColor(stats.netPnl))}>
                    {formatPnL(stats.netPnl)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Trades
                  </p>
                  <p className="text-lg font-mono font-bold text-foreground">
                    {stats.count}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    W / L
                  </p>
                  <p className="text-sm font-mono font-bold">
                    <span className="text-[hsl(var(--profit))]">{stats.wins}W</span>
                    <span className="text-muted-foreground mx-1">/</span>
                    <span className="text-[hsl(var(--loss))]">{stats.losses}L</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Trades list */}
          <div className="px-5 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
              Trades
            </p>

            {trades.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No trades on this day
              </p>
            ) : (
              <div className="space-y-2">
                {trades.map((trade) => {
                  const pnlVal = trade.netPnl ?? trade.pnl ?? 0;
                  return (
                    <button
                      key={trade._id}
                      type="button"
                      onClick={() => onTradeClick?.(trade)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <DirectionBadge direction={trade.direction} />
                        <span className="font-mono font-semibold text-sm text-foreground truncate">
                          {trade.pair}
                        </span>
                        <SessionBadge session={trade.session} small />
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className={cn("font-mono font-bold text-sm", getPnLColor(pnlVal))}>
                          {formatPnL(pnlVal)}
                        </p>
                        {trade.realizedRR != null && (
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {trade.realizedRR.toFixed(2)}R
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Day statistics */}
          {stats && trades.length > 0 && (
            <>
              <Separator className="mx-5" />
              <div className="px-5 py-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
                  Day Statistics
                </p>
                <div className="space-y-2.5 text-sm">
                  {[
                    {
                      label: "Win Rate",
                      value: `${((stats.wins / stats.count) * 100).toFixed(1)}%`,
                    },
                    {
                      label: "Best Trade",
                      value: formatPnL(stats.bestTrade),
                      cls:   getPnLColor(stats.bestTrade),
                    },
                    {
                      label: "Worst Trade",
                      value: formatPnL(stats.worstTrade),
                      cls:   getPnLColor(stats.worstTrade),
                    },
                    {
                      label: "Total Commission",
                      value: `–${formatCurrency(totalCommission)}`,
                      cls:   "text-muted-foreground",
                    },
                  ].map(({ label, value, cls }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={cn("font-mono font-medium", cls)}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
