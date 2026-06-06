import { useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import {
  useUserScore,
  useUserScoreHistory,
  useRecalculateScore,
  useAccountScore,
  useAccountScoreHistory,
  useRecalculateAccountScore,
} from "@/hooks/useScore";
import { useAccounts } from "@/hooks/useAccounts";
import { pageVariants }        from "@/lib/animations";
import { ScoreTeaser }         from "@/components/score/ScoreTeaser";
import { ScoreEmptyState }     from "@/components/score/ScoreEmptyState";
import { ScorePanel }          from "@/components/score/ScorePanel";
import { ScoreDetail }         from "@/components/score/ScoreDetail";
import { ScoreSkeleton }       from "@/components/score/ScoreSkeleton";
import { ScoreScopeSelector }  from "@/components/score/ScoreScopeSelector";
import { ErrorState }          from "@/components/shared/ErrorState";

export const Score = () => {
  const { mongoUser } = useAuthStore();
  const betaEnabled   = mongoUser?.featureFlags?.betaBusinessScore;

  const [scope, setScope] = useState("user");
  const isUserScope = scope === "user";

  // Load all accounts for the scope selector
  const { data: accountsData } = useAccounts({ limit: 50 });
  const accounts = accountsData?.accounts ?? [];

  // ── Always call all hooks (React rules); enabled flag controls execution ──

  const userScoreQuery    = useUserScore();
  const userHistoryQuery  = useUserScoreHistory(12);
  const recalcUser        = useRecalculateScore();

  // Passes null when scope is "user" → these queries won't run (enabled: !!accountId)
  const accountScoreQuery   = useAccountScore(isUserScope ? null : scope);
  const accountHistoryQuery = useAccountScoreHistory(isUserScope ? null : scope);
  const recalcAccount       = useRecalculateAccountScore(isUserScope ? null : scope);

  // ── Beta gate ──────────────────────────────────────────────────
  if (!betaEnabled) return <ScoreTeaser />;

  // ── Active data based on selected scope ───────────────────────
  const { data: score, isLoading, isError, error, refetch } =
    isUserScope ? userScoreQuery : accountScoreQuery;

  const { data: history } =
    isUserScope ? userHistoryQuery : accountHistoryQuery;

  const onRecalculate  = isUserScope ? () => recalcUser.mutate()    : () => recalcAccount.mutate();
  const isRecalculating = isUserScope ? recalcUser.isPending         : recalcAccount.isPending;

  // ── States ────────────────────────────────────────────────────
  if (isLoading) return <ScoreSkeleton />;

  if (isError) return (
    <div className="p-6">
      <ErrorState
        message={error?.message ?? "Failed to load Business Score"}
        onRetry={refetch}
      />
    </div>
  );

  const hasMinimumData = score?.metadata?.hasMinimumData !== false;
  const hasScore       = score != null && score?.overall != null;

  const historyArr    = Array.isArray(history) ? history : [];
  const previousScore = historyArr.length >= 2 ? (historyArr[1]?.overall ?? null) : null;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={pageVariants}
      className="p-4 md:p-6"
    >
      {/* Header */}
      <div className="mb-4">
        <h1 className="font-heading font-bold text-2xl text-foreground">Business Score</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your trading business health — 0 to 100
        </p>
      </div>

      {/* Scope selector — only shown when accounts are loaded */}
      {accounts.length > 0 && (
        <div className="mb-6">
          <ScoreScopeSelector
            accounts={accounts}
            scope={scope}
            onScopeChange={(s) => { setScope(s); }}
          />
          {isUserScope && accounts.some((a) => a.type === "war") && (
            <p className="text-xs text-muted-foreground mt-2">
              War accounts are excluded from the Overall score.
            </p>
          )}
        </div>
      )}

      {/* Empty / not enough data */}
      {(!hasScore || !hasMinimumData) ? (
        <ScoreEmptyState metadata={score?.metadata} />
      ) : (
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <ScorePanel
            score={score}
            previousScore={previousScore}
            onRecalculate={onRecalculate}
            isRecalculating={isRecalculating}
          />
          <ScoreDetail score={score} history={history} />
        </div>
      )}
    </motion.div>
  );
};
