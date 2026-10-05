import { memo, useMemo } from "react";

import { cn } from "@/lib/utils";

import type { StatsGridProps } from "./types";

import { StatCard } from "../stat-card/StatCard";
import { COLUMN_MAP } from "./constants";
import { StatsGridContext } from "./StatsGridContext";

export const StatsGrid = memo(function StatsGrid({
  children,
  columns = 4,
  density = "compact",
  sparklineLayout = "inline",
  isLoading = false,
  skeletonCount,
  className,
}: StatsGridProps) {
  const count = skeletonCount ?? columns;
  const contextValue = useMemo(() => ({ density, sparklineLayout }), [density, sparklineLayout]);

  return (
    <StatsGridContext value={contextValue}>
      <div className={cn("grid gap-4", COLUMN_MAP[columns], className)}>
        {isLoading
          ? Array.from({ length: count }).map((_, idx) => (
              <StatCard key={`skeleton-card-${idx}`} title="" value="" isLoading />
            ))
          : children}
      </div>
    </StatsGridContext>
  );
});
