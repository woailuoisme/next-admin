import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { NotificationSkeletonProps } from "./types";

export function NotificationSkeleton({ count = 4, className }: NotificationSkeletonProps) {
  return (
    <div className={cn("space-y-2.5 p-2", className)} data-testid="notification-skeletons">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="mx-1 flex items-start gap-3 rounded-xl p-3">
          <Skeleton className="size-7.5 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2.5 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
