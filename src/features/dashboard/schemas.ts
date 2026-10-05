import { z } from "zod";

export const DASHBOARD_TIME_RANGES = ["7d", "30d", "90d"] as const;

export const DASHBOARD_TIME_RANGE_OPTIONS = [
  { label: "7天", value: "7d" },
  { label: "30天", value: "30d" },
  { label: "90天", value: "90d" },
] as const;

export const dashboardTimeRangeSchema = z.enum(DASHBOARD_TIME_RANGES);

export const dashboardSearchSchema = z.object({
  range: dashboardTimeRangeSchema.optional(),
});
