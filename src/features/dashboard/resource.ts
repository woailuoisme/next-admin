import { apiClient, toSearchParams } from "@/lib/apiClient";
import { defineEndpoint } from "@/lib/resource";
import type { ApiResponse } from "@/types";

import type { DashboardSummary, DashboardTimeRange } from "./types";

export async function fetchDashboardSummary(range?: DashboardTimeRange): Promise<DashboardSummary> {
  const res = await apiClient
    .get("dashboard/summary", { searchParams: toSearchParams({ range }) })
    .json<ApiResponse<DashboardSummary>>();
  return res.data;
}

export const dashboardResource = defineEndpoint({
  name: "dashboard",
  queries: {
    summary: {
      key: (range?: DashboardTimeRange) => ["summary", range ?? "30d"] as const,
      queryFn: (range?: DashboardTimeRange) => fetchDashboardSummary(range),
      staleTime: 30 * 1000,
    },
  },
});
