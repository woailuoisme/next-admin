"use client";

import { useMemo } from "react";

import {
  computeSparklineGeometry,
  type SparklineBarGeometry,
  type SparklineTrend,
} from "@/components/shared/sparkline/sparklineEngine";

import type { SparklinePoint, SparklineType } from "./types";

interface UseSparklinePathOptions {
  data: readonly (number | SparklinePoint)[];
  type?: SparklineType;
  width?: number;
  height?: number;
  padding?: number;
}

export interface SparklinePathResult {
  values: number[];
  isEmpty: boolean;
  min: number;
  max: number;
  first: number;
  last: number;
  trend: SparklineTrend;
  linePath: string;
  areaPath: string;
  bars: SparklineBarGeometry[];
}

/**
 * React hook adapter computing sparkline SVG geometry for stats cards.
 */
export function useSparklinePath({
  data,
  type = "area",
  width = 100,
  height = 32,
  padding = 2,
}: UseSparklinePathOptions): SparklinePathResult {
  return useMemo(() => {
    const geometry = computeSparklineGeometry({
      data,
      variant: type,
      curve: "monotone",
      width,
      height,
      padding,
    });

    return {
      values: geometry.values,
      isEmpty: geometry.isEmpty,
      min: geometry.min,
      max: geometry.max,
      first: geometry.first,
      last: geometry.last,
      trend: geometry.trend,
      linePath: geometry.linePath,
      areaPath: geometry.areaPath,
      bars: geometry.bars,
    };
  }, [data, type, width, height, padding]);
}
