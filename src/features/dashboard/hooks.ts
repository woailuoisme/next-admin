import { useQuery } from "@tanstack/react-query";

import type { DashboardTimeRange } from "./types";

import { dashboardQueries } from "./queries";

export function useDashboardSummaryQuery(range?: DashboardTimeRange) {
  return useQuery(dashboardQueries.summary(range));
}
