import { Skeleton } from "@/components/ui/skeleton";

export const ScoreSkeleton = () => (
  <div className="p-4 md:p-6">
    <div className="mb-6">
      <Skeleton className="h-7 w-44 mb-2" />
      <Skeleton className="h-4 w-56" />
    </div>

    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* Left panel skeleton */}
      <div className="w-full md:w-80 flex-shrink-0 space-y-3">
        <div className="trading-card p-6 flex flex-col items-center gap-4">
          <Skeleton className="w-48 h-48 rounded-full" />
          <Skeleton className="w-full h-12 rounded-lg" />
        </div>
        <div className="trading-card p-4 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="trading-card p-4">
          <Skeleton className="w-full h-9 rounded-lg" />
        </div>
        <div className="trading-card p-4 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>

      {/* Right panel skeleton */}
      <div className="flex-1 space-y-4">
        {/* Pillar breakdown */}
        <div className="trading-card p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="flex flex-col sm:flex-row gap-6">
            <Skeleton className="w-48 h-48 rounded-full flex-shrink-0 self-center" />
            <div className="flex-1 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* History calendar */}
        <div className="trading-card p-6 space-y-3">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-1.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="w-8 h-8 rounded flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="trading-card p-6 space-y-3">
          <Skeleton className="h-6 w-36" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-20 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  </div>
);
