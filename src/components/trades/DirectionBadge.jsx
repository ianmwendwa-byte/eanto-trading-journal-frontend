import { cn } from "@/lib/utils";

const CONFIG = {
  buy:  { label: "▲ BUY",  cls: "bg-[var(--profit)]/10 text-[var(--profit)] border-[var(--profit)]/30" },
  sell: { label: "▼ SELL", cls: "bg-[var(--loss)]/10   text-[var(--loss)]   border-[var(--loss)]/30"   },
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
