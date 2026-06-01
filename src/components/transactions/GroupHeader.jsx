import { cn } from "@/lib/utils";
import { AccountTypeBadge } from "@/components/accounts/AccountTypeBadge";
import { TRANSACTION_ICONS, TRANSACTION_LABELS } from "@/constants/transactionTypes";
import { formatCurrency } from "@/utils/format";

export const GroupHeader = ({ group, groupBy }) => {
  const { label, items = [], total } = group;

  const signedColor =
    total > 0
      ? "text-[var(--profit)]"
      : total < 0
      ? "text-[var(--loss)]"
      : "text-muted-foreground";

  const totalLabel = total !== undefined
    ? `${total > 0 ? "+" : ""}${formatCurrency(Math.abs(total))}`
    : null;

  const renderLeft = () => {
    if (groupBy === "type") {
      const type = group.key;
      const Icon = TRANSACTION_ICONS[type];
      return (
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          <span>{TRANSACTION_LABELS[type] ?? label}</span>
        </div>
      );
    }
    if (groupBy === "account") {
      const accountType = items[0]?.accountId?.type;
      return (
        <div className="flex items-center gap-1.5">
          {accountType && <AccountTypeBadge type={accountType} />}
          <span>{label}</span>
        </div>
      );
    }
    return <span>{label}</span>;
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
          {renderLeft()}
        </span>
        <span className="text-[10px] text-muted-foreground/60">
          {items.length} transaction{items.length !== 1 ? "s" : ""}
        </span>
      </div>
      {totalLabel && (
        <span className={cn("text-xs font-mono font-semibold", signedColor)}>
          {totalLabel}
        </span>
      )}
    </div>
  );
};
