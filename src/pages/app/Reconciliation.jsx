import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ErrorState } from "@/components/shared/ErrorState";
import { AnomalyCard } from "@/components/ea/AnomalyCard";
import { useReconciliation, useAnomalies, useResolveAnomaly } from "@/hooks/useEA";
import { useAccount } from "@/hooks/useAccounts";
import { formatCurrency, getPnLColor } from "@/utils/format";
import { pageVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

// ── Stat pill ─────────────────────────────────────────────────
const StatPill = ({ label, value, valueClass }) => (
  <div className="trading-card p-3 text-center flex-1 min-w-0">
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium truncate">{label}</p>
    <p className={cn("text-lg font-mono font-bold mt-0.5", valueClass ?? "text-foreground")}>{value ?? "—"}</p>
  </div>
);

// ── Skeleton ──────────────────────────────────────────────────
const ReconciliationSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center gap-3">
      <Skeleton className="h-8 w-24" />
    </div>
    <div className="flex gap-3">
      {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 flex-1 rounded-xl" />)}
    </div>
    <Skeleton className="h-3 w-full rounded-full" />
    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
  </div>
);

// ── Verified state ────────────────────────────────────────────
const VerifiedBanner = ({ accountId }) => (
  <div className="trading-card p-6 flex flex-col items-center justify-center text-center space-y-3">
    <div className="h-12 w-12 rounded-full bg-[var(--profit)]/10 flex items-center justify-center">
      <CheckCircle2 className="h-6 w-6 text-[var(--profit)]" />
    </div>
    <div>
      <p className="text-base font-semibold text-foreground">Account Verified</p>
      <p className="text-sm text-muted-foreground mt-1">
        All anomalies resolved. Your trading history is verified.
      </p>
    </div>
    <Button asChild size="sm">
      <Link to={`/accounts/${accountId}`}>View Account</Link>
    </Button>
  </div>
);

// ── Main page ─────────────────────────────────────────────────
export const Reconciliation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: account, isLoading: accountLoading } = useAccount(id);
  const { data: reconciliation, isLoading: reconLoading } = useReconciliation(id);
  const { data: anomalyData, isLoading: anomalyLoading } = useAnomalies(id, { status: "pending" });
  const { mutateAsync: resolveAnomaly } = useResolveAnomaly(id);

  const session   = reconciliation?.session   ?? null;
  const anomalies = anomalyData?.anomalies    ?? [];
  const pending   = anomalyData?.pending      ?? anomalies.filter((a) => a.status === "pending").length;

  const total    = session?.totalAnomalies    ?? 0;
  const resolved = session?.resolvedAnomalies ?? 0;
  const progress = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const isVerified = reconciliation?.isVerified ?? false;
  const allDone   = total > 0 && resolved >= total;

  // Redirect to account detail once verified
  useEffect(() => {
    if (isVerified && !reconLoading) {
      const t = setTimeout(() => navigate(`/accounts/${id}`), 2500);
      return () => clearTimeout(t);
    }
  }, [isVerified, reconLoading, id, navigate]);

  const isLoading = accountLoading || reconLoading || anomalyLoading;

  if (isLoading) return <ReconciliationSkeleton />;

  const balanceGap    = session?.balanceGap ?? 0;
  const mt5Balance    = session?.mt5Balance;
  const rebuiltBalance = session?.rebuiltBalance;

  const handleResolve = ({ anomalyId, resolution, note }) =>
    resolveAnomaly({ anomalyId, resolution, note });

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6 space-y-6"
    >
      {/* ── Back nav ── */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground hover:text-foreground -ml-1"
        onClick={() => navigate(`/accounts/${id}`)}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {account?.name ?? "Account"}
      </Button>

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Reconciliation Review</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Resolve data discrepancies before your account can be verified.
        </p>
      </div>

      {/* ── Summary bar ── */}
      {session && (
        <div className="flex gap-3 flex-wrap">
          <StatPill label="MT5 Balance"     value={mt5Balance     != null ? formatCurrency(mt5Balance)     : "—"} />
          <StatPill label="Rebuilt Balance" value={rebuiltBalance != null ? formatCurrency(rebuiltBalance) : "—"} />
          <StatPill
            label="Gap"
            value={balanceGap != null ? formatCurrency(Math.abs(balanceGap)) : "—"}
            valueClass={balanceGap !== 0 ? "text-[var(--loss)]" : "text-[var(--profit)]"}
          />
          <StatPill
            label="Resolved"
            value={`${resolved} / ${total}`}
            valueClass={allDone ? "text-[var(--profit)]" : "text-foreground"}
          />
        </div>
      )}

      {/* ── Progress bar ── */}
      {total > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{resolved} of {total} items resolved</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          {allDone && !isVerified && (
            <p className="text-xs text-[var(--warning)] animate-pulse">
              Verification in progress...
            </p>
          )}
        </div>
      )}

      {/* ── Verified banner ── */}
      {isVerified && <VerifiedBanner accountId={id} />}

      {/* ── Anomaly list ── */}
      {!isVerified && anomalies.length === 0 && !reconLoading && (
        <div className="trading-card p-8 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">No pending anomalies</p>
          <p className="text-xs text-muted-foreground">
            {total > 0
              ? "All anomalies resolved — verification is running."
              : "No issues were found during the last sync."}
          </p>
        </div>
      )}

      {!isVerified && anomalies.length > 0 && (
        <div className="space-y-3">
          {anomalies.map((anomaly) => (
            <AnomalyCard
              key={anomaly._id}
              anomaly={anomaly}
              onResolve={handleResolve}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};
