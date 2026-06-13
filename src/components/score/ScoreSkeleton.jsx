import { Skeleton } from "@/components/ui/skeleton";

export const ScoreSkeleton = () => (
  <div className="p-4 md:p-6 space-y-6">
    {/* Header */}
    <div className="flex items-start justify-between gap-4">
      <div>
        <Skeleton className="h-7 w-44 mb-2" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>

    {/* Hero card */}
    <div className="trading-card p-6 md:p-8">
      <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-10">
        <Skeleton className="w-[200px] h-[200px] rounded-full flex-shrink-0" />
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-end gap-3">
            <Skeleton className="h-14 w-24" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-px w-full" />
          <div className="flex gap-5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>
    </div>

    {/* Pillar breakdown card */}
    <div className="trading-card p-6 space-y-5">
      <Skeleton className="h-6 w-40" />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
        <Skeleton className="w-full lg:w-[220px] h-[220px] rounded-xl flex-shrink-0 self-center" />
      </div>
    </div>

    {/* History + Insights */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="trading-card p-6 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="w-9 h-9 rounded-lg flex-shrink-0" />
          ))}
        </div>
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-12" />
          ))}
        </div>
      </div>
      <div className="trading-card p-6 space-y-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3 w-44" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-16 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);
