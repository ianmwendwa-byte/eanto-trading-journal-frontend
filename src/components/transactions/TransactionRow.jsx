import { useState } from "react";
import { ExternalLink, MoreHorizontal, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { AccountTypeBadge } from "@/components/accounts/AccountTypeBadge";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import {
  TRANSACTION_DIRECTION,
  TRANSACTION_LABELS,
  TRANSACTION_ICONS,
  TRANSACTION_COLORS,
  SOURCE_LABELS,
  EVENT_TAG_LABELS,
} from "@/constants/transactionTypes";
import { useReverseTransaction } from "@/hooks/useTransactions";
import { formatCurrency, formatDate, formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

// Extract the context part from notes like "Trade profit — EURUSD" → "EURUSD"
const extractNoteContext = (note) => {
  if (!note) return null;
  const idx = note.indexOf(" — ");
  if (idx === -1) return null;
  return note.slice(idx + 3).trim();
};

export const TransactionRow = ({
  transaction,
  onTradeClick,
  showAccount = false,
  onViewDetails,
}) => {
  const [reverseOpen, setReverseOpen] = useState(false);
  const { mutate: reverse, isPending: reversing } = useReverseTransaction();

  const {
    _id,
    type,
    amount,
    balanceAfter,
    transactionDate,
    source,
    note,
    relatedTradeId,
    reversed,
    tags = [],
    challengePhase,
    eventTag,
    accountId,
  } = transaction;

  const direction = TRANSACTION_DIRECTION[type] ?? "debit";
  const isCredit  = direction === "credit";
  const Icon      = TRANSACTION_ICONS[type];
  const colorCls  = TRANSACTION_COLORS[type] ?? "text-muted-foreground bg-muted";
  const noteCtx   = extractNoteContext(note);
  const isTradeLinked =
    (type === "trade_profit" || type === "trade_loss") && relatedTradeId;

  const signedAmount = `${isCredit ? "+" : "-"}${formatCurrency(Number(amount).toFixed(2))}`;
  const amountColor  = isCredit ? "text-[var(--profit)]" : "text-[var(--loss)]";

  const sourceBadge = source && source !== "manual" ? SOURCE_LABELS[source] : null;
  const showEventTag = eventTag && eventTag !== "none";
  const showPhase    = challengePhase && challengePhase !== "none";

  const handleReverse = () => {
    reverse(_id, { onSuccess: () => setReverseOpen(false) });
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 border-b border-border last:border-0",
          "hover:bg-muted/30 transition-colors",
          reversed && "opacity-60"
        )}
      >
        {/* ── Col 1: Type icon ───────────────────── */}
        <div
          className={cn(
            "h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0",
            colorCls
          )}
        >
          {Icon && <Icon className="h-4 w-4" />}
        </div>

        {/* ── Col 2: Description ────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                "text-sm font-medium text-foreground",
                reversed && "line-through"
              )}
            >
              {TRANSACTION_LABELS[type] ?? type}
            </span>

            {reversed && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 bg-[var(--loss)]/10 text-[var(--loss)] border-[var(--loss)]/20"
              >
                Reversed
              </Badge>
            )}

            {sourceBadge && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 bg-muted text-muted-foreground border-border"
              >
                {sourceBadge}
              </Badge>
            )}

            {showEventTag && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20"
              >
                {EVENT_TAG_LABELS[eventTag] ?? eventTag}
              </Badge>
            )}

            {showPhase && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 bg-blue-500/10 text-blue-400 border-blue-500/20"
              >
                {challengePhase.charAt(0).toUpperCase() + challengePhase.slice(1)}
              </Badge>
            )}
          </div>

          {/* Note context or tags */}
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {noteCtx && (
              <span className="text-xs text-muted-foreground font-mono">
                {noteCtx}
              </span>
            )}
            {isTradeLinked && (
              <button
                type="button"
                onClick={() => onTradeClick?.(relatedTradeId)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
              </button>
            )}
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── Col 3: Account (optional) ─────────── */}
        {showAccount && accountId && (
          <div className="hidden lg:flex flex-col items-end gap-0.5 flex-shrink-0 w-28">
            <AccountTypeBadge type={accountId.type} />
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
              {accountId.name}
            </span>
          </div>
        )}

        {/* ── Col 4: Date ───────────────────────── */}
        <div className="hidden sm:flex flex-col items-end gap-0.5 flex-shrink-0 w-24">
          <span className={cn("text-sm text-foreground", reversed && "line-through")}>
            {formatDate(transactionDate)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatRelativeTime(transactionDate)}
          </span>
        </div>

        {/* ── Col 5: Amount ─────────────────────── */}
        <div className="text-right flex-shrink-0 w-20 sm:w-28">
          <span
            className={cn(
              "font-mono font-semibold text-sm",
              amountColor,
              reversed && "line-through"
            )}
          >
            {signedAmount}
          </span>
        </div>

        {/* ── Col 6: Running balance ─────────────── */}
        <div className="hidden md:flex items-center gap-1 text-right flex-shrink-0 w-28 justify-end">
          <span
            className={cn(
              "font-mono text-sm text-muted-foreground",
              reversed && "line-through"
            )}
          >
            {formatCurrency(balanceAfter)}
          </span>
          <InfoTooltip content="Account balance after this transaction" />
        </div>

        {/* ── Col 7: Actions ────────────────────── */}
        <div className="flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border w-40">
              <DropdownMenuItem
                className="text-xs gap-2"
                onSelect={() => onViewDetails?.(transaction)}
              >
                View Details
              </DropdownMenuItem>
              {!reversed && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-xs gap-2 text-[var(--loss)] focus:text-[var(--loss)]"
                    onClick={() => setReverseOpen(true)}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reverse
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Reverse confirmation */}
      <AlertDialog open={reverseOpen} onOpenChange={setReverseOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Reverse Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a counter-transaction to cancel out this entry. The
              original transaction will be marked as reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setReverseOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReverse}
              disabled={reversing}
            >
              {reversing ? "Reversing..." : "Reverse"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
