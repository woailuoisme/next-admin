import type { ApiResponse } from "@/types";

import { apiClient, toSearchParams } from "@/lib/api-client";

import type { DashboardSummary, DashboardTimeRange } from "./types";

export async function fetchDashboardSummary(range?: DashboardTimeRange): Promise<DashboardSummary> {
  const res = await apiClient
    .get("dashboard/summary", { searchParams: toSearchParams({ range }) })
    .json<ApiResponse<DashboardSummary>>();
  return res.data;
}
