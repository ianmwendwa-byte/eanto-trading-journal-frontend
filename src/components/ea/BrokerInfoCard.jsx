import { useState } from "react";
import { ChevronDown, Server, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "./VerificationBadge";
import { formatDate, formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

const InfoRow = ({ label, value, valueClass }) => (
  <div>
    <p className="text-[11px] text-muted-foreground">{label}</p>
    <p className={cn("text-xs font-medium text-foreground font-mono", valueClass)}>{value ?? "—"}</p>
  </div>
);

const SuspiciousAlert = ({ onRevoke }) => (
  <div className="mt-3 p-3 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/25 space-y-2">
    <div className="flex items-center gap-2">
      <AlertTriangle className="h-4 w-4 text-[var(--warning)] flex-shrink-0" />
      <p className="text-xs font-semibold text-[var(--warning)]">Suspicious Activity Detected</p>
    </div>
    <p className="text-xs text-muted-foreground">
      Unusual patterns were detected in your EA connection. This may indicate:
    </p>
    <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
      <li>Multiple devices connecting with the same key</li>
      <li>Unusually high trade frequency</li>
      <li>Trades outside normal parameters</li>
    </ul>
    <p className="text-xs font-medium text-foreground">Recommended actions:</p>
    <ol className="text-xs text-muted-foreground space-y-0.5 list-decimal list-inside">
      <li>Verify no one else has your API key</li>
      <li>Check your EA settings in MT4/MT5</li>
      <li>Revoke and regenerate your key if compromised</li>
      <li>Contact support if the issue persists</li>
    </ol>
    <div className="flex gap-2 pt-1">
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-[var(--loss)] border-[var(--loss)]/30 hover:bg-[var(--loss)]/10 h-7 text-xs"
        onClick={onRevoke}
      >
        Revoke Key
      </Button>
      <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground">
        Contact Support
      </Button>
    </div>
  </div>
);

const FailedAlert = ({ reason, onRegenerate }) => (
  <div className="mt-3 p-3 rounded-lg bg-[var(--loss)]/10 border border-[var(--loss)]/25 space-y-2">
    <div className="flex items-center gap-2">
      <XCircle className="h-4 w-4 text-[var(--loss)] flex-shrink-0" />
      <p className="text-xs font-semibold text-[var(--loss)]">Verification Failed</p>
    </div>
    <p className="text-xs text-muted-foreground">
      {reason ?? "Unable to verify broker account. Try reconnecting your EA."}
    </p>
    <Button
      size="sm"
      variant="outline"
      className="gap-1.5 h-7 text-xs"
      onClick={onRegenerate}
    >
      <RefreshCw className="h-3 w-3" />
      Regenerate Key
    </Button>
  </div>
);

export const BrokerInfoCard = ({ eaSync, onRevokeKey, onRegenerateKey }) => {
  const [collapsed, setCollapsed] = useState(false);

  const brokerInfo   = eaSync?.brokerInfo ?? {};
  const verification = eaSync?.verificationStatus ?? "unverified";

  const hasData = !!brokerInfo.accountNumber;
  if (!hasData) return null;

  return (
    <div className="trading-card overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setCollapsed((p) => !p)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Broker Account</span>
          <VerificationBadge verificationStatus={verification} />
        </div>
        <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 pb-4 border-t border-border space-y-3 pt-3">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <InfoRow label="Account Number" value={brokerInfo.accountNumber} />
                <InfoRow label="Server"         value={brokerInfo.accountServer} />
                <InfoRow label="Company"        value={brokerInfo.accountCompany} />
                <InfoRow label="Account Name"   value={brokerInfo.accountName} />
                <InfoRow label="Currency"       value={brokerInfo.currency} />
                <InfoRow label="Leverage"       value={brokerInfo.leverage ? `1:${brokerInfo.leverage}` : undefined} />
                <InfoRow
                  label="Account Type"
                  value={brokerInfo.isLive ? "Live Account" : "Demo Account"}
                  valueClass={brokerInfo.isLive ? "text-[var(--profit)]" : "text-[var(--warning)]"}
                />
                <InfoRow label="Trade Mode" value={brokerInfo.tradeMode} />
              </div>

              {/* Verification timestamps */}
              <div className="flex gap-4 text-[11px] text-muted-foreground pt-1 border-t border-border">
                {eaSync.verifiedAt && (
                  <span>First verified: {formatDate(eaSync.verifiedAt)}</span>
                )}
                {eaSync.lastVerifiedAt && (
                  <span>Last verified: {formatRelativeTime(eaSync.lastVerifiedAt)}</span>
                )}
              </div>

              {/* Alerts */}
              {verification === "suspicious" && (
                <SuspiciousAlert onRevoke={onRevokeKey} />
              )}
              {verification === "failed" && (
                <FailedAlert reason={eaSync?.verificationFailReason} onRegenerate={onRegenerateKey} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
