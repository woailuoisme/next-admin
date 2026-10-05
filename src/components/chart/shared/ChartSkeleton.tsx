import { memo } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface ChartSkeletonProps {
  height?: number | string;
  className?: string;
  variant?: "trend" | "bar" | "donut" | "gauge" | "radar" | "default";
}

const BAR_HEIGHT_PERCENTAGES = [45, 75, 55, 90, 60, 80, 50];

export const ChartSkeleton = memo(function ChartSkeleton({
  height = 240,
  className,
  variant = "trend",
}: ChartSkeletonProps) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-border/30 bg-card/40 p-3",
        className,
      )}
      style={{ height }}
      data-testid="chart-skeleton"
      data-variant={variant}
    >
      {variant === "bar" && (
        <div className="flex h-full w-full flex-col justify-end pb-2">
          <div className="flex flex-1 items-end justify-between gap-3 px-4 pb-3">
            {BAR_HEIGHT_PERCENTAGES.map((pct, i) => (
              <div
                key={`bar-${pct}-${i}`}
                className="flex h-full flex-1 flex-col items-center justify-end"
              >
                <Skeleton
                  className="w-full rounded-t-sm transition-all duration-300"
                  style={{ height: `${pct}%` }}
                />
              </div>
            ))}
          </div>
          <div className="bg-border/40 h-0.5 w-full" />
          <div className="flex justify-between px-4 pt-2">
            {BAR_HEIGHT_PERCENTAGES.map((pct, i) => (
              <Skeleton key={`bar-tick-${pct}-${i}`} className="h-2.5 w-7 rounded-xs" />
            ))}
          </div>
        </div>
      )}

      {variant === "donut" && (
        <div className="relative flex flex-col items-center justify-center">
          <div className="border-muted/60 border-t-muted flex h-32 w-32 animate-pulse items-center justify-center rounded-full border-12">
            <div className="flex flex-col items-center space-y-1.5">
              <Skeleton className="h-2.5 w-10 rounded-xs" />
              <Skeleton className="h-4 w-14 rounded-xs" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <Skeleton className="h-3 w-16 rounded-xs" />
            <Skeleton className="h-3 w-16 rounded-xs" />
            <Skeleton className="h-3 w-16 rounded-xs" />
          </div>
        </div>
      )}

      {variant === "gauge" && (
        <div className="relative flex flex-col items-center justify-center">
          <div className="border-muted/60 flex h-24 w-36 animate-pulse items-end justify-center rounded-t-full border-12 border-b-0 pb-2">
            <div className="flex flex-col items-center space-y-1">
              <Skeleton className="h-4 w-12 rounded-xs" />
              <Skeleton className="h-2.5 w-8 rounded-xs" />
            </div>
          </div>
        </div>
      )}

      {(variant === "trend" || variant === "radar" || variant === "default") && (
        <div className="flex h-full w-full flex-col justify-between px-3 py-2">
          <div className="flex flex-1 flex-col justify-around space-y-4">
            <div className="border-border/40 bg-border/30 h-px w-full border-t border-dashed" />
            <div className="border-border/40 bg-border/30 h-px w-full border-t border-dashed" />
            <div className="border-border/40 bg-border/30 h-px w-full border-t border-dashed" />
            <div className="border-border/40 bg-border/30 h-px w-full border-t border-dashed" />
          </div>
          <div className="relative -mt-16 flex w-full items-center justify-center opacity-40">
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
          <div className="flex justify-between pt-3">
            <Skeleton className="h-2 w-10" />
            <Skeleton className="h-2 w-10" />
            <Skeleton className="h-2 w-10" />
            <Skeleton className="h-2 w-10" />
            <Skeleton className="h-2 w-10" />
          </div>
        </div>
      )}
    </div>
  );
});
