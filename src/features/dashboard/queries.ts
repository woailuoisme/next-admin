import { queryOptions } from "@tanstack/react-query";

import type { DashboardTimeRange } from "./types";

import { fetchDashboardSummary } from "./api";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: (range?: DashboardTimeRange) =>
    [...dashboardKeys.all, "summary", range ?? "30d"] as const,
};

export const dashboardQueries = {
  all: () => dashboardKeys.all,
  summary: (range?: DashboardTimeRange) =>
    queryOptions({
      queryKey: dashboardKeys.summary(range),
      queryFn: () => fetchDashboardSummary(range),
      staleTime: 30 * 1000,
    }),
};
