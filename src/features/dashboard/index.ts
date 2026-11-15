// Public API seam for dashboard feature

export { CategoryDistributionChart } from "./components/CategoryDistributionChart";
export { DashboardSkeleton } from "./components/DashboardSkeleton";
export { MetricsCards } from "./components/MetricsCards";
export { QuickActions } from "./components/QuickActions";
export { RecentOrdersTable } from "./components/RecentOrdersTable";
export { RevenueChart } from "./components/RevenueChart";
export { useDashboardSummary } from "./hooks";
export { DashboardPage, type DashboardPageProps } from "./pages/DashboardPage";
export { dashboardKeys, dashboardQueries, dashboardResource, fetchDashboardSummary } from "./resource";
export {
  DASHBOARD_TIME_RANGE_OPTIONS,
  DASHBOARD_TIME_RANGES,
  dashboardSearchSchema,
  dashboardTimeRangeSchema,
} from "./schemas";
export type {
  DashboardMetrics,
  DashboardSearchParams,
  DashboardSummary,
  DashboardTimeRange,
  MonthlyTrendPoint,
} from "./types";
