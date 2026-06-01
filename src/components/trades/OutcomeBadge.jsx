import { cn } from "@/lib/utils";

const CONFIG = {
  win:       { label: "WIN",  cls: "bg-[var(--profit)]/10    text-[var(--profit)]    border-[var(--profit)]/30"    },
  loss:      { label: "LOSS", cls: "bg-[var(--loss)]/10      text-[var(--loss)]      border-[var(--loss)]/30"      },
  breakeven: { label: "EVEN", cls: "bg-[hsl(var(--breakeven)/0.1)] text-[var(--breakeven)] border-[hsl(var(--breakeven)/0.3)]" },
};

export const OutcomeBadge = ({ outcome }) => {
  if (!outcome) return null;
  const { label, cls } = CONFIG[outcome] ?? CONFIG.loss;
  return (
    <span className={cn(
      "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border uppercase tracking-wide",
      cls
    )}>
      {label}
    </span>
  );
};
