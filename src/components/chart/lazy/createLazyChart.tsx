import { memo, type ComponentType, lazy, Suspense } from "react";

import { ChartSkeleton, type ChartSkeletonProps } from "../shared/ChartSkeleton";

export interface CreateLazyChartOptions {
  defaultHeight?: number | string;
  variant?: ChartSkeletonProps["variant"];
}

/**
 * Creates a code-split, lazy-loaded Recharts component with Suspense and variant-aware ChartSkeleton fallback
 */
export function createLazyChart<P extends { height?: number | string; className?: string }>(
  loadComponent: () => Promise<{ default: ComponentType<P> }>,
  options: CreateLazyChartOptions = {},
) {
  const LazyComponent = lazy(loadComponent);
  const { defaultHeight = 300, variant = "trend" } = options;

  return memo(function LazyChartWrapper(props: P) {
    const height = props.height ?? defaultHeight;

    return (
      <Suspense
        fallback={<ChartSkeleton height={height} variant={variant} className={props.className} />}
      >
        <LazyComponent {...props} />
      </Suspense>
    );
  });
}
