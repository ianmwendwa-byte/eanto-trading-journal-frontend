import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const WidgetSkeleton = ({ size = "medium", className }) => {
  if (size === "small") {
    return (
      <div className={cn("trading-card p-4 space-y-2", className)}>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-24 mt-1" />
        <Skeleton className="h-3 w-16" />
      </div>
    );
  }

  if (size === "large") {
    return (
      <div className={cn("trading-card p-4", className)}>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-6 w-48 rounded-full" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  // medium
  return (
    <div className={cn("trading-card p-4 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-3 rounded-full" />
      </div>
      <Skeleton className="h-8 w-32" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
};
