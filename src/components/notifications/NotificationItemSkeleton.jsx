import { Skeleton } from "@/components/ui/skeleton";

export const NotificationItemSkeleton = () => (
  <div className="flex items-start gap-3 p-3 rounded-lg">
    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="h-2 w-2 rounded-full mt-1.5 shrink-0" />
  </div>
);
