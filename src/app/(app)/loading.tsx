import { PageSkeletonRegion } from "@/components/shared/PageSkeletonRegion";
import { Skeleton } from "@/components/ui/skeleton";

const SUMMARY_CARD_KEYS = [1, 2, 3, 4] as const;
const CONTENT_ROW_KEYS = [1, 2, 3, 4] as const;

export default function DashboardLoading() {
  return (
    <PageSkeletonRegion>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-48 max-w-full" />
          <Skeleton className="h-3.5 w-72 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY_CARD_KEYS.map((key) => (
          <div key={key} className="border-border/60 bg-card flex flex-col gap-2.5 rounded-xl border p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="size-7 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-36 max-w-full" />
          </div>
        ))}
      </div>

      <div className="border-border/60 bg-card flex flex-1 flex-col gap-4 rounded-xl border p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <div className="space-y-3">
          {CONTENT_ROW_KEYS.map((key) => (
            <Skeleton key={key} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </PageSkeletonRegion>
  );
}
