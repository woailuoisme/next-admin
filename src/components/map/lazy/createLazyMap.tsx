import { memo, type ComponentType, lazy, Suspense } from "react";

import { MapSkeleton } from "../shared/MapSkeleton";

export interface CreateLazyMapOptions {
  defaultHeight?: number | string;
}

/**
 * Creates a code-split, lazy-loaded Map component with Suspense and MapSkeleton fallback
 */
export function createLazyMap<P extends { height?: number | string; className?: string }>(
  loadComponent: () => Promise<{ default: ComponentType<P> }>,
  options: CreateLazyMapOptions = {},
) {
  const LazyComponent = lazy(loadComponent);
  const { defaultHeight = 440 } = options;

  return memo(function LazyMapWrapper(props: P) {
    const height = props.height ?? defaultHeight;

    return (
      <Suspense fallback={<MapSkeleton height={height} className={props.className} />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  });
}
