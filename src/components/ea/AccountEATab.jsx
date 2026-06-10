import { useState } from "react";
import {
  RefreshCw, Key, Settings2, AlertTriangle, Server,
  BookOpen, ChevronDown, Loader2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

import { Button }    from "@/components/ui/button";
import { Label }     from "@/components/ui/label";
import { Switch }    from "@/components/ui/switch";
import { Input }     from "@/components/ui/input";
import { Skeleton }  from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";

import { useEAStatus, useUpdateEAConfig } from "@/hooks/useEA";
import { formatRelativeTime, formatCompact } from "@/utils/format";
import { InfoTooltip } from "@/components/shared/InfoTooltip";

import { EAStatusDot }          from "./EAStatusIndicator";
import { EAKeyManager }         from "./EAKeyManager";
import { EASetupInstructions }  from "./EASetupInstructions";
import { BrokerInfoCard }       from "./BrokerInfoCard";
import { BalanceMismatchAlert } from "./BalanceMismatchAlert";
import { SyncFailureAlert }     from "./SyncFailureAlert";
import { SyncHistory }          from "./SyncHistory";
import { VerificationBadge }    from "./VerificationBadge";

// ── Reconciliation sticky banner ──────────────────────────────
const ReconciliationBanner = ({ accountId }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--warning)]/10 border border-[var(--warning)]/30">
    <AlertTriangle className="h-4 w-4 text-[var(--warning)] flex-shrink-0" />
    <p className="text-xs text-[var(--warning)] flex-1 leading-relaxed">
      Anomalies were found during the last sync — account verification is paused.
    </p>
    <Button
      asChild size="sm" variant="outline"
      className="flex-shrink-0 h-7 text-xs border-[var(--warning)]/40 text-[var(--warning)] hover:bg-[var(--warning)]/10"
    >
      <Link to={`/accounts/${accountId}/reconciliation`}>Review Now →</Link>
    </Button>
  </div>
);

// ── Connection tab ────────────────────────────────────────────
const ConnectionTab = ({ account, eaSync, isFetching, onRefresh }) => {
  const lastBeat = eaSync.lastHeartbeatAt ?? eaSync.lastHeartbeat;

  return (
    <div className="space-y-5">
      {/* Status line */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          <EAStatusDot eaSync={eaSync} size="md" showLabel />
          {eaSync.verificationStatus && eaSync.verificationStatus !== "unverified" && (
            <>
              <span className="text-border text-xs">·</span>
              <VerificationBadge verificationStatus={eaSync.verificationStatus} />
            </>
          )}
          {eaSync.brokerInfo?.accountCompany && (
            <>
              <span className="text-border text-xs">·</span>
              <span className="text-xs text-muted-foreground font-medium">
                {eaSync.brokerInfo.accountCompany}
              </span>
            </>
          )}
          {lastBeat && (
            <>
              <span className="text-border text-xs hidden sm:inline">·</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Last seen {formatRelativeTime(lastBeat)}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {eaSync.totalSynced != null && (
            <span className="text-xs text-muted-foreground">
              <span className="font-mono font-semibold text-foreground">
                {formatCompact(eaSync.totalSynced)}
              </span> synced
            </span>
          )}
          <Button
            variant="ghost" size="icon" className="h-7 w-7"
            onClick={onRefresh} disabled={isFetching} title="Refresh status"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Alerts */}
      {(eaSync.consecutiveFailures > 3 || eaSync.balanceMismatchCount > 0) && (
        <div className="space-y-2">
          <SyncFailureAlert eaSync={eaSync} />
          <BalanceMismatchAlert eaSync={eaSync} accountId={account._id} />
        </div>
      )}

      {/* API Key section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">API Key</p>
            <InfoTooltip content="Your MT4/MT5 EA authenticates using this key. Generate it once, paste into EA settings. Shown only once — store it securely." />
          </div>

          {/* Setup guide sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm"
                className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Setup Guide
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-card border-border w-full sm:max-w-md overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle>How to Connect Your EA</SheetTitle>
                <SheetDescription>
                  Install and configure the Kraviq EA in MetaTrader step by step.
                </SheetDescription>
              </SheetHeader>
              <EASetupInstructions embedded />
            </SheetContent>
          </Sheet>
        </div>

        <EAKeyManager account={account} eaSync={eaSync} />
      </div>

      {/* Broker info — only when the EA has connected */}
      {eaSync.brokerInfo?.accountNumber && (
        <>
          <Separator className="bg-border/50" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Broker Account</p>
            </div>
            <BrokerInfoCard eaSync={eaSync} />
          </div>
        </>
      )}
    </div>
  );
};

// ── Settings tab ──────────────────────────────────────────────
const todayISO = new Date().toISOString().split("T")[0];

const SettingsTab = ({ account, eaSync }) => {
  const [dirty,        setDirty]        = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [enabled,      setEnabled]      = useState(eaSync?.enabled ?? false);
  const [syncMode,     setSyncMode]     = useState(eaSync?.syncMode ?? "new_only");
  const [syncFromDate, setSyncFromDate] = useState(
    eaSync?.syncStartDate
      ? new Date(eaSync.syncStartDate).toISOString().split("T")[0]
      : account.createdAt
        ? new Date(account.createdAt).toISOString().split("T")[0]
        : todayISO
  );

  const { mutate: updateConfig, isPending } = useUpdateEAConfig(account._id);

  const mark = (fn) => { fn(); setDirty(true); };

  const handleSave = () => {
    const payload = {
      enabled,
      syncMode,
      ...(syncMode === "all" ? { syncStartDate: syncFromDate } : {}),
    };
    updateConfig(payload, { onSuccess: () => setDirty(false) });
  };

  return (
    <div className="space-y-5 max-w-sm">
      {/* Enable toggle — always visible at top level */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Label className="text-sm font-medium text-foreground cursor-pointer" htmlFor="ea-enable-toggle">
              Enable EA Sync
            </Label>
            <InfoTooltip content="When on, your MT4/MT5 EA will automatically push closed trades and transactions to this account." />
          </div>
          <p className="text-xs text-muted-foreground">Allow the EA to sync trades automatically</p>
        </div>
        <Switch
          id="ea-enable-toggle"
          checked={enabled}
          onCheckedChange={(v) => mark(() => setEnabled(v))}
        />
      </div>

      <Separator className="bg-border/50" />

      {/* Advanced settings — collapsible */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <button type="button" className="flex items-center justify-between w-full text-left group">
            <span className="text-sm font-medium text-foreground">Advanced Settings</span>
            <motion.div animate={{ rotate: advancedOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </motion.div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="pt-4 space-y-4">
            {/* Sync mode */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs text-muted-foreground">Sync Mode</Label>
                <InfoTooltip content="Controls which trades appear in your journal. 'New Only' skips trades opened before you first connected the EA." />
              </div>
              <Select value={syncMode} onValueChange={(v) => mark(() => setSyncMode(v))}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="new_only">
                    <div>
                      <p className="font-medium">New Trades Only</p>
                      <p className="text-xs text-muted-foreground">Trades opened after connecting</p>
                    </div>
                  </SelectItem>
                  <SelectItem value="all">
                    <div>
                      <p className="font-medium">All Trades</p>
                      <p className="text-xs text-muted-foreground">Include trades before connection date</p>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sync from date — only when mode is "all" */}
            <AnimatePresence initial={false}>
              {syncMode === "all" && (
                <motion.div
                  key="sync-date-field"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs text-muted-foreground">Sync From Date</Label>
                      <InfoTooltip content="EA syncs trades on or after this date. Defaults to 1 year back if not set." />
                    </div>
                    <Input
                      type="date"
                      value={syncFromDate}
                      max={todayISO}
                      onChange={(e) => mark(() => setSyncFromDate(e.target.value))}
                      className="bg-background border-border"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator className="bg-border/50" />

      <Button onClick={handleSave} disabled={!dirty || isPending} size="sm" className="gap-2">
        {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {isPending ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
};

// ── History tab ───────────────────────────────────────────────
const HistoryTab = ({ accountId, eaSync }) => (
  <div className="space-y-4">
    {(eaSync.lastSyncedAt || eaSync.totalSynced != null) && (
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        {eaSync.lastSyncedAt && (
          <span>
            Last sync:{" "}
            <span className="text-foreground font-medium">
              {formatRelativeTime(eaSync.lastSyncedAt)}
            </span>
          </span>
        )}
        {eaSync.totalSynced != null && (
          <span>
            Total synced:{" "}
            <span className="font-mono font-semibold text-foreground">
              {formatCompact(eaSync.totalSynced)}
            </span>
          </span>
        )}
        {eaSync.lastSyncStatus && (
          <span className={
            eaSync.lastSyncStatus === "success" ? "text-[var(--profit)]" :
            eaSync.lastSyncStatus === "failed"  ? "text-[var(--loss)]"   :
            "text-[var(--warning)]"
          }>
            {eaSync.lastSyncStatus.charAt(0).toUpperCase() + eaSync.lastSyncStatus.slice(1)}
          </span>
        )}
      </div>
    )}
    <SyncHistory accountId={accountId} compact={false} />
  </div>
);

// ── Skeleton ──────────────────────────────────────────────────
const EATabSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-9 w-64 rounded-lg" />
    <Skeleton className="h-8 w-full rounded-lg" />
    <Skeleton className="h-52 w-full rounded-xl" />
  </div>
);

// ── Main AccountEATab ─────────────────────────────────────────
export const AccountEATab = ({ account, isTabActive }) => {
  const {
    data: liveStatus,
    isLoading: statusLoading,
    refetch,
    isFetching,
  } = useEAStatus(account._id, { polling: isTabActive });

  const eaSync = liveStatus ?? account.eaSync ?? {};

  if (statusLoading && !account.eaSync) {
    return <EATabSkeleton />;
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Sticky reconciliation banner */}
      {eaSync.verificationStatus === "needs_review" && (
        <ReconciliationBanner accountId={account._id} />
      )}

      {/* Inner tabs */}
      <Tabs defaultValue="connection">
        <TabsList className="bg-muted/40 border border-border/50">
          <TabsTrigger value="connection" className="gap-1.5 text-xs">
            <Key className="h-3.5 w-3.5" />
            Connection
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5 text-xs">
            <Settings2 className="h-3.5 w-3.5" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="mt-5">
          <ConnectionTab
            account={account}
            eaSync={eaSync}
            isFetching={isFetching}
            onRefresh={refetch}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-5">
          <SettingsTab account={account} eaSync={eaSync} />
        </TabsContent>

        <TabsContent value="history" className="mt-5">
          <HistoryTab accountId={account._id} eaSync={eaSync} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
