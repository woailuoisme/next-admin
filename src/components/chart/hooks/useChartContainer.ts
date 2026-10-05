import { useSize } from "ahooks";
import { useMemo, useRef } from "react";

import { DEFAULT_CHART_HEIGHT } from "../shared/constants";

export interface UseChartContainerOptions {
  /** Fixed or default height */
  height?: number | string;
  /** Fallback width if size observer returns 0 or undefined (e.g. JSDOM/SSR) */
  fallbackWidth?: number;
  /** Fallback height if size observer returns 0 or undefined */
  fallbackHeight?: number;
}

/**
 * High-performance container dimension hook using ahooks `useSize`
 * Solves Recharts ResponsiveContainer initial 0-width collapse and layout jitter
 */
export function useChartContainer({
  height = DEFAULT_CHART_HEIGHT,
  fallbackWidth = 500,
  fallbackHeight = typeof height === "number" ? height : DEFAULT_CHART_HEIGHT,
}: UseChartContainerOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useSize(containerRef);

  const dimensions = useMemo(() => {
    const measuredWidth = size?.width && size.width > 0 ? size.width : fallbackWidth;
    const measuredHeight =
      size?.height && size.height > 0
        ? size.height
        : typeof height === "number"
          ? height
          : fallbackHeight;

    return {
      width: measuredWidth,
      height: measuredHeight,
      isReady: Boolean(size?.width && size.width > 0),
    };
  }, [size?.width, size?.height, fallbackWidth, fallbackHeight, height]);

  return {
    containerRef,
    width: dimensions.width,
    height: dimensions.height,
    isReady: dimensions.isReady,
  };
}
