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

export interface ChartReferenceArea {
  y1?: number;
  y2?: number;
  x1?: string | number;
  x2?: string | number;
  label?: string;
  fill?: string;
  fillOpacity?: number;
}

export interface ChartBrushConfig {
  dataKey?: string;
  height?: number;
  stroke?: string;
  fill?: string;
  startIndex?: number;
  endIndex?: number;
}
