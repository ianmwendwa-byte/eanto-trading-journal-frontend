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

  const { data: accountsData } = useAccounts({ limit: 50 });
  const accounts = accountsData?.accounts ?? [];

  // Always call all hooks (React rules of hooks)
  const userScoreQuery    = useUserScore();
  const userHistoryQuery  = useUserScoreHistory(12);
  const recalcUser        = useRecalculateScore();

  const accountScoreQuery   = useAccountScore(isUserScope ? null : scope);
  const accountHistoryQuery = useAccountScoreHistory(isUserScope ? null : scope);
  const recalcAccount       = useRecalculateAccountScore(isUserScope ? null : scope);

  if (!betaEnabled) return <ScoreTeaser />;

  const { data: score, isLoading, isError, error, refetch } =
    isUserScope ? userScoreQuery : accountScoreQuery;

  const { data: history } =
    isUserScope ? userHistoryQuery : accountHistoryQuery;

  const onRecalculate   = isUserScope ? () => recalcUser.mutate()   : () => recalcAccount.mutate();
  const isRecalculating = isUserScope ? recalcUser.isPending         : recalcAccount.isPending;

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
      className="p-4 md:p-6 space-y-6"
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">Business Score</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your trading business health — 0 to 100
          </p>
        </div>

        {accounts.length > 0 && (
          <div className="flex flex-col items-end gap-1">
            <ScoreScopeSelector
              accounts={accounts}
              scope={scope}
              onScopeChange={setScope}
            />
            {isUserScope && accounts.some((a) => a.type === "war") && (
              <p className="text-[10px] text-muted-foreground">
                War accounts excluded from Overall
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      {(!hasScore || !hasMinimumData) ? (
        <ScoreEmptyState metadata={score?.metadata} />
      ) : (
        <>
          <ScorePanel
            score={score}
            previousScore={previousScore}
            onRecalculate={onRecalculate}
            isRecalculating={isRecalculating}
          />
          <ScoreDetail score={score} history={history} />
        </>
      )}
    </motion.div>
  );
};
