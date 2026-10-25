"use client";

import { useMemoizedFn } from "ahooks";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "cn";

import type { DashboardTimeRange } from "../types";

import { CategoryDistributionChart } from "../components/CategoryDistributionChart";
import { DashboardSkeleton } from "../components/DashboardSkeleton";
import { MetricsCards } from "../components/MetricsCards";
import { QuickActions } from "../components/QuickActions";
import { RecentOrdersTable } from "../components/RecentOrdersTable";
import { RevenueChart } from "../components/RevenueChart";
import { useDashboardSummaryQuery } from "../hooks";
import { DASHBOARD_TIME_RANGE_OPTIONS } from "../schemas";
import { useTranslations } from "next-intl";

export interface DashboardPageProps {
  range?: DashboardTimeRange;
  onRangeChange?: (range: DashboardTimeRange) => void;
}

export function DashboardPage({ range = "30d", onRangeChange }: DashboardPageProps) {
  const t = useTranslations("dashboard");
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
        <p className="text-destructive text-sm font-medium">{t("load_error")}</p>
        <Button variant="outline" size="sm" onClick={handleRefetch}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("page_title")}</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">{t("page_description")}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Tabs value={range} onValueChange={(val) => handleRangeChange(val as DashboardTimeRange)} className="w-auto">
            <TabsList aria-label={t("period_aria")} className="h-8 p-0.5">
              {DASHBOARD_TIME_RANGE_OPTIONS.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  onClick={() => handleRangeChange(item.value)}
                  className="px-2.5 py-1 text-xs"
                >
                  {t(item.labelKey)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefetch}
            disabled={isFetching}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
            <span>{t("sync_action")}</span>
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
