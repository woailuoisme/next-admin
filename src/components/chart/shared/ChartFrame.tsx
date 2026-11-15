"use client";

import { type CSSProperties, memo, type ReactElement } from "react";

import { ResponsiveContainer } from "recharts";

import type { ChartHeight } from "./types";

import { DEFAULT_INITIAL_CHART_WIDTH } from "./constants";
import { useChartHeight } from "./ChartContext";
import { resolveNumericChartHeight } from "./formatters";

export interface ChartFrameProps {
  height?: ChartHeight;
  className?: string;
  /** 外层容器样式，默认撑满父级；方形图表可传固定宽高 */
  style?: CSSProperties;
  /** 首帧占位宽度，避免测量前 0 宽闪烁 */
  initialWidth?: number;
  ariaLabel?: string;
  children: ReactElement;
}

/**
 * Recharts 响应式容器外壳：集中 minWidth / minHeight / initialDimension 配置
 * Memoized wrapper conforming to Vercel React Best Practices (rerender-memo)
 */
export const ChartFrame = memo(function ChartFrame({
  height,
  className,
  style,
  initialWidth = DEFAULT_INITIAL_CHART_WIDTH,
  ariaLabel,
  children,
}: ChartFrameProps) {
  const resolvedHeight = useChartHeight(height, 300);
  const numericHeight = resolveNumericChartHeight(resolvedHeight, 300);
  const isPixelHeight = typeof resolvedHeight === "number" || /^\d+(?:\.\d+)?px$/i.test(resolvedHeight.trim());

  return (
    <div
      className={className}
      style={{ width: "100%", height: resolvedHeight, ...style }}
      {...(ariaLabel ? { role: "img", "aria-label": ariaLabel } : {})}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={isPixelHeight ? numericHeight : undefined}
        initialDimension={{ width: initialWidth, height: numericHeight }}
      >
        {children}
      </ResponsiveContainer>
    </div>
  );
});
