import { Clock, Shield, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

const getGrade = (score) => {
  if (score === 100) return { label: "A+", cls: "text-[var(--profit)] bg-[var(--profit)]/10 border-[var(--profit)]/30" };
  if (score >= 80)   return { label: "A",  cls: "text-[var(--warning)] bg-[var(--warning)]/10 border-[var(--warning)]/30" };
  if (score >= 60)   return { label: "B",  cls: "text-[var(--warning)] bg-[var(--warning)]/10 border-[var(--warning)]/30" };
  return               { label: "C",  cls: "text-[var(--loss)] bg-[var(--loss)]/10 border-[var(--loss)]/30" };
};

export const DisciplineScoreBadge = ({ discipline, compact = false }) => {
  if (!discipline) return null;

  const { score = 100, violations = {} } = discipline;
  const { label, cls } = getGrade(score);
  const hasViolations = violations.session || violations.risk || violations.rr;

  if (compact) {
    return (
      <span className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border whitespace-nowrap",
        cls
      )}>
        {label}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-mono font-bold border",
        cls
      )}>
        {label} · {score}/100
      </span>
      {hasViolations && (
        <div className="flex items-center gap-1.5">
          {violations.session && (
            <span title="Session violation" className="flex items-center gap-0.5 text-[var(--loss)] text-[10px]">
              <Clock className="h-3 w-3" /> Session
            </span>
          )}
          {violations.risk && (
            <span title="Risk violation" className="flex items-center gap-0.5 text-[var(--loss)] text-[10px]">
              <Shield className="h-3 w-3" /> Risk
            </span>
          )}
          {violations.rr && (
            <span title="RR violation" className="flex items-center gap-0.5 text-[var(--loss)] text-[10px]">
              <BarChart2 className="h-3 w-3" /> RR
            </span>
          )}
        </div>
      )}
    </div>
  );
};
