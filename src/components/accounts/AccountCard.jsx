import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MoreHorizontal, Eye, Key, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { AccountTypeBadge } from "./AccountTypeBadge";
import { EASyncStatus }     from "./EASyncStatus";
import { DrawdownBar }      from "./DrawdownBar";
import { InfoTooltip }      from "@/components/shared/InfoTooltip";
import { formatCurrency, getPnLColor } from "@/utils/format";
import { cn } from "@/lib/utils";
import { staggerItemVariants } from "@/lib/animations";

const PROP_STATUS_CONFIG = {
  evaluation: { label: "Evaluation", cls: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  active:     { label: "Active",     cls: "bg-green-500/10  text-green-400  border-green-500/20"  },
  funded:     { label: "Funded",     cls: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  breached:   { label: "Breached",   cls: "bg-red-500/10    text-red-400    border-red-500/20"    },
  paused:     { label: "Paused",     cls: "bg-slate-500/10  text-slate-400  border-slate-500/20"  },
  archived:   { label: "Archived",   cls: "bg-slate-500/10  text-slate-400  border-slate-500/20"  },
};

// Left accent bar color per account type
const TYPE_BAR_CLASS = {
  normal: "bg-primary",
  prop:   "bg-violet-500",
  war:    "bg-red-500",
};

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

export const AccountCard = ({ account, viewMode = "grid", onEdit, onDelete }) => {
  const navigate = useNavigate();
  const balance  = account.currentBalance ?? account.startingBalance ?? 0;
  const pnl      = balance - (account.startingBalance ?? 0);

  const propStatus = PROP_STATUS_CONFIG[account.status] ?? null;
  const eaEnabled  = account.eaSync?.enabled ?? false;
  const eaOnline   = account.eaSync?.isOnline ?? false;

  const winRate     = account.performance?.winRate     ?? account.personalMetrics?.winRate     ?? null;
  const avgRR       = account.performance?.avgRR       ?? account.personalMetrics?.avgRR       ?? null;
  const totalTrades = account.performance?.totalTrades ?? account.personalMetrics?.totalTrades ?? null;

  const currentDrawdown = account.currentDrawdownPercent ?? 0;
  const maxDrawdown     = account.propRules?.maxDrawdownPercent ?? 10;

  const normalizedWinRate =
    winRate !== null
      ? winRate <= 1 ? winRate * 100 : winRate
      : null;

  const winRateDisplay = normalizedWinRate !== null ? `${normalizedWinRate.toFixed(1)}%` : "—";
  const winRateColor   =
    normalizedWinRate !== null
      ? normalizedWinRate >= 50 ? "text-[hsl(var(--profit))]" : "text-[hsl(var(--loss))]"
      : "text-muted-foreground";

  const avgRRDisplay = avgRR !== null ? `${avgRR.toFixed(2)}R` : "—";
  const avgRRColor   =
    avgRR !== null
      ? avgRR >= 1 ? "text-[hsl(var(--profit))]" : "text-[hsl(var(--loss))]"
      : "text-muted-foreground";

  const Actions = () => (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
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
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => { e.stopPropagation(); navigate(`/accounts/${account._id}?tab=ea`); }}
            className="gap-2 cursor-pointer"
          >
            <Key className="h-3.5 w-3.5" />
            EA Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem
            onClick={(e) => { e.stopPropagation(); onDelete?.(account); }}
            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  // ── List view ───────────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <motion.div
        variants={staggerItemVariants}
        whileHover={{ x: 2, transition: { duration: 0.15 } }}
        className="trading-card relative overflow-hidden flex items-center gap-4 cursor-pointer group"
        onClick={() => navigate(`/accounts/${account._id}`)}
      >
        {/* Accent bar */}
        <div className={cn("absolute left-0 top-0 h-full w-[3px]", TYPE_BAR_CLASS[account.type])} />

        <div className="pl-3 pr-4 py-3 flex items-center gap-4 w-full">
          {/* Name + badge */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {account.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {account.type === "prop"
                ? (account.propFirm ?? "Prop firm")
                : (account.broker ?? account.platform ?? "—")}
            </p>
          </div>

          <AccountTypeBadge type={account.type} />

          {/* Balance */}
          <div className="text-right hidden sm:block w-32">
            <p className="text-sm font-bold font-mono text-foreground">
              {formatCurrency(balance)}
            </p>
            <p className={cn("text-xs font-mono", getPnLColor(pnl))}>
              {pnl >= 0 ? "+" : ""}{formatCurrency(pnl)}
            </p>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-6">
            <StatCell label="Win Rate" value={winRateDisplay} valueClass={winRateColor} />
            <StatCell label="Avg RR"   value={avgRRDisplay}   valueClass={avgRRColor}   />
            <StatCell label="Trades"   value={totalTrades ?? "—"} />
          </div>

          {/* EA + actions */}
          <div className="flex items-center gap-2 ml-auto" onClick={(e) => e.stopPropagation()}>
            <EASyncStatus isOnline={eaOnline} enabled={eaEnabled} />
            <Actions />
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Grid view ───────────────────────────────────────────────
  return (
    <motion.div
      variants={staggerItemVariants}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.99 }}
      className="trading-card relative overflow-hidden flex flex-col cursor-pointer group"
      onClick={() => navigate(`/accounts/${account._id}`)}
    >
      {/* Accent bar */}
      <div className={cn("absolute left-0 top-0 h-full w-[3px]", TYPE_BAR_CLASS[account.type])} />

      <div className="p-4 pl-5 flex flex-col gap-3">
        {/* Header: name + type badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {account.name}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {account.type === "prop"
                ? (account.propFirm ?? "Prop firm")
                : (account.broker ?? account.platform ?? "—")}
            </p>
          </div>
          <AccountTypeBadge type={account.type} />
        </div>

        {/* Balance */}
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Balance</p>
            <InfoTooltip content="Current account balance" side="top" />
          </div>
          <p className="text-xl font-bold font-mono text-foreground leading-none">
            {formatCurrency(balance)}
          </p>
          <p className={cn("text-xs font-mono mt-0.5", getPnLColor(pnl))}>
            {pnl >= 0 ? "+" : ""}{formatCurrency(pnl)}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border">
          <StatCell
            label="Win Rate"
            value={winRateDisplay}
            valueClass={winRateColor}
            tooltip="Win rate over all closed trades"
          />
          <StatCell
            label="Avg RR"
            value={avgRRDisplay}
            valueClass={avgRRColor}
            tooltip="Average Risk:Reward ratio"
          />
          <StatCell
            label="Trades"
            value={totalTrades ?? "—"}
            tooltip="Total closed trades"
          />
        </div>

        {/* Prop-only: drawdown bar + challenge status */}
        {account.type === "prop" && (
          <div className="space-y-2">
            <DrawdownBar current={currentDrawdown} max={maxDrawdown} />
            {propStatus && (
              <Badge variant="outline" className={cn("text-[10px]", propStatus.cls)}>
                {propStatus.label}
              </Badge>
            )}
          </div>
        )}

        {/* Footer: EA status + actions */}
        <div
          className="flex items-center justify-between pt-1 border-t border-border"
          onClick={(e) => e.stopPropagation()}
        >
          <EASyncStatus isOnline={eaOnline} enabled={eaEnabled} />
          <Actions />
        </div>
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
