import { Skeleton } from "@/components/ui/skeleton";

export const TransactionRowSkeleton = () => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
    {/* Icon circle */}
    <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />

    {/* Description */}
    <div className="flex-1 min-w-0 space-y-1.5">
      <Skeleton className="h-3.5 w-28" />
      <Skeleton className="h-3 w-20" />
    </div>

    {/* Date */}
    <div className="hidden sm:block space-y-1 text-right flex-shrink-0 w-24">
      <Skeleton className="h-3.5 w-20 ml-auto" />
      <Skeleton className="h-3 w-14 ml-auto" />
    </div>

    {/* Amount */}
    <div className="text-right flex-shrink-0 w-28">
      <Skeleton className="h-4 w-20 ml-auto" />
    </div>

    {/* Balance */}
    <div className="hidden md:block text-right flex-shrink-0 w-28">
      <Skeleton className="h-4 w-20 ml-auto" />
    </div>

    {/* Actions */}
    <Skeleton className="h-7 w-7 rounded flex-shrink-0" />
  </div>
);
