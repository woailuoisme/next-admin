"use client";

import { useTranslations } from "next-intl";
import { memo, useId } from "react";

import { SPARKLINE_TREND_KEYS, SparklineAreaFill } from "@/components/shared/sparkline/SparklineAreaFill";
import { cn } from "cn";

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
  ariaLabel,
  decorative = true,
}: SparklineProps) {
  const t = useTranslations("chart");
  const rawId = useId();
  const generatedId = `spark-grad-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const gradientId = (customGradientId || generatedId).replace(/[^a-zA-Z0-9_-]/g, "");

  const resolvedColor = color ?? (theme ? getStatTheme(theme).strokeColor : DEFAULT_COLOR);

  const { isEmpty, first, last, trend, linePath, areaPath, bars } = useSparklinePath({
    data,
    type,
    width,
    height,
  });

  if (isEmpty) {
    return null;
  }

  const isAccessible = Boolean(ariaLabel) || decorative === false;
  const computedAriaLabel = isAccessible
    ? ariaLabel ||
      t("sparkline_aria_label", {
        first,
        last,
        trend: t(SPARKLINE_TREND_KEYS[trend]),
      })
    : undefined;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      height={height}
      className={cn("w-full overflow-visible", className)}
      preserveAspectRatio="none"
      role={isAccessible ? "img" : undefined}
      aria-label={computedAriaLabel}
      aria-hidden={isAccessible ? undefined : true}
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
          <SparklineAreaFill gradientId={gradientId} areaPath={areaPath} color={resolvedColor} stopOpacity={0.35} />
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
