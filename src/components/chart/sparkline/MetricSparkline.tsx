"use client";

import { useTranslations } from "next-intl";

import { memo, useId } from "react";

import { SPARKLINE_TREND_KEYS, SparklineAreaFill } from "@/components/shared/sparkline/SparklineAreaFill";
import { cn } from "cn";

import type { MetricSparklineProps } from "./types";

import { useMetricSparkline } from "./useMetricSparkline";

export const MetricSparkline = memo(function MetricSparkline({
  data,
  width = 100,
  height = 32,
  color,
  trendColor = false,
  curve = "monotone",
  fill = true,
  strokeWidth = 2,
  showEndpointDot = true,
  showMinMaxDots = false,
  className,
  ariaLabel,
}: MetricSparklineProps) {
  const t = useTranslations("chart");
  const rawGradId = useId();
  const gradId = `metric-spark-${rawGradId.replace(/:/g, "")}`;
  const viewBoxWidth = 100;
  const viewBoxHeight = 32;

  const { linePath, areaPath, trend, minPoint, maxPoint, lastPoint, first, last } = useMetricSparkline({
    data,
    curve,
    viewBoxWidth,
    viewBoxHeight,
    padding: 3,
  });

  if (!linePath) {
    return (
      <div
        className={cn("inline-flex items-center justify-center text-xs text-muted-foreground", className)}
        style={{ width, height }}
      >
        -
      </div>
    );
  }

  const activeColor = trendColor
    ? trend === "up"
      ? "var(--chart-2)"
      : trend === "down"
        ? "var(--destructive)"
        : "var(--muted-foreground)"
    : color || "var(--primary)";

  const trendText = t(SPARKLINE_TREND_KEYS[trend]);

  const defaultLabel = t("sparkline_aria_label", { first, last, trend: trendText });

  return (
    <div
      className={cn("inline-flex shrink-0 items-center overflow-hidden", className)}
      style={{ width, height }}
      role="img"
      aria-label={ariaLabel || defaultLabel}
    >
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="h-full w-full overflow-visible"
        preserveAspectRatio="none"
      >
        {fill ? <SparklineAreaFill gradientId={gradId} areaPath={areaPath} color={activeColor} /> : null}

        {/* Stroke line */}
        <path
          d={linePath}
          fill="none"
          stroke={activeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Min and Max Dots */}
        {showMinMaxDots && minPoint && (
          <circle
            cx={minPoint.x}
            cy={minPoint.y}
            r={2.5}
            fill="var(--destructive)"
            stroke="var(--background)"
            strokeWidth={1}
          />
        )}
        {showMinMaxDots && maxPoint && (
          <circle
            cx={maxPoint.x}
            cy={maxPoint.y}
            r={2.5}
            fill="var(--chart-2)"
            stroke="var(--background)"
            strokeWidth={1}
          />
        )}

        {/* Endpoint dot */}
        {showEndpointDot && lastPoint && (
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={2.5}
            fill={activeColor}
            stroke="var(--background)"
            strokeWidth={1.5}
          />
        )}
      </svg>
    </div>
  );
});
