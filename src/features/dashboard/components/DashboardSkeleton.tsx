import { Skeleton } from "@/components/ui/skeleton";

import { CategoryDistributionChart } from "./CategoryDistributionChart";
import { MetricsCards } from "./MetricsCards";
import { QuickActions } from "./QuickActions";
import { RecentOrdersTable } from "./RecentOrdersTable";
import { RevenueChart } from "./RevenueChart";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" data-testid="dashboard-skeleton">
      {/* Page Header Skeleton */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Skeleton className="h-8 w-44 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>

      {/* KPI Stats Cards Skeleton */}
      <MetricsCards isLoading />

      {/* Charts & Tables Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <RevenueChart isLoading />
        <RecentOrdersTable isLoading />
      </div>

      {/* Category Distribution & Quick Actions Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <CategoryDistributionChart isLoading className="col-span-full lg:col-span-4" />
        <div className="col-span-full lg:col-span-3">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
