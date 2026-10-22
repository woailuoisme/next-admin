import { clamp, orderBy } from "es-toolkit";
import { useMemo } from "react";

import type { RadialGaugeChartProps } from "./types";

import { useChartTheme } from "../hooks/useChartTheme";

export function useRadialGauge(props: RadialGaugeChartProps) {
  const { value, min = 0, max = 100, theme = "primary", color, height = 240, thresholds } = props;

  const { activeStroke } = useChartTheme({
    theme,
    color,
  });

  // Clamp value between min and max using es-toolkit
  const clampedValue = clamp(value, min, max);
  const percentage = max > min ? ((clampedValue - min) / (max - min)) * 100 : 0;

  // Pick color according to thresholds if provided
  const activeColor = useMemo(() => {
    if (color) return color;
    if (thresholds && thresholds.length > 0) {
      const sorted = orderBy(thresholds, [(t) => t.value], ["desc"]);
      const matched = sorted.find((t) => clampedValue >= t.value);
      if (matched) return matched.color;
    }
    return activeStroke;
  }, [color, thresholds, clampedValue, activeStroke]);

  // Geometry setup for a 240-degree open gauge arc
  const size = height;
  const isCompact = height < 150;
  // Responsive stroke width for better visual proportion and spacious inner area
  const strokeWidth = height < 150 ? 10 : height < 200 ? 12 : 14;
  // Safe radius allowing strokeWidth and 2px padding to prevent stroke clipping
  const radius = (size - strokeWidth) / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  // 240-degree gauge (leaving 120-degree opening at bottom)
  const arcRatio = 240 / 360;
  const arcLength = circumference * arcRatio;
  const strokeDashoffset = arcLength - (percentage / 100) * arcLength;

  return {
    clampedValue,
    activeColor,
    size,
    isCompact,
    strokeWidth,
    radius,
    circumference,
    arcLength,
    strokeDashoffset,
  };
}
