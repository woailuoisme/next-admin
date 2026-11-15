import type { ReactNode } from "react";

import type { StatSkeletonVariant } from "../primitives/StatCardSkeleton";
import type { SparklineLayout, StatDensity } from "../shared/types";

export type StatsGridColumns = 2 | 3 | 4 | 5;

export interface StatsGridProps {
  children?: ReactNode;
  columns?: StatsGridColumns;
  density?: StatDensity;
  sparklineLayout?: SparklineLayout;
  isLoading?: boolean;
  skeletonCount?: number;
  skeletonVariant?: StatSkeletonVariant;
  hasSparkline?: boolean;
  className?: string;
}
