import type { DemoState, RawTrendItem, TimeRange } from "./types";

export const TIME_RANGES: readonly TimeRange[] = ["7d", "30d", "90d", "12m"] as const;
export const DEMO_STATES: readonly DemoState[] = ["normal", "loading", "empty", "error"] as const;

// Mock datasets for different time ranges
export const TREND_DATA_MAP: Record<TimeRange, RawTrendItem[]> = {
  "7d": [
    {
      label: "Mon",
      value: 4200,
      revenue: 4200,
      cost: 1800,
      users: 1200,
      conversion: 3.2,
    },
    {
      label: "Tue",
      value: 5100,
      revenue: 5100,
      cost: 2100,
      users: 1450,
      conversion: 3.6,
    },
    {
      label: "Wed",
      value: 4800,
      revenue: 4800,
      cost: 1950,
      users: 1380,
      conversion: 3.4,
    },
    {
      label: "Thu",
      value: 6200,
      revenue: 6200,
      cost: 2400,
      users: 1720,
      conversion: 4.1,
    },
    {
      label: "Fri",
      value: 7400,
      revenue: 7400,
      cost: 2800,
      users: 2100,
      conversion: 4.5,
    },
    {
      label: "Sat",
      value: 8900,
      revenue: 8900,
      cost: 3100,
      users: 2450,
      conversion: 4.8,
    },
    {
      label: "Sun",
      value: 9500,
      revenue: 9500,
      cost: 3300,
      users: 2680,
      conversion: 5.2,
    },
  ],
  "30d": [
    {
      label: "Week 1",
      value: 28000,
      revenue: 28000,
      cost: 11200,
      users: 8400,
      conversion: 3.5,
    },
    {
      label: "Week 2",
      value: 34500,
      revenue: 34500,
      cost: 13400,
      users: 9800,
      conversion: 3.9,
    },
    {
      label: "Week 3",
      value: 41200,
      revenue: 41200,
      cost: 15600,
      users: 11500,
      conversion: 4.2,
    },
    {
      label: "Week 4",
      value: 49000,
      revenue: 49000,
      cost: 17800,
      users: 13400,
      conversion: 4.6,
    },
  ],
  "90d": [
    {
      label: "Month 1",
      value: 125000,
      revenue: 125000,
      cost: 48000,
      users: 38000,
      conversion: 3.8,
    },
    {
      label: "Month 2",
      value: 158000,
      revenue: 158000,
      cost: 56000,
      users: 46000,
      conversion: 4.1,
    },
    {
      label: "Month 3",
      value: 195000,
      revenue: 195000,
      cost: 65000,
      users: 58000,
      conversion: 4.5,
    },
  ],
  "12m": [
    {
      label: "Q1",
      value: 420000,
      revenue: 420000,
      cost: 160000,
      users: 120000,
      conversion: 3.9,
    },
    {
      label: "Q2",
      value: 540000,
      revenue: 540000,
      cost: 195000,
      users: 155000,
      conversion: 4.2,
    },
    {
      label: "Q3",
      value: 680000,
      revenue: 680000,
      cost: 235000,
      users: 195000,
      conversion: 4.5,
    },
    {
      label: "Q4",
      value: 850000,
      revenue: 850000,
      cost: 280000,
      users: 240000,
      conversion: 4.9,
    },
  ],
};

export const DISTRIBUTION_DATA = [
  { name: "Enterprise", value: 45000, color: "var(--primary)" },
  { name: "Professional", value: 32000, color: "var(--chart-1)" },
  { name: "Starter", value: 18000, color: "var(--chart-2)" },
  { name: "Personal", value: 8500, color: "var(--chart-3)" },
];

export const HORIZONTAL_RANKINGS = [
  { label: "API Gateway (Auth)", value: 48200, color: "var(--chart-1)" },
  { label: "Checkout Engine", value: 39400, color: "var(--chart-2)" },
  { label: "Search & Vector Index", value: 28600, color: "var(--chart-3)" },
  { label: "Analytics Pipeline", value: 19200, color: "var(--chart-4)" },
  { label: "Notification Worker", value: 12400, color: "var(--chart-5)" },
];

export const RADAR_METRICS = [
  { subject: "Reliability", score: 98, fullMark: 100 },
  { subject: "Performance", score: 92, fullMark: 100 },
  { subject: "Security", score: 96, fullMark: 100 },
  { subject: "Usability", score: 88, fullMark: 100 },
  { subject: "Scalability", score: 94, fullMark: 100 },
  { subject: "Compliance", score: 90, fullMark: 100 },
];

export const SPARKLINE_AREA_ITEMS = [
  { name: "Primary", theme: "primary", data: [12, 18, 14, 25, 22, 30, 28] },
  { name: "Chart 1", theme: "chart-1", data: [32, 28, 25, 22, 29, 31, 35] },
  { name: "Chart 2", theme: "chart-2", data: [8, 15, 22, 19, 27, 34, 40] },
  { name: "Chart 3", theme: "chart-3", data: [45, 42, 38, 35, 40, 36, 33] },
  { name: "Chart 4", theme: "chart-4", data: [14, 20, 16, 28, 24, 38, 42] },
  {
    name: "Destructive",
    theme: "destructive",
    data: [50, 42, 35, 28, 20, 15, 12],
  },
] as const;

export const SPARKLINE_BAR_ITEMS = [
  { name: "Primary", theme: "primary", data: [12, 18, 14, 25, 22, 30, 28] },
  { name: "Chart 1", theme: "chart-1", data: [32, 28, 25, 22, 29, 31, 35] },
  { name: "Chart 2", theme: "chart-2", data: [8, 15, 22, 19, 27, 34, 40] },
  { name: "Chart 3", theme: "chart-3", data: [45, 42, 38, 35, 40, 36, 33] },
  { name: "Chart 4", theme: "chart-4", data: [14, 20, 16, 28, 24, 38, 42] },
  {
    name: "Destructive",
    theme: "destructive",
    data: [50, 42, 35, 28, 20, 15, 12],
  },
] as const;
