import { TrendingUp, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const ScoreEmptyState = ({ metadata }) => {
  const tradesCount = metadata?.tradesAnalyzed ?? 0;

  const checks = [
    {
      icon: TrendingUp,
      label: "Add at least 10 trades",
      sub: `You have ${tradesCount} trade${tradesCount !== 1 ? "s" : ""}`,
      done: tradesCount >= 10,
    },
    {
      icon: Calendar,
      label: "Trade across 3+ different days",
      sub: "Consistent trading days improve reliability",
      done: false,
      pending: false,
    },
    {
      icon: Clock,
      label: "Wait for weekly calculation",
      sub: "Scores are calculated weekly every Friday",
      done: false,
      pending: true,
    },
  ];

  const completed = checks.filter((c) => c.done).length;
  const progress  = (completed / checks.length) * 100;

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h2 className="font-heading font-bold text-xl text-foreground mb-2">
          Your Score Is Being Prepared
        </h2>
        <p className="text-sm text-muted-foreground">
          Complete the following to unlock your Business Score:
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {checks.map(({ icon: Icon, label, sub, done, pending }) => (
          <div
            key={label}
            className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border"
          >
            <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </div>
            <div className="shrink-0 mt-0.5">
              {done ? (
                <CheckCircle2 className="h-4 w-4 text-[var(--profit)]" />
              ) : pending ? (
                <Clock className="h-4 w-4 text-[var(--warning)]" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 mb-6">
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">
            {completed} of {checks.length} requirements met
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="p-3 rounded-lg bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Once all requirements are met, your first Business Score will appear
          after the next weekly calculation.
        </p>
      </div>
    </div>
  );
};
