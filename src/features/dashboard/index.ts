// Public API seam for dashboard feature

export { fetchDashboardSummary } from "./api";
export { CategoryDistributionChart } from "./components/CategoryDistributionChart";
export { MetricsCards } from "./components/MetricsCards";
export { QuickActions } from "./components/QuickActions";
export { RecentOrdersTable } from "./components/RecentOrdersTable";
export { RevenueChart } from "./components/RevenueChart";
export { useDashboardSummaryQuery } from "./hooks";
export { DashboardSkeleton } from "./components/DashboardSkeleton";
export { DashboardPage, type DashboardPageProps } from "./pages/DashboardPage";
export { dashboardKeys, dashboardQueries } from "./queries";
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
