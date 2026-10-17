export type TimeRange = "7d" | "30d" | "90d" | "12m";

export type DemoState = "normal" | "loading" | "empty" | "error";

export interface TrendDataPoint {
  period: string;
  revenue: number;
  profit: number;
  cost: number;
  orders: number;
  refunds: number;
  conversionRate: number;
  [key: string]: unknown;
}

export interface ChartStateProps {
  isLoading: boolean;
  isEmpty: boolean;
  errorMessage?: string;
  onRetry: () => Promise<void> | void;
}
