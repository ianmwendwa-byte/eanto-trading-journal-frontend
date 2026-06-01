import { ChevronsUpDown, ChevronUp, ChevronDown, MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button }   from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InfoTooltip }        from "@/components/shared/InfoTooltip";
import { DirectionBadge }     from "./DirectionBadge";
import { OutcomeBadge }       from "./OutcomeBadge";
import { SessionBadge }       from "./SessionBadge";
import { GradeStars }         from "./GradeStars";
import { PropComplianceBadge } from "./PropComplianceBadge";
import { formatPnL, getPnLColor } from "@/utils/format";
import { getTradeDuration }   from "@/utils/tradeDuration";
import { cn }    from "@/lib/utils";
import { format } from "date-fns";

const formatDate   = (v) => v ? format(new Date(v), "MMM d, yyyy") : "—";
const formatTime   = (v) => v ? format(new Date(v), "HH:mm")       : "";
const formatPrice  = (v) => v != null ? Number(v).toFixed(5) : "—";
const formatLots   = (v) => v != null ? Number(v).toFixed(2)  : "—";
const formatRR     = (v) => {
  if (v == null) return "—";
  const n = Number(v);
  if (n > 100) return `⚡ ${n.toFixed(2)}:1`;
  return `${n.toFixed(2)}:1`;
};

const SOURCE_BADGE = {
  ea:         { label: "EA",  cls: "bg-blue-500/10 text-blue-400 border-blue-500/20"   },
  csv_import: { label: "CSV", cls: "bg-muted text-muted-foreground border-border"       },
};

const SORTABLE_COLS = ["closedAt", "pair", "pnl", "netPnl", "realizedRR"];

const SortIcon = ({ col, sort }) => {
  if (!SORTABLE_COLS.includes(col)) return null;
  const [field, dir] = (sort ?? "closedAt_desc").split("_");
  if (field !== col) return <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50 ml-1" />;
  return dir === "desc"
    ? <ChevronDown className="h-3 w-3 text-primary ml-1" />
    : <ChevronUp   className="h-3 w-3 text-primary ml-1" />;
};

const Th = ({ children, col, sort, onSort, right = false, className }) => {
  const sortable = SORTABLE_COLS.includes(col);
  return (
    <th
      onClick={sortable ? () => {
        const [field, dir] = (sort ?? "closedAt_desc").split("_");
        const newDir = field === col && dir === "desc" ? "asc" : "desc";
        onSort?.(`${col}_${newDir}`);
      } : undefined}
      className={cn(
        "px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap select-none",
        sortable && "cursor-pointer hover:text-foreground",
        right && "text-right",
        className
      )}
    >
      <span className="inline-flex items-center">
        {children}
        {sortable && <SortIcon col={col} sort={sort} />}
      </span>
    </th>
  );
};

const Td = ({ children, right = false, mono = false, className }) => (
  <td className={cn(
    "px-3 py-2 align-middle text-sm border-b border-border whitespace-nowrap",
    right && "text-right",
    mono  && "font-mono",
    className
  )}>
    {children}
  </td>
);

// ── Skeleton ──────────────────────────────────────────────────
export const TradesTableSkeleton = () => (
  <div className="trading-card overflow-hidden">
    <table className="w-full">
      <thead>
        <tr className="border-b border-border">
          {[120, 80, 70, 50, 90, 90, 90, 90, 60, 80, 60, 70, 32].map((w, i) => (
            <th key={i} className="px-3 py-2.5">
              <Skeleton className="h-3 rounded" style={{ width: w }} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 8 }).map((_, i) => (
          <tr key={i} className="border-b border-border">
            {[120, 80, 70, 50, 90, 90, 90, 90, 60, 80, 60, 70, 32].map((w, j) => (
              <td key={j} className="px-3 py-3">
                <Skeleton className="h-4 rounded" style={{ width: w }} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── Main table ────────────────────────────────────────────────
export const TradesTable = ({
  trades = [],
  isLoading,
  isFetching,
  sort,
  onSort,
  onRowClick,
  onEdit,
  onDelete,
  selectedTradeId,
}) => {
  if (isLoading) return <TradesTableSkeleton />;

  const wins = trades.filter((t) => t.outcome === "win").length;

  return (
    <div className={cn(
      "trading-card overflow-hidden transition-opacity duration-200",
      isFetching && "opacity-60"
    )}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-card z-10 border-b border-border">
            <tr>
              <Th col="closedAt" sort={sort} onSort={onSort}>Date</Th>
              <Th col="pair"     sort={sort} onSort={onSort}>Pair</Th>
              <Th col="direction">Dir</Th>
              <Th col="lotSize"  right>Lots</Th>
              <Th col="entryPrice" right>Entry</Th>
              <Th col="exitPrice"  right>Exit</Th>
              <Th col="netPnl" sort={sort} onSort={onSort} right>
                <span className="inline-flex items-center gap-1">
                  Net P&amp;L
                  <InfoTooltip content="P&L after commission and swap costs" />
                </span>
              </Th>
              <Th col="realizedRR" sort={sort} onSort={onSort} right>
                <span className="inline-flex items-center gap-1">
                  R:R
                  <InfoTooltip content="Realized reward:risk ratio" />
                </span>
              </Th>
              <Th col="session"  className="hidden lg:table-cell">Session</Th>
              <Th col="outcome">Outcome</Th>
              <Th col="compliance" className="hidden xl:table-cell">Compliance</Th>
              <Th col="grade" className="hidden xl:table-cell">Quality</Th>
              <Th col="actions" className="w-8" />
            </tr>
          </thead>

          <tbody>
            {trades.map((trade) => {
              const selected  = trade._id === selectedTradeId;
              const netPnlVal = trade.netPnl ?? trade.pnl ?? 0;
              const duration  = getTradeDuration(trade.openedAt, trade.closedAt);
              const source    = SOURCE_BADGE[trade.source];

              return (
                <tr
                  key={trade._id}
                  onClick={() => onRowClick?.(trade)}
                  className={cn(
                    "cursor-pointer transition-colors border-b border-border group",
                    selected
                      ? "bg-primary/5 border-l-2 border-l-primary"
                      : "hover:bg-muted/40"
                  )}
                >
                  {/* Date + duration */}
                  <Td>
                    <div>
                      <p className="text-sm text-foreground">{formatDate(trade.closedAt)}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {formatTime(trade.closedAt)} · {duration}
                      </p>
                    </div>
                  </Td>

                  {/* Pair + source */}
                  <Td>
                    <div>
                      <p className="font-mono font-semibold text-foreground">{trade.pair ?? "—"}</p>
                      {source && (
                        <span className={cn(
                          "inline-flex items-center px-1 py-0 rounded text-[9px] font-medium border mt-0.5",
                          source.cls
                        )}>
                          {source.label}
                        </span>
                      )}
                    </div>
                  </Td>

                  <Td>
                    <DirectionBadge direction={trade.direction} />
                  </Td>

                  <Td mono right className="text-muted-foreground">
                    {formatLots(trade.lotSize)}
                  </Td>

                  <Td mono right className="text-muted-foreground text-xs">
                    {formatPrice(trade.entryPrice)}
                  </Td>

                  <Td mono right className="text-muted-foreground text-xs">
                    {formatPrice(trade.exitPrice)}
                  </Td>

                  <Td mono right className={cn("font-bold", getPnLColor(netPnlVal))}>
                    {formatPnL(netPnlVal)}
                  </Td>

                  <Td mono right className="text-muted-foreground text-sm">
                    {formatRR(trade.realizedRR)}
                  </Td>

                  <Td className="hidden lg:table-cell">
                    <SessionBadge session={trade.session} />
                  </Td>

                  <Td>
                    <OutcomeBadge outcome={trade.outcome} />
                  </Td>

                  <Td className="hidden xl:table-cell">
                    <PropComplianceBadge propCompliance={trade.propCompliance} />
                  </Td>

                  <Td className="hidden xl:table-cell">
                    <GradeStars value={trade.setupQualityRating ?? 0} readonly />
                  </Td>

                  <Td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-card border-border w-40"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem onClick={() => onRowClick?.(trade)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete?.(trade)}
                        >
                          Delete Trade
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Td>
                </tr>
              );
            })}
          </tbody>

          {/* Page count row — count only, no aggregated PnL to avoid mixing account types */}
          {trades.length > 0 && (
            <tfoot>
              <tr className="border-t border-border bg-muted/20">
                <td colSpan={13} className="px-3 py-2 text-xs text-muted-foreground">
                  {trades.length} trade{trades.length !== 1 ? "s" : ""} on this page
                  · {wins}W / {trades.length - wins}L
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
