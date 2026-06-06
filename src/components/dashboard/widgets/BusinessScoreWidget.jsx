import { Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { WidgetSkeleton } from "@/components/dashboard/WidgetSkeleton";
import { cn } from "@/lib/utils";

const BAND_STYLES = {
  needs_work:  { label: "Needs Work",  color: "text-[var(--loss)]" },
  developing:  { label: "Developing",  color: "text-orange-400" },
  progressing: { label: "Progressing", color: "text-[var(--warning)]" },
  solid:       { label: "Solid",       color: "text-[var(--profit)]" },
  elite:       { label: "Elite",       color: "text-blue-400" },
};

export const BusinessScoreWidget = ({ data, isLoading }) => {
  const navigate = useNavigate();
  if (isLoading) return <WidgetSkeleton size="small" />;

  const score   = data?.userScore ?? null;
  const overall = score?.overall ?? null;
  const band    = score?.band ?? null;
  const bandInfo = BAND_STYLES[band] ?? null;

  return (
    <div
      className="trading-card p-4 h-full cursor-pointer hover:border-primary/40 transition-colors"
      onClick={() => navigate("/score")}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-medium">Business Score</p>
        </div>
        <div className="flex items-center gap-1">
          <InfoTooltip
            content="A 0-100 composite score measuring how well you run your trading business. Calculated weekly. Requires 10+ trades."
          />
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>

      {overall === null ? (
        <div className="mt-2">
          <p className="text-2xl font-bold font-mono text-muted-foreground">—</p>
          <p className="text-xs text-muted-foreground mt-1">Need 10+ trades</p>
        </div>
      ) : (
        <div className="mt-2">
          <p className="text-2xl font-bold font-mono text-foreground">
            {overall}
            <span className="text-sm text-muted-foreground">/100</span>
          </p>
          {bandInfo && (
            <p className={cn("text-xs font-medium mt-1", bandInfo.color)}>
              {bandInfo.label}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
