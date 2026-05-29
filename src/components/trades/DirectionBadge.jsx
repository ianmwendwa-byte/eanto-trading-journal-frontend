import { cn } from "@/lib/utils";

const CONFIG = {
  buy:  { label: "▲ BUY",  cls: "bg-[hsl(var(--profit)/0.1)] text-[hsl(var(--profit))] border-[hsl(var(--profit)/0.3)]" },
  sell: { label: "▼ SELL", cls: "bg-[hsl(var(--loss)/0.1)]   text-[hsl(var(--loss))]   border-[hsl(var(--loss)/0.3)]"   },
};

export const DirectionBadge = ({ direction }) => {
  const cfg = CONFIG[direction?.toLowerCase()] ?? CONFIG.buy;
  return (
    <span className={cn(
      "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-semibold border whitespace-nowrap",
      cfg.cls
    )}>
      {cfg.label}
    </span>
  );
};
