"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardResource } from "./resource";
import type { DashboardTimeRange } from "./types";

export function useDashboardSummary(range: DashboardTimeRange = "30d") {
  return useQuery(dashboardResource.queries.summary(range));
}
