export interface DonutSliceData {
  name: string;
  value: number;
  color?: string;
}

export interface EnrichedDonutSliceData extends DonutSliceData {
  fill: string;
  percentage: number;
}

export interface DonutDistributionChartProps {
  data: DonutSliceData[];
  centerLabel?: string;
  centerValue?: string;
  valueFormatter?: (val: number) => string;
  innerRadius?: number;
  outerRadius?: number;
  height?: number;
  showLegend?: boolean;
  className?: string;
}
