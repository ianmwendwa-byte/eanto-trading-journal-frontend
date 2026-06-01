import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import { WidgetSkeleton } from "@/components/dashboard/WidgetSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

export const PropChallengesWidget = ({ data, isLoading }) => {
  if (isLoading) return <WidgetSkeleton size="medium" />;

  if (!data || data.accountCount === 0) {
    return (
      <div className="trading-card p-4 h-full">
        <div className="flex items-center gap-1.5 mb-3">
          <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            Prop Challenges
          </p>
        </div>
        <EmptyState
          icon={Trophy}
          title="No prop accounts"
          description="Add a Prop account to track your challenges"
        />
      </div>
    );
  }

  return (
    <div className="trading-card p-4 h-full flex flex-col">
      <div className="flex items-center gap-1.5 mb-3">
        <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
          Prop Challenges
        </p>
      </div>

      <div className="flex items-center gap-6 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold font-mono text-primary">{data.activeCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Active</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold font-mono text-[var(--profit)]">{data.passedCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Passed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold font-mono text-[var(--loss)]">{data.failedCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Failed</p>
        </div>
      </div>

      <Link
        to="/accounts?type=prop"
        className="text-xs text-primary hover:underline mt-auto block text-right"
      >
        View prop accounts →
      </Link>
    </div>
  );
};
