import { z } from "zod";

export const DASHBOARD_TIME_RANGES = ["7d", "30d", "90d"] as const;

export const DASHBOARD_TIME_RANGE_OPTIONS = [
  { labelKey: "range_7d", value: "7d" },
  { labelKey: "range_30d", value: "30d" },
  { labelKey: "range_90d", value: "90d" },
] as const;

export const dashboardTimeRangeSchema = z.enum(DASHBOARD_TIME_RANGES);

export const dashboardSearchSchema = z.object({
  range: dashboardTimeRangeSchema.optional(),
});
