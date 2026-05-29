import { CATEGORY_CONFIG } from "@/constants/notifications";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS = {
  account_health:   "bg-amber-500/10 text-amber-400",
  prop_firm:        "bg-blue-500/10 text-blue-400",
  trading_activity: "bg-primary/10 text-primary",
  milestones:       "bg-purple-500/10 text-purple-400",
  system:           "bg-muted text-muted-foreground",
};

export const CategoryBadge = ({ category, className }) => {
  const config = CATEGORY_CONFIG[category];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-1.5 py-0.5",
        "text-[10px] font-medium leading-none",
        CATEGORY_COLORS[category],
        className
      )}
    >
      {config.label}
    </span>
  );
};
