"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { useDashboardSummary } from "../hooks";
import { DASHBOARD_TIME_RANGE_OPTIONS } from "../schemas";
import { useTranslations } from "next-intl";

export interface DashboardPageProps {
	range?: DashboardTimeRange;
	onRangeChange?: (range: DashboardTimeRange) => void;
}

export function DashboardPage({ range = "30d", onRangeChange }: DashboardPageProps) {
	const t = useTranslations("dashboard");
	const { data, isLoading, isError, refetch, isFetching } = useDashboardSummary(range);

	const handleRefetch = () => {
		void refetch();
	};

	const handleTabsValueChange = (value: string) => {
		const newRange = value as DashboardTimeRange;
		if (newRange === range) return;
		onRangeChange?.(newRange);
	};

	if (isLoading) {
		return <DashboardSkeleton />;
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">{t("page_title")}</h1>
					<p className="text-muted-foreground mt-0.5 text-xs">{t("page_description")}</p>
				</div>

				<div className="flex items-center gap-2 self-start sm:self-auto">
					<Tabs value={range} activationMode="manual" onValueChange={handleTabsValueChange} className="w-auto">
						<TabsList aria-label={t("period_aria")} className="h-8 p-0.5">
							{DASHBOARD_TIME_RANGE_OPTIONS.map((item) => (
								<TabsTrigger key={item.value} value={item.value} className="px-2.5 py-1 text-xs">
									{t(item.labelKey)}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>

					<Button variant="outline" size="sm" onClick={handleRefetch} disabled={isFetching} className="text-xs">
						<RefreshCw
							data-icon="inline-start"
							className={cn(isFetching && "animate-spin motion-reduce:animate-none")}
							aria-hidden="true"
						/>
						{t("sync_action")}
					</Button>
				</div>
			</div>

			{isError || !data ? (
				<Alert variant="destructive">
					<AlertCircle aria-hidden="true" />
					<AlertDescription className="flex flex-col gap-3">
						<span>{t("load_error")}</span>
						<div>
							<Button type="button" variant="outline" size="xs" onClick={handleRefetch}>
								{t("retry")}
							</Button>
						</div>
					</AlertDescription>
				</Alert>
			) : (
				<>
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
				</>
			)}
		</div>
	);
}
