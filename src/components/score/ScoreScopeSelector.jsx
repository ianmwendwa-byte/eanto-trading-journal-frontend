import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_STYLES = {
  normal: "text-[var(--profit)]",
  prop:   "text-blue-400",
  war:    "text-[var(--loss)]",
};

export const ScoreScopeSelector = ({ accounts, scope, onScopeChange }) => (
  <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
    {/* Overall — aggregate of all non-war accounts */}
    <button
      onClick={() => onScopeChange("user")}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0",
        scope === "user"
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      )}
    >
      <Globe className="h-3.5 w-3.5" />
      Overall
    </button>

    {accounts.map((account) => (
      <button
        key={account._id}
        onClick={() => onScopeChange(account._id)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0",
          scope === account._id
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        )}
      >
        <span>{account.name}</span>
        <span className={cn(
          "text-[10px] font-semibold uppercase tracking-wide",
          scope === account._id
            ? "opacity-70"
            : TYPE_STYLES[account.type] ?? "text-muted-foreground"
        )}>
          {account.type}
        </span>
      </button>
    ))}
  </div>
);
