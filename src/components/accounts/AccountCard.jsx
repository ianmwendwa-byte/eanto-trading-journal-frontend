import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MoreHorizontal, Eye, Key, Pencil, Trash2, AlertTriangle,
} from "lucide-react";
import { Skeleton }  from "@/components/ui/skeleton";
import { Button }    from "@/components/ui/button";
import { Badge }     from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountTypeBadge }   from "./AccountTypeBadge";
import { AccountStatusBadge } from "./AccountStatusBadge";
import { EASyncStatus }       from "./EASyncStatus";
import { InfoTooltip }        from "@/components/shared/InfoTooltip";
import { formatCurrency, formatPnL, getPnLColor } from "@/utils/format";
import { cn }                 from "@/lib/utils";
import { staggerItemVariants } from "@/lib/animations";
import { useEAStatus }        from "@/hooks/useEA";

// ── Accent bar color by type ──────────────────────────────────
const TYPE_BAR = {
  normal: "bg-[var(--profit)]",
  prop:   "bg-primary",
  war:    "bg-[var(--loss)]",
};

// ── Small stat cell ───────────────────────────────────────────
const StatCell = ({ label, value, valueClass, tooltip }) => (
  <div className="space-y-0.5">
    <div className="flex items-center gap-0.5">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      {tooltip && <InfoTooltip content={tooltip} side="top" />}
    </div>
    <p className={cn("text-sm font-mono font-medium", valueClass ?? "text-foreground")}>
      {value ?? "—"}
    </p>
  </div>
);

// ── Progress bar (prop challenges) ────────────────────────────
const PropBar = ({ label, current = 0, target = 0, tooltip, colorMode = "drawdown" }) => {
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
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">{label}</span>
          {tooltip && <InfoTooltip content={tooltip} side="top" />}
        </div>
        <span className={cn("font-mono", textColor)}>
          {current.toFixed(2)}% / {target}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ── Win rate color ────────────────────────────────────────────
const winRateColor = (wr) => {
  if (wr === null) return "text-muted-foreground";
  if (wr >= 60) return "text-[var(--profit)]";
  if (wr >= 50) return "text-[var(--warning)]";
  return "text-[var(--loss)]";
};

// ── Avg RR color ──────────────────────────────────────────────
const avgRRColor = (rr) => {
  if (rr === null) return "text-muted-foreground";
  if (rr >= 2.0) return "text-[var(--profit)]";
  if (rr >= 1.0) return "text-[var(--warning)]";
  return "text-[var(--loss)]";
};

// ── EA status from /ea/status — enabled + isOnline ────────────
// Response: { success, data: { enabled, isOnline, hasApiKey, ... } }
// Only fetches when account.eaSync?.enabled is true to avoid N calls for non-EA accounts.
// Falls back to account.eaSync for the brief window before the first fetch completes.
const EAStatusChip = ({ account }) => {
  const configEnabled = account.eaSync?.enabled ?? false;

  const { data: status } = useEAStatus(account._id, {
    polling: false,
    enabled: configEnabled,
  });

  const enabled  = status?.enabled  ?? configEnabled;
  const isOnline = status?.isOnline ?? false;

  return <EASyncStatus isOnline={isOnline} enabled={enabled} />;
};

// ── Dropdown actions ──────────────────────────────────────────
const Actions = ({ account, onEdit, onDelete, navigate }) => (
  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs"
      onClick={(e) => { e.stopPropagation(); navigate(`/accounts/${account._id}`); }}
    >
      <Eye className="h-3.5 w-3.5 mr-1" />
      View
    </Button>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border">
        <DropdownMenuItem
          onClick={(e) => { e.stopPropagation(); onEdit?.(account); }}
          className="gap-2 cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5" />Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => { e.stopPropagation(); navigate(`/accounts/${account._id}?tab=ea`); }}
          className="gap-2 cursor-pointer"
        >
          <Key className="h-3.5 w-3.5" />EA Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={(e) => { e.stopPropagation(); onDelete?.(account); }}
          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

// ── Main card ─────────────────────────────────────────────────
export const AccountCard = ({ account, viewMode = "grid", onEdit, onDelete }) => {
  const navigate = useNavigate();

  // ── Correct field mapping per API spec ────────────────────
  const isProp = account.type === "prop";

  // Balance: prop shows firm capital (accountSize); normal/war shows live balance
  const accountSize = isProp ? (account.accountSize ?? 0): (account.startingBalance ?? 0);

  
  // P&L: always from performance, never calculated
  const pnl = account.performance?.totalPnl ?? 0;

  // Performance stats — all from account.performance (0-100 for winRate)
  const winRate     = account.performance?.winRate     ?? null;
  const avgRR       = account.performance?.avgRR       ?? null;
  const totalTrades = account.performance?.totalTrades ?? null;

  // Prop metrics (null on normal/war)
  const propMetrics = account.propMetrics ?? null;
  const propRules   = account.propRules   ?? null;

  // Current drawdown from propMetrics (not account root)
  const currentDrawdown      = propMetrics?.currentDrawdownPercent      ?? 0;
  const currentDailyDrawdown = propMetrics?.currentDailyDrawdownPercent ?? 0;
  const currentProfit        = propMetrics?.currentProfitPercent        ?? 0;
  const maxDrawdown          = propRules?.maxDrawdownPercent   ?? 0;
  const dailyDrawdown        = propRules?.dailyDrawdownPercent ?? 0;
  const profitTarget         = propRules?.profitTarget         ?? 0;

  // Trading days
  const tradingDaysDone = propMetrics?.tradingDaysCompleted ?? 0;
  const tradingDaysMin  = propRules?.minTradingDays         ?? 0;

  // Violations
  const violations     = propRules?.violations?.violationLog ?? [];
  const lastViolation  = violations[violations.length - 1];

  // Payout
  const payoutEligible       = account.payout?.eligible ?? false;
  const totalPayoutsReceived = propMetrics?.totalPayoutsReceived ?? 0;

  // EA status is fetched live from /ea/status by EAStatusChip below.

 

  // Prop firm name
  const propFirmDisplay = propRules?.propFirmName ?? account.propFirm ?? "Prop Firm";

  // Challenge
  const challengeType   = propRules?.programType ?? null;
  const challengePhase  = account.challenge?.phase  ?? null;

  // Behavioural flags
  const hasFlags = account.behaviouralFlags &&
    Object.values(account.behaviouralFlags).some(Boolean);

  // ── List view ──────────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <motion.div
        variants={staggerItemVariants}
        whileHover={{ x: 2, transition: { duration: 0.15 } }}
        className="trading-card relative overflow-hidden flex items-center gap-4 cursor-pointer group"
        onClick={() => navigate(`/accounts/${account._id}`)}
      >
        <div className={cn("absolute left-0 top-0 h-full w-[3px]", TYPE_BAR[account.type])} />
        <div className="pl-3 pr-4 py-3 flex items-center gap-4 w-full">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {account.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {isProp ? propFirmDisplay : (account.broker ?? account.platform ?? "—")}
            </p>
          </div>

          <AccountTypeBadge type={account.type} />
          <AccountStatusBadge status={account.status} />

          <div className="text-right hidden sm:block w-32">
            <p className="text-sm font-bold font-mono text-foreground">
              {formatCurrency(accountSize)}
            </p>
            {!isProp && (
              <p className={cn("text-xs font-mono", getPnLColor(pnl))}>
                {pnl >= 0 ? "+" : ""}{formatCurrency(Math.abs(pnl))}
              </p>
            )}
          </div>

          <div className="hidden md:flex items-center gap-6">
            <StatCell
              label="Win Rate"
              value={winRate !== null ? `${winRate.toFixed(1)}%` : "—"}
              valueClass={winRateColor(winRate)}
            />
            <StatCell
              label="Avg R:R"
              value={avgRR !== null ? `${avgRR.toFixed(2)}:1` : "—"}
              valueClass={avgRRColor(avgRR)}
            />
            <StatCell
              label={isProp ? "Days" : "Trades"}
              value={isProp
                ? `${tradingDaysDone}/${tradingDaysMin}`
                : (totalTrades ?? "—")}
            />
          </div>

          <div className="flex items-center gap-2 ml-auto" onClick={(e) => e.stopPropagation()}>
            <EAStatusChip account={account} />
            <Actions account={account} onEdit={onEdit} onDelete={onDelete} navigate={navigate} />
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Grid view ──────────────────────────────────────────────
  return (
    <motion.div
      variants={staggerItemVariants}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.99 }}
      className="trading-card relative overflow-hidden flex flex-col cursor-pointer group"
      onClick={() => navigate(`/accounts/${account._id}`)}
    >
      <div className={cn("absolute left-0 top-0 h-full w-[3px]", TYPE_BAR[account.type])} />

      <div className="p-4 pl-5 flex flex-col gap-3">
        {/* ── Header ─────────────────────────────── */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {account.name}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {isProp
                ? `${propFirmDisplay} · ${account.platform ?? "—"}`
                : account.broker
                ? `${account.broker} · ${account.platform ?? "—"}`
                : (account.platform ?? "—")}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <AccountTypeBadge type={account.type} />
            <AccountStatusBadge status={account.status} />
          </div>
        </div>

        {/* ── Balance / Account Size ─────────────── */}
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {isProp ? "Account Size" : "Starting Balance"}
            </p>
            <InfoTooltip
              content={isProp
                ? "The prop firm's funded capital. This is not your personal money."
                : "Current account balance"}
              side="top"
            />
          </div>
          <p className="text-xl font-bold font-mono text-foreground leading-none">
            {formatCurrency(accountSize)}
          </p>
          {isProp ? (
            <p className={cn(
              "text-xs font-mono mt-0.5",
              currentProfit >= 0
                ? "text-[var(--profit)]"
                : "text-[var(--loss)]"
            )}>
              {currentProfit >= 0 ? "+" : ""}{currentProfit.toFixed(2)}% profit
            </p>
          ) : (
            <p className={cn("text-xs font-mono mt-0.5", getPnLColor(pnl))}>
              {pnl >= 0 ? "+" : ""}{formatCurrency(Math.abs(pnl))}
            </p>
          )}
        </div>

        {/* ── Stats row ──────────────────────────── */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
          <StatCell
            label="Win Rate"
            value={winRate !== null ? `${winRate.toFixed(1)}%` : "—"}
            valueClass={winRateColor(winRate)}
            tooltip="Win rate from all closed trades"
          />
          <StatCell
            label="Avg R:R"
            value={avgRR !== null ? `${avgRR.toFixed(2)}:1` : "—"}
            valueClass={avgRRColor(avgRR)}
            tooltip="Average reward to risk ratio"
          />
          <StatCell
            label={isProp ? "Trade Days" : "Trades"}
            value={isProp
              ? `${tradingDaysDone}/${tradingDaysMin}`
              : (totalTrades ?? "—")}
            tooltip={isProp
              ? "Trading days completed vs minimum required"
              : "Total closed trades"}
          />
        </div>

        {/* ── Prop challenge section ─────────────── */}
        {isProp && propRules && propMetrics && (
          <div className="space-y-2 pt-1 border-t border-border">
            {/* Challenge label */}
            {challengeType && challengePhase && (
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {challengeType.replace("_", "-")} · Phase {challengePhase}
              </p>
            )}

            {/* Profit Target */}
            <PropBar
              label="Profit Target"
              current={currentProfit}
              target={profitTarget}
              colorMode="profit"
              tooltip={`Current profit vs target needed to pass. Need ${profitTarget}% to pass this phase.`}
            />

            {/* Max Drawdown */}
            <PropBar
              label="Max Drawdown"
              current={currentDrawdown}
              target={maxDrawdown}
              colorMode="drawdown"
              tooltip={`Current drawdown vs maximum allowed. Account blown at ${maxDrawdown}%.`}
            />

            {/* Daily Drawdown */}
            {dailyDrawdown > 0 && (
              <PropBar
                label="Daily Drawdown"
                current={currentDailyDrawdown}
                target={dailyDrawdown}
                colorMode="drawdown"
                tooltip="Today's drawdown vs daily limit."
              />
            )}

            {/* Payout */}
            <div className="flex items-center justify-between pt-1">
              {payoutEligible ? (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-[var(--profit)]/10 text-[var(--profit)] border-[var(--profit)]/20"
                >
                  Payout Eligible ✓
                </Badge>
              ) : (
                <p className="text-[10px] text-muted-foreground">Not eligible yet</p>
              )}
              {totalPayoutsReceived > 0 && (
                <p className="text-[10px] text-muted-foreground font-mono">
                  Earned: {formatCurrency(totalPayoutsReceived)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Footer: EA + actions ───────────────── */}
        <div
          className="flex items-center justify-between pt-1 border-t border-border"
          onClick={(e) => e.stopPropagation()}
        >
          <EAStatusChip account={account} />
          <Actions account={account} onEdit={onEdit} onDelete={onDelete} navigate={navigate} />
        </div>

        {/* ── Behavioural warning ────────────────── */}
        {hasFlags && (
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-[var(--warning)]/10 border border-[var(--warning)]/20 -mx-1">
            <span className="text-xs">⚠</span>
            <p className="text-[11px] text-[var(--warning)] font-medium">
              Behavioural alert detected
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const AccountCardSkeleton = ({ viewMode = "grid" }) => {
  if (viewMode === "list") {
    return (
      <div className="trading-card p-3 flex items-center gap-4">
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
        <div className="hidden sm:block w-32 space-y-1 text-right">
          <Skeleton className="h-4 w-24 ml-auto" />
          <Skeleton className="h-3 w-16 ml-auto" />
        </div>
        <div className="hidden md:flex gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-2.5 w-12" />
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          <Skeleton className="h-7 w-14" />
          <Skeleton className="h-7 w-7" />
        </div>
      </div>
    );
  }

  return (
    <div className="trading-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-2.5 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <Skeleton className="h-3 w-16" />
        <div className="flex gap-1">
          <Skeleton className="h-7 w-14" />
          <Skeleton className="h-7 w-7" />
        </div>
      </div>
    </div>
  );
};
