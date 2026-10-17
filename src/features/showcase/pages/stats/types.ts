export type TimeRange = "7d" | "30d" | "90d" | "12m";
export type DemoState = "normal" | "loading" | "empty" | "error";

export interface RawTrendItem {
  label: string;
  value: number;
  revenue: number;
  cost: number;
  users: number;
  conversion: number;
  [key: string]: unknown;
}
