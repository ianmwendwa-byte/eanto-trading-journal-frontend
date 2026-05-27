import { Skeleton } from "@/components/ui/skeleton";

const SkeletonCard = ({ className }) => (
  <div className={`trading-card p-4 ${className ?? ""}`}>
    <Skeleton className="h-3 w-24 mb-3" />
    <Skeleton className="h-7 w-32 mb-1" />
    <Skeleton className="h-3 w-20" />
  </div>
);

export const DashboardSkeleton = () => (
  <div className="p-6 space-y-6">
    {/* Row 1: 4 stat cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>

    {/* Row 2: balance chart + account list */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 trading-card p-4">
        <Skeleton className="h-3 w-28 mb-4" />
        <Skeleton className="h-56 w-full rounded-lg" />
      </div>
      <div className="trading-card p-4 space-y-3">
        <Skeleton className="h-3 w-24 mb-2" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-1 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>

    {/* Row 3: donut + bar + activity */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="trading-card p-4">
        <Skeleton className="h-3 w-24 mb-4" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
      <div className="trading-card p-4">
        <Skeleton className="h-3 w-24 mb-4" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
      <div className="trading-card p-4 space-y-3">
        <Skeleton className="h-3 w-28 mb-2" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-7 w-7 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2.5 w-16" />
            </div>
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
