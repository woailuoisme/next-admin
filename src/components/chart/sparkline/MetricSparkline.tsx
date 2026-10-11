import { memo, useId } from "react";

import { cn } from "@/lib/utils";

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
  const gradId = useId();
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
      ? "var(--chart-1)"
      : trend === "down"
        ? "var(--destructive)"
        : "var(--muted-foreground)"
    : color || "var(--primary)";

  const defaultLabel = `走势微图: 起始 ${first}, 当前 ${last}, 趋势 ${trend === "up" ? "上升" : trend === "down" ? "下降" : "平稳"}`;

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
        <defs>
          {fill && (
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeColor} stopOpacity={0.25} />
              <stop offset="100%" stopColor={activeColor} stopOpacity={0.0} />
            </linearGradient>
          )}
        </defs>

        {/* Fill area */}
        {fill && areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}

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
            fill="var(--chart-1)"
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
