"use client";

import { useMemo } from "react";

import { computeSparklineGeometry } from "@/components/shared/sparkline/sparklineEngine";

import type { MetricSparklinePoint } from "./types";

interface UseMetricSparklineOptions {
  data: MetricSparklinePoint[];
  curve?: "linear" | "monotone";
  viewBoxWidth?: number;
  viewBoxHeight?: number;
  padding?: number;
}

export function useMetricSparkline({
  data,
  curve = "monotone",
  viewBoxWidth = 100,
  viewBoxHeight = 32,
  padding = 3,
}: UseMetricSparklineOptions) {
  return useMemo(() => {
    const geometry = computeSparklineGeometry({
      data,
      variant: "area",
      curve,
      width: viewBoxWidth,
      height: viewBoxHeight,
      padding,
    });

    return {
      linePath: geometry.linePath,
      areaPath: geometry.areaPath,
      first: geometry.first,
      last: geometry.last,
      trend: geometry.trend,
      minPoint: geometry.minPoint,
      maxPoint: geometry.maxPoint,
      lastPoint: geometry.lastPoint,
    };
  }, [data, curve, viewBoxWidth, viewBoxHeight, padding]);
}
