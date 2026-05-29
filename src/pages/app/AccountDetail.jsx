import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Copy, Check, RefreshCw, Loader2, Trash2, Key, Zap
} from "lucide-react";
import { toast } from "sonner";

import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Label }     from "@/components/ui/label";
import { Textarea }  from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton }  from "@/components/ui/skeleton";
import { Badge }     from "@/components/ui/badge";
import { Switch }    from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { AccountTypeBadge } from "@/components/accounts/AccountTypeBadge";
import { EASyncStatus }     from "@/components/accounts/EASyncStatus";
import { DrawdownBar }      from "@/components/accounts/DrawdownBar";
import { InfoTooltip }      from "@/components/shared/InfoTooltip";
import { ErrorState }       from "@/components/shared/ErrorState";
import { BalanceHistoryChart } from "@/components/dashboard/BalanceHistoryChart";

import {
  useAccount, useUpdateAccount, useDeleteAccount,
  useEAStatus, useGenerateEAKey, useRevokeEAKey,
} from "@/hooks/useAccounts";
import { useTradeStats, useTrades } from "@/hooks/useTrades";
import { useBalanceHistory } from "@/hooks/useTransactions";

import { accountFormSchema, transformAccountForm } from "@/app/schema/account";
import { formatCurrency, formatDate, formatRelativeTime, getPnLColor, formatPnL } from "@/utils/format";
import { DirectionBadge } from "@/components/trades/DirectionBadge";
import { OutcomeBadge }   from "@/components/trades/OutcomeBadge";
import { AddTradeSheet }  from "@/components/trades/AddTradeSheet";
import { TradeDetailPanel } from "@/components/trades/TradeDetailPanel";
import { pageVariants }     from "@/lib/animations";
import { cn }               from "@/lib/utils";

// ── Skeleton ─────────────────────────────────────────────────
const AccountDetailSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center gap-3">
      <Skeleton className="h-8 w-24" />
    </div>
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-36" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="trading-card p-4 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
    <Skeleton className="h-56 w-full rounded-xl" />
  </div>
);

// ── Stat card for overview ────────────────────────────────────
const OverviewStatCard = ({ label, value, sub, subColor, tooltip }) => (
  <div className="trading-card p-4">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <InfoTooltip content={tooltip} />
    </div>
    <p className="text-xl font-bold font-mono text-foreground leading-none">{value ?? "—"}</p>
    {sub && (
      <p className={cn("text-xs font-mono mt-1", subColor ?? "text-muted-foreground")}>{sub}</p>
    )}
  </div>
);

// ── EA key copy input ─────────────────────────────────────────
const CopyInput = ({ value }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex gap-2">
      <Input
        readOnly
        value={value}
        className="font-mono text-xs bg-background border-border flex-1"
      />
      <Button variant="outline" size="icon" onClick={copy} className="flex-shrink-0">
        {copied ? <Check className="h-4 w-4 text-[hsl(var(--profit))]" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};

// ── Settings form ─────────────────────────────────────────────
const SettingsTab = ({ account, onDelete }) => {
  const { mutate: updateAccount, isPending } = useUpdateAccount(account._id);
  const {
    register, control, handleSubmit, formState: { errors }, watch,
  } = useForm({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name:            account.name,
      type:            account.type,
      platform:        account.platform,
      baseCurrency:    account.baseCurrency ?? "USD",
      startingBalance: account.startingBalance ?? 0,
      broker:          account.broker ?? "",
      tradingMode:     account.tradingMode ?? "live",
      notes:           account.notes ?? "",
      propFirm:        account.propFirm ?? "",
    },
  });

  const accountType = watch("type");

  const onSubmit = (formData) => {
    const payload = transformAccountForm(formData);
    updateAccount(payload);
  };

  const FieldError = ({ error }) =>
    error ? <p className="text-xs text-destructive mt-1">{error.message}</p> : null;

  const FF = ({ label, children, error, required }) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      <FieldError error={error} />
    </div>
  );

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
        <FF label="Account Name" required error={errors.name}>
          <Input className="bg-background border-border" {...register("name")} />
        </FF>

        <div className="grid grid-cols-2 gap-3">
          <FF label="Platform" required error={errors.platform}>
            <Controller
              name="platform"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {[
                      { value: "mt4",         label: "MT4" },
                      { value: "mt5",         label: "MT5" },
                      { value: "ctrader",     label: "cTrader" },
                      { value: "tradingview", label: "TradingView" },
                      { value: "manual",      label: "Manual" },
                    ].map(({ value, label }) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FF>

          <FF label="Base Currency" required error={errors.baseCurrency}>
            <Controller
              name="baseCurrency"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {["USD","EUR","GBP","JPY","AUD","CHF","CAD","NZD"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FF>
        </div>

        {accountType !== "prop" && (
          <FF label="Broker" error={errors.broker}>
            <Input className="bg-background border-border" {...register("broker")} />
          </FF>
        )}

        {accountType === "prop" && (
          <FF label="Prop Firm" error={errors.propFirm}>
            <Input className="bg-background border-border" {...register("propFirm")} />
          </FF>
        )}

        {accountType !== "prop" && (
          <FF label="Notes" error={errors.notes}>
            <Textarea
              rows={3}
              className="bg-background border-border resize-none"
              {...register("notes")}
            />
          </FF>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      {/* ── Danger zone ───── */}
      <div className="border border-destructive/30 rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-destructive">Danger Zone</p>
        <p className="text-xs text-muted-foreground">
          Permanently delete this account and all associated trades, transactions, and data.
          This action cannot be undone.
        </p>
        <Button
          variant="destructive"
          size="sm"
          className="gap-2"
          onClick={() => onDelete(account)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete Account
        </Button>
      </div>
    </div>
  );
};

// ── EA Sync tab ───────────────────────────────────────────────
const EASyncTab = ({ accountId }) => {
  const [newKey,          setNewKey]          = useState(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const hasShownKeyToast = useRef(false);

  const { data: eaStatus, isLoading: statusLoading } = useEAStatus(accountId);
  const { mutate: generateKey, isPending: generating }  = useGenerateEAKey(accountId);
  const { mutate: revokeKey,   isPending: revoking }    = useRevokeEAKey(accountId);

  const handleGenerate = () => {
    generateKey(undefined, {
      onSuccess: (data) => {
        const key = data?.apiKey ?? data?.key ?? data?.data?.apiKey;
        if (key) {
          setNewKey(key);
          if (!hasShownKeyToast.current) {
            toast.warning("Copy your EA API key now. It will not be shown again.");
            hasShownKeyToast.current = true;
          }
        }
      },
    });
  };

  const handleRevoke = () => {
    revokeKey(undefined, {
      onSuccess: () => {
        setNewKey(null);
        setRevokeDialogOpen(false);
      },
    });
  };

  if (statusLoading) {
    return (
      <div className="space-y-4 max-w-lg">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  const isEnabled = eaStatus?.enabled ?? false;
  const isOnline  = eaStatus?.isOnline ?? false;
  const lastHeartbeat = eaStatus?.lastHeartbeat;
  const hasKey    = eaStatus?.hasApiKey ?? false;
  const keyGeneratedAt = eaStatus?.keyGeneratedAt;
  const keyLastUsedAt  = eaStatus?.keyLastUsedAt;

  return (
    <div className="space-y-6 max-w-lg">
      {/* Status card */}
      <div className="trading-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">EA Sync Status</p>
          <EASyncStatus isOnline={isOnline} enabled={isEnabled} />
        </div>
        {lastHeartbeat && (
          <p className="text-xs text-muted-foreground">
            Last heartbeat: {formatRelativeTime(lastHeartbeat)}
          </p>
        )}
        <div className="flex items-center justify-between pt-1">
          <div className="space-y-0.5">
            <Label className="text-xs text-muted-foreground">Enable EA Sync</Label>
            <p className="text-[11px] text-muted-foreground">
              Allow your MT4/MT5 EA to sync trades automatically
            </p>
          </div>
          <Switch checked={isEnabled} disabled />
        </div>
      </div>

      {/* API key section */}
      <div className="trading-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">EA API Key</p>
          <InfoTooltip
            content="Generate a key to connect your MT4/MT5 EA to Tradecore. The key is shown once after generation and cannot be retrieved again."
          />
        </div>

        {/* Newly generated key — show once */}
        {newKey && (
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[hsl(var(--warning)/0.1)] border border-[hsl(var(--warning)/0.3)]">
              <span className="text-sm">⚠️</span>
              <p className="text-xs text-[hsl(var(--warning))]">
                Copy this key now. Once you leave this page it cannot be retrieved.
              </p>
            </div>
            <CopyInput value={newKey} />
          </div>
        )}

        {/* Existing key info (no key after generation) */}
        {!newKey && hasKey && (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>Key generated: {keyGeneratedAt ? formatDate(keyGeneratedAt) : "—"}</p>
            <p>Last used: {keyLastUsedAt ? formatRelativeTime(keyLastUsedAt) : "Never"}</p>
          </div>
        )}

        {!newKey && !hasKey && (
          <p className="text-xs text-muted-foreground">No EA API key generated yet.</p>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={hasKey ? "outline" : "default"}
            onClick={handleGenerate}
            disabled={generating}
            className="gap-2"
          >
            {generating
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generating...</>
              : <><RefreshCw className="h-3.5 w-3.5" />{hasKey ? "Regenerate Key" : "Generate Key"}</>
            }
          </Button>

          {hasKey && !newKey && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setRevokeDialogOpen(true)}
              disabled={revoking}
              className="gap-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Revoke Key
            </Button>
          )}
        </div>
      </div>

      {/* Revoke confirmation */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke EA API Key</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately disconnect your EA. You will need to generate a new key
              and update your EA settings to reconnect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRevoke} disabled={revoking}>
              {revoking ? "Revoking..." : "Revoke Key"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// ── Account Trades Tab ────────────────────────────────────────
const AccountTradesTab = ({ accountId, accountName }) => {
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [isAddOpen, setIsAddOpen]         = useState(false);

  const { data: tradesData, isLoading } = useTrades({
    accountId,
    limit: 10,
    sort:  "closedAt_desc",
  });
  const trades     = tradesData?.trades                ?? [];
  const total      = tradesData?.pagination?.total     ?? 0;
  const totalPages = tradesData?.pagination?.totalPages ?? 1;

  return (
    <>
      <div className={cn("transition-[padding] duration-300", !!selectedTrade && "pr-[444px]")}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-foreground">
            {total > 0 ? `${total} trades` : "Trades"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 h-8 text-xs"
              onClick={() => setIsAddOpen(true)}
            >
              <span className="text-base leading-none">+</span>
              Add Trade
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link to={`/trades?accountId=${accountId}`}>View all</Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[44px] rounded-lg" />
            ))}
          </div>
        ) : trades.length === 0 ? (
          <div className="trading-card p-8 flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-sm font-medium text-foreground">No trades yet</p>
            <p className="text-xs text-muted-foreground">
              Add your first trade or import from a CSV file.
            </p>
            <Button size="sm" className="mt-2 gap-1.5" onClick={() => setIsAddOpen(true)}>
              <span className="text-base leading-none">+</span>
              Add Trade
            </Button>
          </div>
        ) : (
          <div className="trading-card overflow-hidden">
            <div className="divide-y divide-border">
              {trades.map((trade) => {
                const pnlVal = trade.netPnl ?? trade.pnl ?? 0;
                const selected = trade._id === selectedTrade?._id;
                return (
                  <button
                    key={trade._id}
                    type="button"
                    onClick={() => setSelectedTrade((p) => (p?._id === trade._id ? null : trade))}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                      selected ? "bg-primary/5" : "hover:bg-muted/40"
                    )}
                  >
                    <DirectionBadge direction={trade.direction} />
                    <span className="font-mono font-semibold text-sm text-foreground min-w-[64px]">
                      {trade.pair}
                    </span>
                    <OutcomeBadge outcome={trade.outcome} />
                    <span className="text-xs text-muted-foreground ml-1 flex-1 text-left hidden sm:block">
                      {trade.closedAt
                        ? new Date(trade.closedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </span>
                    <span className={cn("font-mono font-bold text-sm ml-auto flex-shrink-0", getPnLColor(pnlVal))}>
                      {formatPnL(pnlVal)}
                    </span>
                    {trade.realizedRR != null && (
                      <span className="font-mono text-[10px] text-muted-foreground w-10 text-right flex-shrink-0">
                        {Number(trade.realizedRR).toFixed(2)}R
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {total > 10 && (
              <div className="px-4 py-2.5 border-t border-border">
                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" asChild>
                  <Link to={`/trades?accountId=${accountId}`}>
                    View all {total} trades →
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inline trade detail panel */}
      <AnimatePresence>
        {selectedTrade && (
          <motion.div
            key="account-trade-panel"
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-14 right-0 h-[calc(100vh-3.5rem)] w-[420px] bg-card border-l border-border z-40 overflow-hidden"
          >
            <TradeDetailPanel
              trade={selectedTrade}
              onClose={() => setSelectedTrade(null)}
              onDelete={() => setSelectedTrade(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AddTradeSheet
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        defaultAccountId={accountId}
      />
    </>
  );
};

// ── Main AccountDetail component ──────────────────────────────
export const AccountDetail = () => {
  const { id }               = useParams();
  const navigate             = useNavigate();
  const [searchParams]       = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") ?? "overview");
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [confirmName,   setConfirmName]   = useState("");

  const { data: account, isLoading, isError, refetch } = useAccount(id);
  const { data: tradeStats, isLoading: statsLoading }  = useTradeStats({ accountId: id });
  const { data: balanceHistory, isLoading: historyLoading } = useBalanceHistory({ accountId: id });
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  const handleDeleteConfirm = () => {
    if (confirmName !== deleteTarget?.name) {
      toast.error("Account name does not match.");
      return;
    }
    deleteAccount(deleteTarget._id, {
      onSuccess: () => navigate("/accounts"),
    });
  };

  if (isLoading) return <AccountDetailSkeleton />;

  if (isError) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <ErrorState message="Failed to load account" onRetry={refetch} />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <ErrorState message="Account not found" onRetry={() => navigate("/accounts")} />
      </div>
    );
  }

  const balance         = account.currentBalance ?? account.startingBalance ?? 0;
  const pnl             = balance - (account.startingBalance ?? 0);
  const winRate         = tradeStats?.winRate ?? null;
  const totalTrades     = tradeStats?.totalTrades ?? null;
  const monthlyPnl      = tradeStats?.monthlyPnl ?? null;
  const eaEnabled       = account.eaSync?.enabled ?? false;
  const eaOnline        = account.eaSync?.isOnline ?? false;
  const currentDrawdown = account.currentDrawdownPercent ?? 0;
  const maxDrawdown     = account.propRules?.maxDrawdownPercent ?? 10;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6 space-y-6"
    >
      {/* ── Back button ──────────────────────────── */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground hover:text-foreground -ml-1"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Accounts
      </Button>

      {/* ── Account header ───────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-heading font-bold text-foreground">{account.name}</h1>
          <AccountTypeBadge type={account.type} />
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
          {account.type !== "prop" && account.broker && <span>{account.broker}</span>}
          {account.type === "prop" && account.propFirm && <span>{account.propFirm}</span>}
          {account.platform && (
            <>
              <span className="text-border">·</span>
              <span>{account.platform}</span>
            </>
          )}
          <EASyncStatus isOnline={eaOnline} enabled={eaEnabled} />
        </div>
        <div className="flex items-center gap-2">
          <p className="text-3xl font-bold font-mono text-foreground">
            {formatCurrency(balance)}
          </p>
          <span className={cn("text-sm font-mono", getPnLColor(pnl))}>
            {pnl >= 0 ? "+" : ""}{formatCurrency(pnl)}
          </span>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="ea">EA Sync</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* ── Overview tab ───────────────────────── */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* Stat cards row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <OverviewStatCard
              label="Balance"
              value={formatCurrency(balance)}
              tooltip="Current account balance"
            />
            <OverviewStatCard
              label="Monthly PnL"
              value={monthlyPnl !== null ? formatCurrency(monthlyPnl) : "—"}
              subColor={getPnLColor(monthlyPnl)}
              tooltip="Net PnL this calendar month"
            />
            <OverviewStatCard
              label="Win Rate"
              value={
                winRate !== null
                  ? `${(winRate * (winRate <= 1 ? 100 : 1)).toFixed(1)}%`
                  : statsLoading ? null : "—"
              }
              tooltip="Percentage of winning trades in the last 30 days"
            />
            <OverviewStatCard
              label="Total Trades"
              value={totalTrades !== null ? String(totalTrades) : statsLoading ? null : "—"}
              tooltip="Total number of closed trades on this account"
            />
          </div>

          {/* Balance history chart */}
          <div className="trading-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Balance History
              </p>
              <InfoTooltip content="Your account balance over time. Each point represents the balance at that date." />
            </div>
            <div className="h-56">
              <BalanceHistoryChart
                data={balanceHistory}
                isLoading={historyLoading}
              />
            </div>
          </div>

          {/* Prop challenge card */}
          {account.type === "prop" && (
            <div className="trading-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  Challenge Progress
                </p>
                {account.status && (
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-orange-500/10 text-orange-400 border-orange-500/20"
                  >
                    {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                  </Badge>
                )}
              </div>

              <DrawdownBar current={currentDrawdown} max={maxDrawdown} />

              {account.propRules?.profitTargetPercent && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Profit Target</span>
                    <span className="font-mono">
                      {pnl >= 0 ? "+" : ""}{((pnl / (account.startingBalance ?? 1)) * 100).toFixed(2)}%
                      {" / "}
                      {account.propRules.profitTargetPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[hsl(var(--profit))] transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(0,
                          ((pnl / (account.startingBalance ?? 1)) * 100)
                          / account.propRules.profitTargetPercent * 100
                        ))}%`
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs">
                {account.propRules?.minTradingDays && (
                  <div>
                    <p className="text-muted-foreground">Min Trading Days</p>
                    <p className="font-mono font-medium text-foreground mt-0.5">
                      {account.propRules.minTradingDays} days required
                    </p>
                  </div>
                )}
                {account.propRules?.challengeFee && (
                  <div>
                    <p className="text-muted-foreground">Challenge Fee</p>
                    <p className="font-mono font-medium text-foreground mt-0.5">
                      {formatCurrency(account.propRules.challengeFee)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Trades tab ─────────────────────────── */}
        <TabsContent value="trades" className="mt-4">
          <AccountTradesTab accountId={id} accountName={account?.name} />
        </TabsContent>

        {/* ── Transactions tab ───────────────────── */}
        <TabsContent value="transactions" className="mt-4">
          <div className="trading-card p-8 flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-sm font-medium text-foreground">Transactions coming soon</p>
            <p className="text-xs text-muted-foreground">
              Transaction history and management will be available in the next update.
            </p>
          </div>
        </TabsContent>

        {/* ── EA Sync tab ────────────────────────── */}
        <TabsContent value="ea" className="mt-4">
          <EASyncTab accountId={id} />
        </TabsContent>

        {/* ── Settings tab ───────────────────────── */}
        <TabsContent value="settings" className="mt-4">
          <SettingsTab
            account={account}
            onDelete={(acc) => { setDeleteTarget(acc); setConfirmName(""); }}
          />
        </TabsContent>
      </Tabs>

      {/* ── Delete confirmation ───────────────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setConfirmName(""); } }}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">
                This will permanently delete{" "}
                <span className="font-semibold text-foreground">{deleteTarget?.name}</span>{" "}
                and all its trades, transactions, and history.
              </span>
              <span className="block text-xs text-muted-foreground">
                Type the account name to confirm:
              </span>
              <input
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={deleteTarget?.name}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => { setDeleteTarget(null); setConfirmName(""); }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting || confirmName !== deleteTarget?.name}
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
