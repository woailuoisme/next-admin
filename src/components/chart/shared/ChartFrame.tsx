import type { CSSProperties, ReactElement } from "react";

import { ResponsiveContainer } from "recharts";

import { DEFAULT_INITIAL_CHART_WIDTH } from "./constants";

export interface ChartFrameProps {
  height: number;
  className?: string;
  /** 外层容器样式，默认撑满父级；方形图表可传固定宽高 */
  style?: CSSProperties;
  /** 首帧占位宽度，避免测量前 0 宽闪烁 */
  initialWidth?: number;
  children: ReactElement;
}

/**
 * Recharts 响应式容器外壳：集中 minWidth / minHeight / initialDimension 配置
 */
export function ChartFrame({
  height,
  className,
  style,
  initialWidth = DEFAULT_INITIAL_CHART_WIDTH,
  children,
}: ChartFrameProps) {
  return (
    <div className={className} style={{ width: "100%", height, ...style }}>
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={height}
        initialDimension={{ width: initialWidth, height }}
      >
        {children}
      </ResponsiveContainer>
    </div>
  );
}
