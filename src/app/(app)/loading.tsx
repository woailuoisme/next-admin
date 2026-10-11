import { Skeleton } from "@/components/ui/skeleton";

const STAT_SKELETON_KEYS = [1, 2, 3, 4] as const;
const TABLE_ROW_SKELETON_KEYS = [1, 2, 3, 4, 5, 6] as const;

export default function DashboardLoading() {
  return (
    <div role="status" aria-label="正在加载页面内容" className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Header bar skeleton */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Metric/stat cards skeleton grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_SKELETON_KEYS.map((key) => (
          <div
            key={key}
            className="border-border bg-card flex flex-col gap-3 rounded-xl border p-6 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="size-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      {/* Main content / table / chart card skeleton */}
      <div className="border-border bg-card flex flex-1 flex-col gap-4 rounded-xl border p-6 shadow-xs">
        <div className="flex items-center justify-between pb-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          {TABLE_ROW_SKELETON_KEYS.map((key) => (
            <Skeleton key={key} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
