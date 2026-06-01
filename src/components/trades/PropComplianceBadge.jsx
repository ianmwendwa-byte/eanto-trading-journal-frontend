import { cn } from "@/lib/utils";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

export const PropComplianceBadge = ({ propCompliance, large = false }) => {
  if (!propCompliance?.checked) return null;

  const violations = propCompliance.violations ?? [];
  const isCompliant = violations.length === 0;

  const badge = (
    <span className={cn(
      "inline-flex items-center gap-1 rounded border font-medium whitespace-nowrap cursor-default",
      large ? "px-2 py-1 text-xs" : "px-1.5 py-0.5 text-[10px]",
      isCompliant
        ? "bg-[var(--profit)]/10 text-[var(--profit)] border-[var(--profit)]/30"
        : "bg-[var(--loss)]/10 text-[var(--loss)] border-[var(--loss)]/30"
    )}>
      {isCompliant
        ? "✓ Compliant"
        : `⚠ ${violations.length} violation${violations.length === 1 ? "" : "s"}`}
    </span>
  );

  if (isCompliant) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="bg-card border-border max-w-xs space-y-1 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
            Compliance Violations
          </p>
          {violations.map((v, i) => (
            <p key={i} className="text-xs text-[var(--loss)] leading-snug">{v}</p>
          ))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
