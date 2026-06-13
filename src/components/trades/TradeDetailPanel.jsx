import { useState, useRef, useCallback } from "react";
import { X, Trash2, AlertTriangle, HelpCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Button }    from "@/components/ui/button";
import { Textarea }  from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { DirectionBadge }      from "./DirectionBadge";
import { OutcomeBadge }        from "./OutcomeBadge";
import { SessionBadge }        from "./SessionBadge";
import { GradeStars }          from "./GradeStars";
import { PropComplianceBadge } from "./PropComplianceBadge";
import { DisciplineScoreBadge } from "./DisciplineScoreBadge";
import { useUpdateTrade, useDeleteTrade } from "@/hooks/useTrades";
import { formatPnL, formatCurrency, getPnLColor, formatPips } from "@/utils/format";
import { getTradeDuration, isShortDuration } from "@/utils/tradeDuration";
import { cn } from "@/lib/utils";

const EXIT_REASON_MAP = {
  tp_hit:        { label: "Take Profit Hit ✓", cls: "text-[var(--profit)]" },
  sl_hit:        { label: "Stop Loss Hit ✗",   cls: "text-[var(--loss)]"   },
  manual:        { label: "Manual Close",       cls: "text-foreground"      },
  trailing_stop: { label: "Trailing Stop",      cls: "text-muted-foreground" },
};

const FLAG_LABELS = {
  NO_STOP_LOSS:   "No stop loss set",
  NO_TAKE_PROFIT: "No take profit set",
  POOR_RR:        "Risk:Reward below 1:1",
  HIGH_RISK:      "Risk above 2% per trade",
};

const SEVERITY_STYLES = {
  warning:  "bg-[var(--warning)]/10 border-[var(--warning)]/30 text-[var(--warning)]",
  low:      "bg-primary/10 border-primary/30 text-[color:var(--primary)]",
  medium:   "bg-[var(--warning)]/10 border-[var(--warning)]/30 text-[var(--warning)]",
  high:     "bg-[var(--loss)]/10 border-[var(--loss)]/30 text-[var(--loss)]",
  critical: "bg-[var(--loss)]/15 border-[var(--loss)]/50 text-[var(--loss)]",
};

const getRiskQualityClass = (score) => {
  if (score == null) return "text-muted-foreground";
  if (score >= 80) return "text-[var(--profit)]";
  if (score >= 60) return "text-[var(--primary)]";
  if (score >= 40) return "text-[var(--warning)]";
  return "text-[var(--loss)]";
};

const SETUP_TAGS = [
  "breakout", "trend_follow", "reversal", "range",
  "news", "scalp", "swing", "support_resistance", "fibonacci",
];

const formatPrice = (v) => v != null ? Number(v).toFixed(5) : "—";

const SectionTitle = ({ children }) => (
  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
    {children}
  </p>
);

const MetaRow = ({ label, value, mono = false, className }) => (
  <div className="space-y-0.5">
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className={cn("text-sm text-foreground", mono && "font-mono", className)}>{value ?? "—"}</p>
  </div>
);

const CheckRow = ({ label, value }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className={value === true ? "text-[var(--profit)]" : value === false ? "text-[var(--loss)]" : "text-muted-foreground"}>
      {value === true ? "✓ Valid" : value === false ? "✗ Invalid" : "—"}
    </span>
  </div>
);

export const TradeDetailPanel = ({ trade, onClose, onDelete }) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [savedNote,  setSavedNote]  = useState(false);
  const noteDebounce = useRef(null);

  const { mutate: updateTrade } = useUpdateTrade(trade?._id);
  const { mutate: deleteTrade, isPending: deleting } = useDeleteTrade();

  const handleGradeChange = (val) => {
    updateTrade({ setupQualityRating: val || null });
  };

  const handleNoteChange = useCallback((e) => {
    const val = e.target.value;
    clearTimeout(noteDebounce.current);
    noteDebounce.current = setTimeout(() => {
      updateTrade({ note: val }, {
        onSuccess: () => {
          setSavedNote(true);
          setTimeout(() => setSavedNote(false), 2000);
        },
      });
    }, 1500);
  }, [updateTrade]);

  const handleTagToggle = (tag) => {
    const current = trade.tags ?? [];
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    updateTrade({ tags: next });
  };

  const handleDeleteConfirm = () => {
    deleteTrade(trade._id, {
      onSuccess: () => {
        setDeleteOpen(false);
        onDelete?.();
      },
    });
  };

  if (!trade) return null;

  const grossPnl   = trade.grossPnl   ?? trade.pnl ?? 0;
  const netPnl     = trade.netPnl     ?? grossPnl;
  const commission = trade.commission ?? 0;
  const swap       = trade.swap       ?? 0;
  const duration   = getTradeDuration(trade.openedAt, trade.closedAt);
  const shortDuration = isShortDuration(trade.openedAt, trade.closedAt);

  const propCompliance = trade.propCompliance ?? {};
  const discipline     = trade.discipline     ?? {};
  const behavioural    = trade.behavioural    ?? {};
  const slMgmt         = trade.stopLossManagement ?? {};

  const weekdayDisplay = trade.weekday
    ? trade.weekday.charAt(0).toUpperCase() + trade.weekday.slice(1)
    : null;

  return (
    <>
      <div className="flex flex-col h-full">
        {/* ── Header ────────────────────────────────── */}
        <div className="px-5 pt-5 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-mono font-bold text-foreground">{trade.pair}</h2>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <DirectionBadge direction={trade.direction} />
                <OutcomeBadge   outcome={trade.outcome}    />
                {trade.session && <SessionBadge session={trade.session} />}
                {propCompliance.checked && (
                  <PropComplianceBadge propCompliance={propCompliance} />
                )}
                {trade.source && trade.source !== "manual" && (
                  <span className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border",
                    trade.source === "ea"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted text-muted-foreground border-border"
                  )}>
                    {trade.source === "ea" ? "EA" : "CSV"}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable content ────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Section 1 — Execution */}
          <div className="px-5 py-4 space-y-3">
            <SectionTitle>Execution</SectionTitle>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <MetaRow label="Entry Price"  value={formatPrice(trade.entryPrice)}  mono />
              <MetaRow label="Exit Price"   value={formatPrice(trade.exitPrice)}   mono />
              <MetaRow label="Stop Loss"    value={trade.stopLoss   != null ? formatPrice(trade.stopLoss)   : null} mono />
              <MetaRow label="Take Profit"  value={trade.takeProfit != null ? formatPrice(trade.takeProfit) : null} mono />
              <MetaRow label="Lot Size"     value={trade.lotSize?.toFixed(2)} mono />
              {trade.magicNumber != null && trade.magicNumber !== 0 && (
                <MetaRow label="EA Magic" value={String(trade.magicNumber)} mono />
              )}
              {trade.eaData?.comment && (
                <div className="col-span-2 space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Comment</p>
                  <p className="text-sm text-foreground">{trade.eaData.comment}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Section 2 — Results */}
          <div className="px-5 py-4 space-y-3">
            <SectionTitle>Results</SectionTitle>
            <div className="trading-card p-3 space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Gross P&amp;L</span>
                <span className={cn("font-mono font-bold text-lg", getPnLColor(grossPnl))}>
                  {formatPnL(grossPnl)}
                </span>
              </div>
              {commission !== 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Commission</span>
                  <span className={cn("font-mono", commission < 0 ? "text-[var(--loss)]" : "text-muted-foreground")}>
                    {formatPnL(commission)}
                  </span>
                </div>
              )}
              {swap !== 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Swap</span>
                  <span className={cn("font-mono", swap < 0 ? "text-[var(--loss)]" : "text-muted-foreground")}>
                    {formatPnL(swap)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net P&amp;L</span>
                <span className={cn("font-mono font-bold text-xl", getPnLColor(netPnl))}>
                  {formatPnL(netPnl)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <MetaRow
                label="Realized R:R"
                value={trade.realizedRR != null ? `${trade.realizedRR.toFixed(2)}:1` : null}
                mono
              />
              <MetaRow
                label="Planned R:R"
                value={trade.plannedRR  != null ? `${trade.plannedRR.toFixed(2)}:1`  : null}
                mono
              />
            </div>
          </div>

          {/* Section 2b — Risk */}
          <Separator />
          <div className="px-5 py-4 space-y-3">
            <SectionTitle>Risk</SectionTitle>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk Amount</p>
                {trade.riskAmount != null ? (
                  <TooltipProvider>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-mono text-foreground">
                        {trade.riskEstimated ? "~" : ""}{formatCurrency(trade.riskAmount)}
                      </p>
                      {trade.riskEstimated && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertTriangle className="h-3 w-3 text-[var(--warning)] cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[200px] text-xs">
                            Estimated from actual loss — no stop loss was set
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TooltipProvider>
                ) : (
                  <TooltipProvider>
                    <div className="flex items-center gap-1">
                      <p className="text-sm text-muted-foreground">N/A</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[200px] text-xs">
                          Risk cannot be calculated without a stop loss on a winning trade
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                )}
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk %</p>
                {trade.riskPercent != null ? (
                  <div className="flex items-center gap-1">
                    <p className={cn(
                      "text-sm font-mono",
                      trade.riskPercent > 5 ? "text-[var(--loss)]" :
                      trade.riskPercent > 2 ? "text-[var(--warning)]" :
                      "text-foreground"
                    )}>
                      {trade.riskEstimated ? "~" : ""}{trade.riskPercent.toFixed(2)}%
                    </p>
                    {trade.riskPercent > 5 && (
                      <AlertTriangle className="h-3 w-3 text-[var(--loss)]" />
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2c — Pips (forex only — hidden when null) */}
          {trade.pipsGained != null && (
            <>
              <Separator />
              <div className="px-5 py-4 space-y-3">
                <SectionTitle>Pips</SectionTitle>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <MetaRow
                    label="Pips Gained"
                    value={formatPips(trade.pipsGained)}
                    mono
                    className={trade.pipsGained > 0 ? "text-[var(--profit)]" : trade.pipsGained < 0 ? "text-[var(--loss)]" : undefined}
                  />
                  <MetaRow
                    label="Pips Risked"
                    value={trade.pipsRisked != null ? `${Number(trade.pipsRisked).toFixed(1)} pips` : null}
                    mono
                  />
                </div>
              </div>
            </>
          )}

          {/* Section 2d — Exit Analysis */}
          {trade.exitReason && (
            <>
              <Separator />
              <div className="px-5 py-4 space-y-2">
                <SectionTitle>Exit</SectionTitle>
                <p className={cn(
                  "text-sm font-medium",
                  EXIT_REASON_MAP[trade.exitReason]?.cls ?? "text-foreground"
                )}>
                  {EXIT_REASON_MAP[trade.exitReason]?.label ?? trade.exitReason}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* Section 3 — Timing */}
          <div className="px-5 py-4 space-y-3">
            <SectionTitle>Timing</SectionTitle>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <MetaRow
                label="Opened"
                value={trade.openedAt ? format(new Date(trade.openedAt), "MMM d, HH:mm") : null}
              />
              <MetaRow
                label="Closed"
                value={trade.closedAt ? format(new Date(trade.closedAt), "MMM d, HH:mm") : null}
              />
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Duration</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-mono text-foreground">{duration}</p>
                  {shortDuration && (
                    <span className="flex items-center gap-0.5 text-[10px] text-[var(--warning)]">
                      <AlertTriangle className="h-3 w-3" /> Short
                    </span>
                  )}
                </div>
              </div>
              <MetaRow label="Session"  value={trade.session ?? null} />
              {weekdayDisplay && <MetaRow label="Weekday" value={weekdayDisplay} />}
              <MetaRow
                label="Period"
                value={trade.tradeMonth && trade.tradeYear
                  ? `${trade.tradeMonth}/${trade.tradeYear}`
                  : null}
              />
            </div>
          </div>

          {/* Section 3b — Risk Quality */}
          {trade.riskQualityScore != null && (
            <>
              <Separator />
              <div className="px-5 py-4 space-y-3">
                <SectionTitle>Risk Quality</SectionTitle>
                <div className="flex items-center justify-between">
                  <div className="relative h-1.5 rounded-full bg-muted overflow-hidden flex-1 mr-3">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full transition-all"
                      style={{
                        width: `${trade.riskQualityScore}%`,
                        backgroundColor: trade.riskQualityScore >= 80 ? "hsl(var(--profit))"
                          : trade.riskQualityScore >= 60 ? "hsl(var(--primary))"
                          : trade.riskQualityScore >= 40 ? "hsl(var(--warning))"
                          : "hsl(var(--loss))",
                      }}
                    />
                  </div>
                  <span className={cn("text-sm font-mono font-bold shrink-0", getRiskQualityClass(trade.riskQualityScore))}>
                    {trade.riskQualityScore}/100
                  </span>
                </div>
                {(trade.riskQualityFlags ?? []).length > 0 ? (
                  <div className="space-y-1.5">
                    {trade.riskQualityFlags.map((flag) => (
                      <div key={flag} className="flex items-center gap-1.5 text-xs text-[var(--warning)]">
                        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                        <span>{FLAG_LABELS[flag] ?? flag}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--profit)]">✓ No risk concerns</p>
                )}
              </div>
            </>
          )}

          {/* Section 3c — Trade Compliance (isCompliant + violations) */}
          {trade.isCompliant != null && (
            <>
              <Separator />
              <div className="px-5 py-4 space-y-3">
                <SectionTitle>Compliance</SectionTitle>
                {trade.isCompliant ? (
                  <div className="flex items-center gap-1.5 text-xs text-[var(--profit)]">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Trade compliant</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(trade.complianceViolations ?? []).map((v, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-start gap-1.5 px-2.5 py-2 rounded-lg border text-xs",
                          SEVERITY_STYLES[v.severity] ?? SEVERITY_STYLES.warning
                        )}
                      >
                        <span className="shrink-0 mt-0.5">{v.severity === "critical" ? "✗" : "⚠"}</span>
                        <div className="min-w-0">
                          <p className="font-semibold">{v.rule}</p>
                          {v.message && <p className="opacity-80 mt-0.5 leading-snug">{v.message}</p>}
                        </div>
                      </div>
                    ))}
                    {(trade.complianceViolations ?? []).length === 0 && (
                      <p className="text-xs text-muted-foreground">Violations not detailed</p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Section 4 — Compliance (only if checked) */}
          {propCompliance.checked && (
            <>
              <Separator />
              <div className="px-5 py-4 space-y-3">
                <SectionTitle>Prop Compliance</SectionTitle>
                <PropComplianceBadge propCompliance={propCompliance} large />

                {(propCompliance.violations ?? []).length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    {propCompliance.violations.map((v, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-[var(--loss)]">
                        <span className="mt-0.5 flex-shrink-0">✗</span>
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2 mt-2">
                  <CheckRow label="Duration valid"  value={propCompliance.tradeDurationValid} />
                  <CheckRow label="News window"     value={propCompliance.newsWindowValid}    />
                  <CheckRow label="Session valid"   value={propCompliance.sessionValid}       />
                </div>
              </div>
            </>
          )}

          {/* Section 5 — Discipline */}
          {discipline.score != null && (
            <>
              <Separator />
              <div className="px-5 py-4 space-y-3">
                <SectionTitle>Discipline</SectionTitle>
                <DisciplineScoreBadge discipline={discipline} />

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Disciplined trade</span>
                  <span className={discipline.isDisciplined ? "text-[var(--profit)]" : "text-[var(--loss)]"}>
                    {discipline.isDisciplined ? "✓ Yes" : "✗ No"}
                  </span>
                </div>

                {(discipline.feedback ?? []).length > 0 && (
                  <div className="space-y-1.5 mt-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Feedback</p>
                    {discipline.feedback.map((f, i) => (
                      <p key={i} className="text-xs text-muted-foreground leading-snug">{f}</p>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Section 6 — Behavioural */}
          {(behavioural.isRevengeTrade || behavioural.isOvertrade || behavioural.afterConsecutiveLosses > 0) && (
            <>
              <Separator />
              <div className="px-5 py-4 space-y-2.5">
                <SectionTitle>Behavioural</SectionTitle>
                {behavioural.isRevengeTrade && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/20">
                    <AlertTriangle className="h-3.5 w-3.5 text-[var(--warning)] flex-shrink-0" />
                    <span className="text-xs font-medium text-[var(--warning)]">Revenge Trade ⚠</span>
                  </div>
                )}
                {behavioural.isOvertrade && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/20">
                    <AlertTriangle className="h-3.5 w-3.5 text-[var(--warning)] flex-shrink-0" />
                    <span className="text-xs font-medium text-[var(--warning)]">Overtrading ⚠</span>
                  </div>
                )}
                {behavioural.afterConsecutiveLosses > 0 && (
                  <p className="text-xs text-muted-foreground">
                    After {behavioural.afterConsecutiveLosses} consecutive loss{behavioural.afterConsecutiveLosses === 1 ? "" : "es"}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Section 7 — Stop Loss Management */}
          {(slMgmt.wasMovedToBreakeven || slMgmt.wasTrailed) && (
            <>
              <Separator />
              <div className="px-5 py-4 space-y-2.5">
                <SectionTitle>SL Management</SectionTitle>
                {slMgmt.wasMovedToBreakeven && (
                  <p className="text-xs text-[var(--profit)]">✓ Moved to breakeven</p>
                )}
                {slMgmt.wasTrailed && (
                  <p className="text-xs text-[var(--profit)]">✓ Trailed stop loss</p>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Section 8 — Journal */}
          <div className="px-5 py-4 space-y-5">
            <SectionTitle>Journal</SectionTitle>

            {/* Quality rating */}
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Setup Quality</p>
              <GradeStars
                value={trade.setupQualityRating ?? 0}
                onChange={handleGradeChange}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Setup Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {(trade.tags ?? []).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    {tag}
                    <X className="h-2.5 w-2.5" />
                  </button>
                ))}
                {SETUP_TAGS.filter((s) => !(trade.tags ?? []).includes(s)).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleTagToggle(opt)}
                    className="px-2 py-0.5 rounded-md text-xs border border-border text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Notes</p>
                {savedNote && (
                  <span className="text-[10px] text-[var(--profit)]">Saved ✓</span>
                )}
              </div>
              <Textarea
                key={trade._id}
                defaultValue={trade.note ?? ""}
                onChange={handleNoteChange}
                rows={4}
                placeholder={"What did you observe?\nWhat went well?\nWhat would you do differently?"}
                className="bg-background border-border resize-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* ── Sticky actions ─────────────────────────── */}
        <div className="px-5 py-4 border-t border-border flex-shrink-0 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-border"
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
            Close
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5 ml-auto"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this trade?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The trade and all its journal data will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
