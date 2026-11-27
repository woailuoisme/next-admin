"use client";

import { clamp, orderBy } from "es-toolkit";

import type { RadialGaugeChartProps } from "./types";

import { useChartTheme } from "../hooks/useChartTheme";
import { useChartHeight } from "../shared/ChartContext";
import { resolveNumericChartHeight, toFiniteNumber } from "../shared/formatters";

export function useRadialGauge(props: RadialGaugeChartProps) {
  const { value, min = 0, max = 100, theme = "primary", color, height, thresholds } = props;
  const resolvedHeight = useChartHeight(height, 240);

  const { activeStroke } = useChartTheme({
    theme,
    color,
  });

  const safeMin = toFiniteNumber(min, 0);
  const safeMax = toFiniteNumber(max, 100);
  const low = Math.min(safeMin, safeMax);
  const high = Math.max(safeMin, safeMax);
  const safeValue = toFiniteNumber(value, low);

  // Clamp value between min and max using es-toolkit
  const clampedValue = clamp(safeValue, low, high);
  const percentage = high > low ? ((clampedValue - low) / (high - low)) * 100 : 0;

  // Pick color according to thresholds if provided
  let activeColor = activeStroke;
  if (color) {
    activeColor = color;
  } else if (thresholds && thresholds.length > 0) {
    const sorted = orderBy(thresholds, [(t) => t.value], ["desc"]);
    const matched = sorted.find((t) => clampedValue >= t.value);
    if (matched) activeColor = matched.color;
  }

  // Geometry setup for a 240-degree open gauge arc
  const size = Math.max(64, resolveNumericChartHeight(resolvedHeight, 240));
  const isMini = size < 110;
  const isCompact = size < 150;
  // Responsive stroke width for better visual proportion and spacious inner area
  const strokeWidth = isMini ? 8 : isCompact ? 10 : size < 200 ? 12 : 14;
  // Safe radius allowing strokeWidth and 2px padding to prevent stroke clipping
  const radius = Math.max(12, (size - strokeWidth) / 2 - 2);
  const circumference = 2 * Math.PI * radius;
  // 240-degree gauge (leaving 120-degree opening at bottom)
  const arcRatio = 240 / 360;
  const arcLength = circumference * arcRatio;
  const strokeDashoffset = arcLength - (percentage / 100) * arcLength;

  return {
    resolvedHeight,
    clampedValue,
    percentage,
    safeMin: low,
    safeMax: high,
    activeColor,
    size,
    isMini,
    isCompact,
    strokeWidth,
    radius,
    circumference,
    arcLength,
    strokeDashoffset,
  };
}
