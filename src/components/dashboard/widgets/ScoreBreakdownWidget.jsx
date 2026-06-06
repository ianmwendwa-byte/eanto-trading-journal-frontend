import { Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { WidgetSkeleton } from "@/components/dashboard/WidgetSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

const PILLARS = [
  { key: "consistency",      label: "Consistency"      },
  { key: "riskManagement",   label: "Risk Management"  },
  { key: "profitability",    label: "Profitability"    },
  { key: "discipline",       label: "Discipline"       },
  { key: "growth",           label: "Growth"           },
];

const getPillarColor = (pct) => {
  if (pct >= 70) return "text-[var(--profit)]";
  if (pct >= 40) return "text-[var(--warning)]";
  return "text-[var(--loss)]";
};

export const ScoreBreakdownWidget = ({ data, isLoading }) => {
  const navigate = useNavigate();
  if (isLoading) return <WidgetSkeleton size="medium" />;

  const userScore = data?.userScore ?? null;
  const pillars   = userScore?.pillars ?? userScore?.breakdown ?? null;
  const hasData   = userScore?.metadata?.hasMinimumData !== false && pillars;

  return (
    <div className="trading-card p-4 h-full flex flex-col">
      <div
        className="flex items-center justify-between mb-3 cursor-pointer"
        onClick={() => navigate("/score")}
      >
        <div className="flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            Score Breakdown
          </p>
        </div>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
      </div>

      {!hasData ? (
        <EmptyState
          icon={Star}
          title="Score not available"
          description="Trade at least 10 times to unlock your Business Score breakdown"
        />
      ) : (
        <div className="flex-1 space-y-3">
          {PILLARS.map(({ key, label }) => {
            const pillar   = pillars[key];
            const score    = pillar?.score    ?? pillar ?? 0;
            const maxScore = pillar?.maxScore ?? 20;
            const pct      = maxScore > 0 ? (score / maxScore) * 100 : 0;

            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className={cn("text-xs font-mono font-medium", getPillarColor(pct))}>
                    {score}/{maxScore}
                  </span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
