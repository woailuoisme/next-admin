export interface RadarSeriesConfig {
  dataKey: string;
  name?: string;
  color?: string;
  fillOpacity?: number;
}

export interface RadarMetricChartProps {
  data: Record<string, any>[];
  series: RadarSeriesConfig[];
  maxDomain?: number;
  height?: number;
  valueFormatter?: (val: number) => string;
  showTooltip?: boolean;
  showRadiusAxis?: boolean;
  showRadiusTicks?: boolean;
  className?: string;
}
