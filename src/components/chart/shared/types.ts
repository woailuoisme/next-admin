export interface ChartReferenceLine {
  y?: number;
  x?: string | number;
  label?: string;
  stroke?: string;
  strokeDasharray?: string;
  strokeWidth?: number;
  position?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "insideTopRight"
    | "insideTopLeft"
    | "insideBottomRight"
    | "insideBottomLeft"
    | "middle"
    | "end";
}

export interface ChartBrushConfig {
  dataKey?: string;
  height?: number;
  stroke?: string;
  fill?: string;
  startIndex?: number;
  endIndex?: number;
}
