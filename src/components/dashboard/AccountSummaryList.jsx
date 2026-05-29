import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getPnLColor } from "@/utils/format";
import { cn } from "@/lib/utils";

const TYPE_LABELS = { normal: "Normal", prop: "Prop", war: "War" };

const AccountRow = ({ account }) => {
  const pnl = (account.currentBalance) - (account.startingBalance);
  console.log(account);

  return (
    <Link to={`/accounts/${account._id}`}>
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
        <div
          className="w-1 h-9 rounded-full flex-shrink-0"
          style={{ backgroundColor: account.color ?? "#173ded" }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-foreground group-hover:text-foreground">
            {account.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {TYPE_LABELS[account.type] ?? account.type}
            </Badge>
            {account.status && account.status !== "active" && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 capitalize">
                {account.status}
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-mono font-medium text-foreground">
            {formatCurrency(account.currentBalance ?? account.startingBalance ?? 0)}
          </p>
          <p className={cn("text-[11px] font-mono", getPnLColor(pnl))}>
            {pnl >= 0 ? "+" : ""}
            {formatCurrency(pnl)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export const AccountSummaryList = ({ accounts, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-9 w-1 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="text-right space-y-1.5">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const nonWarAccounts = (accounts ?? []).filter((a) => a.type !== "war");
  const warAccounts = (accounts ?? []).filter((a) => a.type === "war");

  if (!nonWarAccounts.length && !warAccounts.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No accounts yet
      </p>
    );
  }

  return (
    <div className="space-y-0.5 overflow-y-auto max-h-64">
      {nonWarAccounts.map((a) => (
        <AccountRow key={a._id} account={a} />
      ))}
      {warAccounts.length > 0 && (
        <>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 pt-3 pb-1">
            War Accounts
          </p>
          {warAccounts.map((a) => (
            <AccountRow key={a._id} account={a} />
          ))}
        </>
      )}
    </div>
  );
};
