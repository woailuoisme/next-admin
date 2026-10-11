import { memo, useId } from "react";

import { cn } from "@/lib/utils";

import type { SparklineProps } from "./types";

import { getStatTheme } from "../shared/theme";
import { useSparklinePath } from "./useSparklinePath";

const DEFAULT_COLOR = "var(--primary)";

export const MiniSparkline = memo(function MiniSparkline({
  data,
  theme,
  color,
  gradientId: customGradientId,
  type = "area",
  width = 100,
  height = 32,
  strokeWidth = 2,
  className,
}: SparklineProps) {
  const rawId = useId();
  const generatedId = `spark-grad-${rawId.replace(/:/g, "")}`;
  const gradientId = customGradientId || generatedId;

  const resolvedColor = color ?? (theme ? getStatTheme(theme).strokeColor : DEFAULT_COLOR);

  const { isEmpty, linePath, areaPath, bars } = useSparklinePath({
    data,
    type,
    width,
    height,
  });

  if (isEmpty) {
    return null;
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      height={height}
      style={height && !className?.includes("h-") ? { height: `${height}px` } : undefined}
      className={cn("w-full overflow-visible", className)}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {type === "bar" ? (
        bars.map((bar) => (
          <rect
            key={bar.key}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            rx={1.5}
            fill={resolvedColor}
            opacity={bar.opacity}
          />
        ))
      ) : (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={resolvedColor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={resolvedColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path
            d={linePath}
            fill="none"
            stroke={resolvedColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
});

export const Sparkline = MiniSparkline;
