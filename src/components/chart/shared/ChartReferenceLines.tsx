import { ReferenceLine } from "recharts";

import type { ChartReferenceLine } from "./types";

import { DEFAULT_REFERENCE_DASH, DEFAULT_REFERENCE_STROKE, DEFAULT_REFERENCE_STROKE_WIDTH } from "./constants";

export interface ChartReferenceLinesProps {
  lines?: ChartReferenceLine[];
}

/**
 * 渲染一组图表参考线（目标线 / 基准线）
 * 统一默认虚线样式、描边色与标签位置，避免各图表重复实现
 */
export function ChartReferenceLines({ lines }: ChartReferenceLinesProps) {
  if (!lines?.length) {
    return null;
  }

  return (
    <>
      {lines.map((line, idx) => (
        <ReferenceLine
          key={`ref-${idx}-${line.y ?? line.x}`}
          y={line.y}
          x={line.x}
          stroke={line.stroke ?? DEFAULT_REFERENCE_STROKE}
          strokeDasharray={line.strokeDasharray ?? DEFAULT_REFERENCE_DASH}
          strokeWidth={line.strokeWidth ?? DEFAULT_REFERENCE_STROKE_WIDTH}
          label={
            line.label
              ? {
                  value: line.label,
                  fill: line.stroke ?? DEFAULT_REFERENCE_STROKE,
                  fontSize: 11,
                  position: line.position ?? "insideTopRight",
                }
              : undefined
          }
        />
      ))}
    </>
  );
}
