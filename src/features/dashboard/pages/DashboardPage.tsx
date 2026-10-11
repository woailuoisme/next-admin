"use client";

import { useMemoizedFn } from "ahooks";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { DashboardTimeRange } from "../types";

import { CategoryDistributionChart } from "../components/CategoryDistributionChart";
import { DashboardSkeleton } from "../components/DashboardSkeleton";
import { MetricsCards } from "../components/MetricsCards";
import { QuickActions } from "../components/QuickActions";
import { RecentOrdersTable } from "../components/RecentOrdersTable";
import { RevenueChart } from "../components/RevenueChart";
import { useDashboardSummaryQuery } from "../hooks";
import { DASHBOARD_TIME_RANGE_OPTIONS } from "../schemas";

export interface DashboardPageProps {
  range?: DashboardTimeRange;
  onRangeChange?: (range: DashboardTimeRange) => void;
}

export function DashboardPage({ range = "30d", onRangeChange }: DashboardPageProps) {
  const { data, isLoading, isError, refetch, isFetching } = useDashboardSummaryQuery(range);

  const handleRefetch = useMemoizedFn(() => {
    refetch();
  });

  const handleRangeChange = useMemoizedFn((newRange: DashboardTimeRange) => {
    if (newRange === range) return;
    onRangeChange?.(newRange);
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-3">
        <p className="text-destructive text-sm font-medium">Failed to load dashboard data</p>
        <Button variant="outline" size="sm" onClick={handleRefetch}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">运营仪表盘 (Executive Dashboard)</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            实时掌握全店营收体量、履约履单状态及核心品类商品指标
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <fieldset
            aria-label="选择统计周期"
            className="bg-muted/40 m-0 flex items-center rounded-lg border p-0.5 text-xs"
          >
            {DASHBOARD_TIME_RANGE_OPTIONS.map((item) => (
              <label
                key={item.value}
                className={cn(
                  "cursor-pointer rounded-md px-2.5 py-1 font-medium transition-all select-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
                  range === item.value
                    ? "bg-background font-semibold text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <input
                  type="radio"
                  name="dashboard-time-range"
                  value={item.value}
                  checked={range === item.value}
                  onChange={() => handleRangeChange(item.value)}
                  className="sr-only"
                />
                {item.label}
              </label>
            ))}
          </fieldset>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefetch}
            disabled={isFetching}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
            <span>同步数据</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <MetricsCards metrics={data.metrics} monthlyTrends={data.monthlyTrends} sparklines={data.sparklines} />

      {/* Charts & Tables Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <RevenueChart data={data.monthlyTrends} />
        <RecentOrdersTable orders={data.recentOrders} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <CategoryDistributionChart data={data.categoryDistribution} className="col-span-full lg:col-span-4" />
        <div className="col-span-full lg:col-span-3">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
