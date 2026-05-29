import { cn } from "@/lib/utils";

const CONFIG = {
  win:       { label: "WIN",  cls: "bg-[hsl(var(--profit)/0.1)]    text-[hsl(var(--profit))]    border-[hsl(var(--profit)/0.3)]"    },
  loss:      { label: "LOSS", cls: "bg-[hsl(var(--loss)/0.1)]      text-[hsl(var(--loss))]      border-[hsl(var(--loss)/0.3)]"      },
  breakeven: { label: "EVEN", cls: "bg-[hsl(var(--breakeven)/0.1)] text-[hsl(var(--breakeven))] border-[hsl(var(--breakeven)/0.3)]" },
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
