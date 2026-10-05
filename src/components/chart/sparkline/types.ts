export type MetricSparklinePoint = number | { value: number; [key: string]: unknown };

export interface MetricSparklineProps {
  data: MetricSparklinePoint[];
  width?: number | string;
  height?: number;
  color?: string;
  trendColor?: boolean; // If true, auto green/red based on trend
  curve?: "linear" | "monotone";
  fill?: boolean;
  strokeWidth?: number;
  showEndpointDot?: boolean;
  showMinMaxDots?: boolean;
  className?: string;
  ariaLabel?: string;
}
