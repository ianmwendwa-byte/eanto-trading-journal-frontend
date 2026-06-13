import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MoreHorizontal, Eye, Key, Pencil, Trash2,
  Wallet, Trophy, Zap,
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
import { formatCurrency, getPnLColor } from "@/utils/format";
import { cn }                 from "@/lib/utils";
import { staggerItemVariants } from "@/lib/animations";
import { useEAStatus }        from "@/hooks/useEA";

// ── Per-type config — colors unchanged ───────────────────
const TYPE_CONFIG = {
  normal: {
    strip:    "bg-[var(--profit)]",
    iconBg:   "bg-[var(--profit)]/10",
    iconText: "text-[var(--profit)]",
    hex:      "#22C55E",
    Icon:     Wallet,
  },
  prop: {
    strip:    "bg-primary",
    iconBg:   "bg-primary/10",
    iconText: "text-primary",
    hex:      "#4F6EF7",
    Icon:     Trophy,
  },
  war: {
    strip:    "bg-[var(--loss)]",
    iconBg:   "bg-[var(--loss)]/10",
    iconText: "text-[var(--loss)]",
    hex:      "#EF4444",
    Icon:     Zap,
  },
};

// ── Win rate / avg RR color helpers ──────────────────────
const winRateColor = (wr) => {
  if (wr === null) return "text-muted-foreground";
  if (wr >= 60) return "text-[var(--profit)]";
  if (wr >= 50) return "text-[var(--warning)]";
  return "text-[var(--loss)]";
};

const avgRRColor = (rr) => {
  if (rr === null) return "text-muted-foreground";
  if (rr >= 2.0) return "text-[var(--profit)]";
  if (rr >= 1.0) return "text-[var(--warning)]";
  return "text-[var(--loss)]";
};

// ── Stat cell (list view) ─────────────────────────────────
const StatCell = ({ label, value, valueClass }) => (
  <div className="flex flex-col items-center gap-0.5">
    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className={cn("text-xs font-mono font-semibold", valueClass ?? "text-foreground")}>{value ?? "—"}</p>
  </div>
);

// ── Prop progress bar ─────────────────────────────────────
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground">{label}</span>
          {tooltip && <InfoTooltip content={tooltip} side="top" />}
        </div>
        <span className={cn("text-[10px] font-mono tabular-nums", textColor)}>
          {current.toFixed(2)}% / {target}%
        </span>
      </div>
      <div className="h-[3px] rounded-full bg-muted/50 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ── EA status chip ────────────────────────────────────────
const EAStatusChip = ({ account }) => {
  const configEnabled = account.eaSync?.enabled ?? false;
  const { data: status } = useEAStatus(account._id, { polling: false, enabled: configEnabled });
  const enabled  = status?.enabled  ?? configEnabled;
  const isOnline = status?.isOnline ?? false;
  return <EASyncStatus isOnline={isOnline} enabled={enabled} />;
};

// ── Dropdown actions ──────────────────────────────────────
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

// ── Main card ─────────────────────────────────────────────
export const AccountCard = ({ account, viewMode = "grid", onEdit, onDelete }) => {
  const navigate = useNavigate();

  const isProp   = account.type === "prop";
  const cfg      = TYPE_CONFIG[account.type] ?? TYPE_CONFIG.normal;
  const TypeIcon = cfg.Icon;

  const accountSize = isProp ? (account.accountSize ?? 0) : (account.startingBalance ?? 0);
  const pnl         = account.performance?.totalPnl ?? 0;

  const winRate     = account.performance?.winRate     ?? null;
  const avgRR       = account.performance?.avgRR       ?? null;
  const totalTrades = account.performance?.totalTrades ?? null;

  const propMetrics = account.propMetrics ?? null;
  const propRules   = account.propRules   ?? null;

  const currentDrawdown      = propMetrics?.currentDrawdownPercent      ?? 0;
  const currentDailyDrawdown = propMetrics?.currentDailyDrawdownPercent ?? 0;
  const currentProfit        = propMetrics?.currentProfitPercent        ?? 0;
  const maxDrawdown          = propRules?.maxDrawdownPercent   ?? 0;
  const dailyDrawdown        = propRules?.dailyDrawdownPercent ?? 0;
  const profitTarget         = propRules?.profitTarget         ?? 0;

  const tradingDaysDone = propMetrics?.tradingDaysCompleted ?? 0;
  const tradingDaysMin  = propRules?.minTradingDays         ?? 0;

  const payoutEligible       = account.payout?.eligible ?? false;
  const totalPayoutsReceived = propMetrics?.totalPayoutsReceived ?? 0;

  const propFirmDisplay = propRules?.propFirmName ?? account.propFirm ?? "Prop Firm";
  const challengeType   = propRules?.programType  ?? null;
  const challengePhase  = account.challenge?.phase ?? null;

  const hasFlags = account.behaviouralFlags &&
    Object.values(account.behaviouralFlags).some(Boolean);

  // ── List view ──────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <motion.div
        variants={staggerItemVariants}
        whileHover={{ x: 2, transition: { duration: 0.15 } }}
        className="trading-card relative overflow-hidden flex items-center gap-4 cursor-pointer group"
        onClick={() => navigate(`/accounts/${account._id}`)}
      >
        <div className={cn("absolute left-0 top-0 h-full w-[3px]", cfg.strip)} />
        <div className="pl-4 pr-4 py-3 flex items-center gap-4 w-full">
          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0", cfg.iconBg)}>
            <TypeIcon className={cn("h-4 w-4", cfg.iconText)} />
          </div>
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
            <p className="text-sm font-bold font-mono text-foreground">{formatCurrency(accountSize)}</p>
            {!isProp && (
              <p className={cn("text-xs font-mono", getPnLColor(pnl))}>
                {pnl >= 0 ? "+" : ""}{formatCurrency(Math.abs(pnl))}
              </p>
            )}
          </div>
          <div className="hidden md:flex items-center gap-6">
            <StatCell label="Win Rate" value={winRate !== null ? `${winRate.toFixed(1)}%` : "—"} valueClass={winRateColor(winRate)} />
            <StatCell label="Avg R:R"  value={avgRR   !== null ? `${avgRR.toFixed(2)}:1`  : "—"} valueClass={avgRRColor(avgRR)} />
            <StatCell label={isProp ? "Days" : "Trades"} value={isProp ? `${tradingDaysDone}/${tradingDaysMin}` : (totalTrades ?? "—")} />
          </div>
          <div className="flex items-center gap-2 ml-auto" onClick={(e) => e.stopPropagation()}>
            <EAStatusChip account={account} />
            <Actions account={account} onEdit={onEdit} onDelete={onDelete} navigate={navigate} />
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Grid view ──────────────────────────────────────────
  return (
    <motion.div
      variants={staggerItemVariants}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.99 }}
      className="trading-card flex flex-col cursor-pointer group"
      style={{
        backgroundImage: `radial-gradient(ellipse at 110% -10%, ${cfg.hex}35 0%, transparent 55%), radial-gradient(circle, ${cfg.hex}18 1.5px, transparent 1.5px)`,
        backgroundSize: "auto, 22px 22px",
      }}
      onClick={() => navigate(`/accounts/${account._id}`)}
    >
      {/* Top accent strip */}
      <div className={cn("h-[4px] w-full shrink-0", cfg.strip)} />

      <div className="relative flex flex-col flex-1 p-5 gap-4">

        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0", cfg.iconBg)}>
              <TypeIcon className={cn("h-3.5 w-3.5", cfg.iconText)} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate group-hover:text-primary transition-colors leading-snug">
                {account.name}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {isProp
                  ? `${propFirmDisplay} · ${account.platform ?? "—"}`
                  : account.broker
                  ? `${account.broker} · ${account.platform ?? "—"}`
                  : (account.platform ?? "—")}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <AccountTypeBadge type={account.type} />
            <AccountStatusBadge status={account.status} />
          </div>
        </div>

        {/* ── Balance — raw typography, no box ────────── */}
        <div>
          <div className="flex items-center gap-1 mb-1.5">
            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">
              {isProp ? "Account Size" : "Balance"}
            </p>
            <InfoTooltip
              content={isProp
                ? "The prop firm's funded capital. This is not your personal money."
                : "Current account balance"}
              side="top"
            />
          </div>
          <div className="flex items-baseline gap-2.5">
            <p className="text-[26px] font-bold font-mono text-foreground leading-none tracking-tight">
              {formatCurrency(accountSize)}
            </p>
            {isProp ? (
              <span className={cn(
                "text-[11px] font-mono font-medium",
                currentProfit >= 0 ? "text-[var(--profit)]" : "text-[var(--loss)]"
              )}>
                {currentProfit >= 0 ? "+" : ""}{currentProfit.toFixed(2)}%
              </span>
            ) : (
              <span className={cn("text-[11px] font-mono font-medium", getPnLColor(pnl))}>
                {pnl >= 0 ? "+" : ""}{formatCurrency(Math.abs(pnl))}
              </span>
            )}
          </div>
        </div>

        {/* ── Stats — floating inline with dividers, no box ── */}
        <div className="flex items-stretch divide-x divide-border/50">
          <div className="flex-1 flex flex-col items-center gap-0.5 pr-3">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Win Rate</p>
            <p className={cn("text-[13px] font-mono font-semibold tabular-nums", winRateColor(winRate))}>
              {winRate !== null ? `${winRate.toFixed(1)}%` : "—"}
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-0.5 px-3">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Avg R:R</p>
            <p className={cn("text-[13px] font-mono font-semibold tabular-nums", avgRRColor(avgRR))}>
              {avgRR !== null ? `${avgRR.toFixed(2)}:1` : "—"}
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center gap-0.5 pl-3">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
              {isProp ? "Trade Days" : "Trades"}
            </p>
            <p className="text-[13px] font-mono font-semibold text-foreground tabular-nums">
              {isProp ? `${tradingDaysDone}/${tradingDaysMin}` : (totalTrades ?? "—")}
            </p>
          </div>
        </div>

        {/* ── Prop challenge section ───────────────────── */}
        {isProp && propRules && propMetrics && (
          <div className="space-y-2.5">
            {challengeType && challengePhase && (
              <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">
                {challengeType.replace("_", "-")} · Phase {challengePhase}
              </p>
            )}

            <PropBar
              label="Profit Target"
              current={currentProfit}
              target={profitTarget}
              colorMode="profit"
              tooltip={`Need ${profitTarget}% to pass this phase.`}
            />
            <PropBar
              label="Max Drawdown"
              current={currentDrawdown}
              target={maxDrawdown}
              colorMode="drawdown"
              tooltip={`Account blown at ${maxDrawdown}%.`}
            />
            {dailyDrawdown > 0 && (
              <PropBar
                label="Daily Drawdown"
                current={currentDailyDrawdown}
                target={dailyDrawdown}
                colorMode="drawdown"
                tooltip="Today's drawdown vs daily limit."
              />
            )}

            <div className="flex items-center justify-between pt-0.5">
              {payoutEligible ? (
                <Badge
                  variant="outline"
                  className="text-[9px] h-4 bg-[var(--profit)]/10 text-[var(--profit)] border-[var(--profit)]/20"
                >
                  Payout Eligible ✓
                </Badge>
              ) : (
                <span className="text-[10px] text-muted-foreground">Not payout eligible</span>
              )}
              {totalPayoutsReceived > 0 && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  Earned: {formatCurrency(totalPayoutsReceived)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Behavioural warning ──────────────────────── */}
        {hasFlags && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--warning)]/10 border border-[var(--warning)]/20">
            <span className="text-xs">⚠</span>
            <p className="text-[11px] text-[var(--warning)] font-medium">Behavioural alert detected</p>
          </div>
        )}

        {/* ── Spacer — pushes footer to bottom always ─── */}
        <div className="flex-1" />

        {/* ── Footer ──────────────────────────────────── */}
        <div
          className="flex items-center justify-between pt-3 border-t border-border/60"
          onClick={(e) => e.stopPropagation()}
        >
          <EAStatusChip account={account} />
          <Actions account={account} onEdit={onEdit} onDelete={onDelete} navigate={navigate} />
        </div>
      </div>
    </motion.div>
  );
};

// ── Skeleton — prop-firm height, no inner boxes ───────────
export const AccountCardSkeleton = ({ viewMode = "grid" }) => {
  if (viewMode === "list") {
    return (
      <div className="trading-card p-3 flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
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
            <div key={i} className="space-y-1 flex flex-col items-center">
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
    <div className="trading-card flex flex-col">
      {/* Top strip */}
      <Skeleton className="h-[4px] w-full rounded-none shrink-0" />

      {/* Matching dot-grid so skeleton has the same texture as the real card */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--muted-foreground)/0.15) 1.5px, transparent 1.5px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="flex flex-col flex-1 p-5 gap-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-[13px] w-28" />
              <Skeleton className="h-[11px] w-20" />
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>

        {/* Balance — two lines, no container */}
        <div className="space-y-1.5">
          <Skeleton className="h-[9px] w-14" />
          <div className="flex items-baseline gap-2.5">
            <Skeleton className="h-[26px] w-36" />
            <Skeleton className="h-[11px] w-12" />
          </div>
        </div>

        {/* Stats — three floating columns */}
        <div className="flex items-center divide-x divide-border/50">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "flex-1 flex flex-col items-center gap-1",
                i === 1 ? "pr-3" : i === 2 ? "px-3" : "pl-3"
              )}
            >
              <Skeleton className="h-[9px] w-10" />
              <Skeleton className="h-[13px] w-12" />
            </div>
          ))}
        </div>

        {/* Prop challenge section (always shown — sets prop firm height) */}
        <div className="space-y-2.5">
          <Skeleton className="h-[9px] w-24" />

          {/* Progress bar × 2 */}
          {[1, 2].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-[10px] w-20" />
                <Skeleton className="h-[10px] w-16" />
              </div>
              <Skeleton className="h-[3px] w-full rounded-full" />
            </div>
          ))}

          {/* Payout row */}
          <div className="flex items-center justify-between pt-0.5">
            <Skeleton className="h-4 w-28 rounded-full" />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/60">
          <Skeleton className="h-3 w-16" />
          <div className="flex gap-1">
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};
