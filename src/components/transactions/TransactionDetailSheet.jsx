import { X, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AccountTypeBadge } from "@/components/accounts/AccountTypeBadge";
import {
  TRANSACTION_DIRECTION,
  TRANSACTION_LABELS,
  TRANSACTION_ICONS,
  TRANSACTION_COLORS,
  SOURCE_LABELS,
  EVENT_TAG_LABELS,
} from "@/constants/transactionTypes";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from "@/utils/format";
import { cn } from "@/lib/utils";

// Extract context after " — " from note
const extractNoteContext = (note) => {
  if (!note) return null;
  const idx = note.indexOf(" — ");
  return idx === -1 ? null : note.slice(idx + 3).trim();
};

const DetailRow = ({ label, children }) => (
  <div className="flex items-start justify-between gap-4 py-1.5">
    <span className="text-xs text-muted-foreground flex-shrink-0 w-32">{label}</span>
    <div className="text-xs text-foreground text-right">{children}</div>
  </div>
);

export const TransactionDetailSheet = ({ transaction, onClose, onTradeClick }) => {
  if (!transaction) return null;

  const {
    _id,
    type,
    amount,
    balanceBefore,
    balanceAfter,
    equityAfter,
    transactionDate,
    createdAt,
    updatedAt,
    source,
    note,
    relatedTradeId,
    reversed,
    reversedAt,
    reversalTransactionId,
    tags = [],
    challengePhase,
    eventTag,
    accountId,
    category,
    editHistory = [],
    currency,
    ticketNumber,
    brokerRef,
    payoutNumber,
    profitSplitPct,
  } = transaction;

  const direction = TRANSACTION_DIRECTION[type] ?? "debit";
  const isCredit  = direction === "credit";
  const Icon      = TRANSACTION_ICONS[type];
  const colorCls  = TRANSACTION_COLORS[type] ?? "text-muted-foreground bg-muted";
  const noteCtx   = extractNoteContext(note);
  const sourceBadge = source && source !== "manual" ? SOURCE_LABELS[source] : null;
  const showEventTag = eventTag && eventTag !== "none";
  const showPhase    = challengePhase && challengePhase !== "none";

  const signedAmount = `${isCredit ? "+" : "-"}${formatCurrency(Number(amount).toFixed(2))}`;
  const amountColor  = isCredit ? "text-[var(--profit)]" : "text-[var(--loss)]";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <p className="text-sm font-semibold text-foreground">Transaction Details</p>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ── Type + Amount block ─────────────────── */}
        <div className="flex items-start gap-3">
          <div className={cn("h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0", colorCls)}>
            {Icon && <Icon className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <p className={cn("text-base font-semibold text-foreground", reversed && "line-through")}>
                {TRANSACTION_LABELS[type] ?? type}
              </p>
              {reversed && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-[var(--loss)]/10 text-[var(--loss)] border-[var(--loss)]/20">
                  Reversed
                </Badge>
              )}
            </div>
            {noteCtx && (
              <p className="text-xs text-muted-foreground font-mono">{noteCtx}</p>
            )}
          </div>
        </div>

        {/* ── Amount ──────────────────────────────── */}
        <div className="trading-card p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Amount</span>
            <span className={cn("text-xl font-mono font-bold", amountColor, reversed && "line-through")}>
              {signedAmount}
            </span>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5">Balance Before</p>
              <p className="text-sm font-mono text-foreground">{formatCurrency(balanceBefore)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5">Balance After</p>
              <p className="text-sm font-mono text-foreground">{formatCurrency(balanceAfter)}</p>
            </div>
          </div>
        </div>

        {/* ── Details ─────────────────────────────── */}
        <div className="trading-card p-3.5 divide-y divide-border">
          <DetailRow label="Date">
            <span>{formatDate(transactionDate)}</span>
            <span className="text-muted-foreground ml-1.5">
              {formatRelativeTime(transactionDate)}
            </span>
          </DetailRow>

          {accountId && (
            <DetailRow label="Account">
              <div className="flex items-center gap-1.5 justify-end">
                <AccountTypeBadge type={accountId.type} />
                <span>{accountId.name}</span>
              </div>
            </DetailRow>
          )}

          <DetailRow label="Category">
            <span className="capitalize">{category ?? "—"}</span>
          </DetailRow>

          {sourceBadge && (
            <DetailRow label="Source">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-muted text-muted-foreground border-border">
                {sourceBadge}
              </Badge>
            </DetailRow>
          )}

          {showPhase && (
            <DetailRow label="Challenge Phase">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
                {challengePhase.charAt(0).toUpperCase() + challengePhase.slice(1)}
              </Badge>
            </DetailRow>
          )}

          {showEventTag && (
            <DetailRow label="Event">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20">
                {EVENT_TAG_LABELS[eventTag] ?? eventTag}
              </Badge>
            </DetailRow>
          )}

          {currency && (
            <DetailRow label="Currency">
              {currency}
            </DetailRow>
          )}

          {ticketNumber && (
            <DetailRow label="Ticket #">
              <span className="font-mono">{ticketNumber}</span>
            </DetailRow>
          )}

          {brokerRef && (
            <DetailRow label="Broker Ref">
              <span className="font-mono">{brokerRef}</span>
            </DetailRow>
          )}

          {payoutNumber != null && (
            <DetailRow label="Payout #">{payoutNumber}</DetailRow>
          )}

          {profitSplitPct != null && (
            <DetailRow label="Profit Split">{profitSplitPct}%</DetailRow>
          )}
        </div>

        {/* ── Note ────────────────────────────────── */}
        {note && (
          <div className="trading-card p-3.5 space-y-1.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Note
            </p>
            <p className="text-sm text-foreground leading-relaxed">{note}</p>
          </div>
        )}

        {/* ── Tags ────────────────────────────────── */}
        {tags.length > 0 && (
          <div className="trading-card p-3.5 space-y-1.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Related trade ────────────────────────── */}
        {relatedTradeId && (
          <button
            type="button"
            onClick={() => onTradeClick?.(relatedTradeId)}
            className="w-full trading-card p-3 flex items-center justify-between hover:border-primary/40 transition-colors"
          >
            <span className="text-xs font-medium text-foreground">View Related Trade</span>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}

        {/* ── Reversal info ────────────────────────── */}
        {reversed && (
          <div className="trading-card p-3.5 space-y-1.5 border-[var(--loss)]/20">
            <p className="text-[10px] uppercase tracking-wider text-[var(--loss)] font-medium">
              Reversed
            </p>
            {reversedAt && (
              <p className="text-xs text-muted-foreground">{formatDateTime(reversedAt)}</p>
            )}
            {reversalTransactionId && (
              <p className="text-[11px] text-muted-foreground font-mono break-all">
                Counter TX: {reversalTransactionId}
              </p>
            )}
          </div>
        )}

        {/* ── Technical ───────────────────────────── */}
        <div className="trading-card p-3.5 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Technical
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">ID</span>
              <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[180px]">{_id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Created</span>
              <span className="text-[11px] text-muted-foreground">{formatDateTime(createdAt)}</span>
            </div>
            {editHistory.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Edit History</span>
                <span className="text-[11px] text-muted-foreground">
                  Edited {editHistory.length} time{editHistory.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
