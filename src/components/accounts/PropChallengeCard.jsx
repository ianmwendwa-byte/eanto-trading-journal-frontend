import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge }       from "@/components/ui/badge";
import { Progress }    from "@/components/ui/progress";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { AccountStatusBadge } from "./AccountStatusBadge";
import { formatCurrency, formatDate, formatPnL, getPnLColor } from "@/utils/format";
import { cn } from "@/lib/utils";

// ── Labelled detail row ───────────────────────────────────────
const DetailRow = ({ label, children }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-xs text-muted-foreground">{label}</span>
    <div className="text-right">{children}</div>
  </div>
);

// ── Progress bar with header ──────────────────────────────────
const ChallengeBar = ({
  label, current = 0, target = 0, colorMode = "drawdown",
  displayLine, tooltip,
}) => {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;

  const barColor = colorMode === "profit"
    ? "bg-[var(--profit)]"
    : pct >= 70 ? "bg-[var(--loss)]"
    : pct >= 50 ? "bg-[var(--warning)]"
    : "bg-[var(--profit)]";

  const textColor = colorMode === "profit"
    ? "text-foreground"
    : pct >= 70 ? "text-[var(--loss)]"
    : pct >= 50 ? "text-[var(--warning)]"
    : "text-muted-foreground";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground font-medium">{label}</span>
          {tooltip && <InfoTooltip content={tooltip} side="top" />}
        </div>
        <span className={cn("font-mono text-xs", textColor)}>
          {current.toFixed(2)}% / {target}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {displayLine && (
        <p className="text-[11px] text-muted-foreground font-mono">{displayLine}</p>
      )}
    </div>
  );
};

// ── Trading requirement row ───────────────────────────────────
const RequirementRow = ({ label, done, required }) => {
  if (!required) return null;
  const pct = required > 0 ? Math.min(100, (done / required) * 100) : 100;
  const met = done >= required;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-mono", met ? "text-[var(--profit)]" : "text-foreground")}>
          {done} / {required}
          {met && " ✓"}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", met ? "bg-[var(--profit)]" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ── PropChallengeCard ─────────────────────────────────────────
export const PropChallengeCard = ({ account }) => {
  const propRules   = account.propRules   ?? {};
  const propMetrics = account.propMetrics ?? {};
  const challenge   = account.challenge   ?? {};
  const payout      = account.payout      ?? {};

  const propFirmName   = propRules.propFirmName ?? account.propFirm ?? "Prop Firm";
  const programType    = propRules.programType ?? "—";
  const programDisplay = {
    "1_step":  "1-Step",
    "2_step":  "2-Step",
    "3_step":  "3-Step",
    "instant": "Instant Funded",
  }[programType] ?? programType;

  const violations    = propRules.violations?.violationLog ?? [];
  const challengeFee  = propRules.challengeFee ?? 0;
  const feesPaid      = propMetrics.challengeFeesPaid ?? 0;
  const totalFees     = propMetrics.totalFeesSpent    ?? 0;
  const netROI        = propMetrics.netROI            ?? null;
  const profitSplit   = propRules.payoutRules?.profitSplitPercent ?? null;
  const totalPayouts  = propMetrics.totalPayoutsReceived ?? 0;

  const currentProfit  = propMetrics.currentProfitPercent        ?? 0;
  const profitTarget   = propRules.profitTarget                  ?? 0;
  const currentDD      = propMetrics.currentDrawdownPercent      ?? 0;
  const maxDD          = propRules.maxDrawdownPercent            ?? 0;
  const currentDailyDD = propMetrics.currentDailyDrawdownPercent ?? 0;
  const dailyDD        = propRules.dailyDrawdownPercent          ?? 0;

  const tradingDays    = propMetrics.tradingDaysCompleted    ?? 0;
  const minTradingDays = propRules.minTradingDays            ?? 0;
  const profitDays     = propMetrics.profitableDaysCompleted ?? 0;
  const minProfitDays  = propRules.minProfitableDays         ?? 0;

  // Dollar value of profit target for display context
  const profitTargetUSD = account.accountSize && profitTarget
    ? formatCurrency(account.accountSize * profitTarget / 100)
    : null;

  return (
    <div className="trading-card p-4 space-y-5">
      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {propFirmName}
            {programDisplay !== "—" && (
              <span className="text-muted-foreground font-normal"> · {programDisplay}</span>
            )}
          </p>
          {challenge.type && challenge.phase && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {challenge.type.replace("_", "-")} · Phase {challenge.phase}
            </p>
          )}
        </div>
        <AccountStatusBadge status={account.status} />
      </div>

      {/* ── Details grid ───────────────────────── */}
      <div className="grid grid-cols-2 gap-x-6 border-t border-border pt-4">
        {/* Left column */}
        <div className="divide-y divide-border/50">
          {challenge.startedAt && (
            <DetailRow label="Started">
              <p className="text-xs font-mono text-foreground">{formatDate(challenge.startedAt)}</p>
            </DetailRow>
          )}
          {challengeFee > 0 && (
            <DetailRow label="Fee Paid">
              <p className="text-xs font-mono text-foreground">
                {formatCurrency(challengeFee)} × {feesPaid}
              </p>
            </DetailRow>
          )}
          {profitSplit !== null && (
            <DetailRow label="Profit Split">
              <p className="text-xs font-mono text-[var(--profit)]">{profitSplit}%</p>
            </DetailRow>
          )}
          <DetailRow label="Payout">
            {payout.eligible ? (
              <Badge
                variant="outline"
                className="text-[10px] bg-[var(--profit)]/10 text-[var(--profit)] border-[var(--profit)]/20"
              >
                Eligible ✓
              </Badge>
            ) : (
              <p className="text-xs text-muted-foreground">Not eligible</p>
            )}
          </DetailRow>
        </div>

        {/* Right column */}
        <div className="divide-y divide-border/50">
          {netROI !== null && (
            <DetailRow label="Net ROI">
              <div className="flex items-center gap-1">
                <p className={cn("text-xs font-mono font-medium", getPnLColor(netROI))}>
                  {formatPnL(netROI)}
                </p>
                <InfoTooltip
                  content="Return on investment after all fees. Negative until first payout."
                  side="top"
                />
              </div>
            </DetailRow>
          )}
          {totalFees > 0 && (
            <DetailRow label="Total Fees">
              <p className="text-xs font-mono text-[var(--loss)]">
                {formatCurrency(totalFees)}
              </p>
            </DetailRow>
          )}
          {totalPayouts > 0 && (
            <DetailRow label="Total Earned">
              <p className="text-xs font-mono text-[var(--profit)]">
                {formatCurrency(totalPayouts)}
              </p>
            </DetailRow>
          )}
        </div>
      </div>

      {/* ── Progress bars ──────────────────────── */}
      <div className="space-y-4 border-t border-border pt-4">
        <ChallengeBar
          label="Profit Target"
          current={currentProfit}
          target={profitTarget}
          colorMode="profit"
          displayLine={profitTargetUSD
            ? `Target: ${profitTargetUSD} profit required`
            : undefined}
          tooltip={`Current profit percentage vs target. Need ${profitTarget}% to pass this challenge phase.`}
        />
        <ChallengeBar
          label="Max Drawdown"
          current={currentDD}
          target={maxDD}
          colorMode="drawdown"
          displayLine={`${currentDD.toFixed(2)}% used of ${maxDD}% limit`}
          tooltip={`Current drawdown vs maximum allowed. Account blown at ${maxDD}%.`}
        />
        {dailyDD > 0 && (
          <ChallengeBar
            label="Daily Drawdown"
            current={currentDailyDD}
            target={dailyDD}
            colorMode="drawdown"
            tooltip="Today's drawdown vs daily limit."
          />
        )}
      </div>

      {/* ── Trading requirements ────────────────── */}
      {(minTradingDays > 0 || minProfitDays > 0) && (
        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Trading Requirements
          </p>
          <RequirementRow
            label="Trading Days"
            done={tradingDays}
            required={minTradingDays}
          />
          {minProfitDays > 0 && (
            <RequirementRow
              label="Profitable Days"
              done={profitDays}
              required={minProfitDays}
            />
          )}
        </div>
      )}

      {/* ── Violations ─────────────────────────── */}
      {violations.length > 0 ? (
        <div className="border border-[var(--loss)]/30 rounded-xl p-3 space-y-2 bg-[var(--loss)]/5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[var(--loss)]" />
            <p className="text-sm font-medium text-[var(--loss)]">
              {violations.length} Violation{violations.length !== 1 ? "s" : ""} Detected
            </p>
          </div>
          <div className="space-y-1.5">
            {violations.map((v, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                {v.occurredAt && (
                  <span className="text-muted-foreground font-mono flex-shrink-0">
                    {formatDate(v.occurredAt)}
                  </span>
                )}
                {v.notes && (
                  <span className="text-muted-foreground">{v.notes}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 pt-1">
          <CheckCircle2 className="h-4 w-4 text-[var(--profit)]" />
          <p className="text-xs text-[var(--profit)]">No violations</p>
        </div>
      )}
    </div>
  );
};
