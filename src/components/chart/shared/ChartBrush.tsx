import { Brush } from "recharts";

import type { ChartBrushConfig } from "./types";

import { DEFAULT_BRUSH_FILL, DEFAULT_BRUSH_HEIGHT, DEFAULT_BRUSH_STROKE } from "./constants";

export interface ChartBrushProps {
  /** 布尔开关或细粒度配置对象 */
  showBrush?: boolean | ChartBrushConfig;
  /** 刷选框绑定的 X 轴字段，未显式配置 dataKey 时回退使用 */
  xAxisKey: string;
  /** 刻度文案格式化器，与 X 轴保持一致 */
  tickFormatter?: (value: string | number) => string;
}

/**
 * 趋势图底部的时间轴缩放刷选框
 * 统一收敛 boolean / 对象两种配置形态与默认样式
 */
export function ChartBrush({ showBrush, xAxisKey, tickFormatter }: ChartBrushProps) {
  if (!showBrush) {
    return null;
  }

  const config = typeof showBrush === "object" ? showBrush : undefined;

  return (
    <Brush
      dataKey={config?.dataKey ?? xAxisKey}
      height={config?.height ?? DEFAULT_BRUSH_HEIGHT}
      stroke={config?.stroke ?? DEFAULT_BRUSH_STROKE}
      startIndex={config?.startIndex}
      endIndex={config?.endIndex}
      fill={config?.fill ?? DEFAULT_BRUSH_FILL}
      tickFormatter={tickFormatter}
    />
  );
}
