import { memo, type ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { SparklineLayout, StatDensity } from "../shared/types";

import { useStatsGridContext } from "../grid/StatsGridContext";
import { DENSITY_STYLES } from "./types";

export type StatSkeletonVariant = "default" | "progress" | "live" | "multi-metric";

/** progress / live / multi-metric 三种变体共用一个卡片外壳，仅内部骨架不同 */
const VARIANT_CONTENT: Record<Exclude<StatSkeletonVariant, "default">, ReactNode> = {
  progress: (
    <>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="mt-2 h-2.5 w-full rounded-full" />
    </>
  ),
  live: (
    <>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="mt-2 h-7 w-full" />
    </>
  ),
  "multi-metric": (
    <>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    </>
  ),
};

export interface StatCardSkeletonProps {
  variant?: StatSkeletonVariant;
  density?: StatDensity;
  sparklineLayout?: SparklineLayout;
  hasSparkline?: boolean;
  className?: string;
}

export const StatCardSkeleton = memo(function StatCardSkeleton({
  variant = "default",
  density,
  sparklineLayout,
  hasSparkline = false,
  className,
}: StatCardSkeletonProps) {
  const gridContext = useStatsGridContext();
  const resolvedDensity = density ?? gridContext.density ?? "compact";
  const resolvedSparklineLayout = sparklineLayout ?? gridContext.sparklineLayout ?? "inline";
  const dStyles = DENSITY_STYLES[resolvedDensity];

  if (variant !== "default") {
    return (
      <Card className={cn("overflow-hidden border border-border/60", className)}>
        <CardContent className="flex flex-col justify-between space-y-4 p-5">{VARIANT_CONTENT[variant]}</CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      size={resolvedDensity === "compact" ? "sm" : "default"}
      data-density={resolvedDensity}
      data-sparkline-layout={resolvedSparklineLayout}
      className={cn("gap-0 overflow-hidden border border-border/60 py-0", className)}
    >
      <CardContent className={cn("flex flex-col justify-between", dStyles.cardPadding, dStyles.headerGap)}>
        <div className="flex items-center justify-between">
          <Skeleton className={cn(resolvedDensity === "compact" ? "h-3.5 w-20" : "h-4 w-24")} />
          <Skeleton className={cn(resolvedDensity === "compact" ? "h-6 w-6 rounded-md" : "h-8 w-8 rounded-lg")} />
        </div>
        <div className={cn(resolvedDensity === "compact" ? "space-y-1" : "space-y-2")}>
          <Skeleton className={cn(resolvedDensity === "compact" ? "h-6 w-28" : "h-7 w-32")} />
          <Skeleton className="h-3.5 w-16" />
        </div>
        {hasSparkline ? (
          <Skeleton className={cn("mt-1.5 w-full", resolvedDensity === "compact" ? "h-6" : "h-8")} />
        ) : null}
      </CardContent>
    </Card>
  );
});
