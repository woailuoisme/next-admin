"use client";

import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";

import { StatsGrid } from "@/components/stats/grid/StatsGrid";
import { StatCard } from "@/components/stats/stat-card/StatCard";

import type { DashboardMetrics, DashboardSparklines, MonthlyTrendPoint } from "../types";
import { useTranslations } from "next-intl";

interface MetricsCardsProps {
	metrics?: DashboardMetrics;
	monthlyTrends?: MonthlyTrendPoint[];
	sparklines?: DashboardSparklines;
	isLoading?: boolean;
}

const EMPTY_NUMBER_ARRAY: number[] = [];

function formatSignedGrowth(value: number): string {
	return `${value > 0 ? "+" : ""}${value}%`;
}

export function MetricsCards({ metrics, monthlyTrends, sparklines, isLoading = false }: MetricsCardsProps) {
	const t = useTranslations("dashboard");
	const fromTrends = (pick: (point: MonthlyTrendPoint) => number) => monthlyTrends?.map(pick) ?? EMPTY_NUMBER_ARRAY;
	const revenueSparkline = sparklines?.revenue?.length ? sparklines.revenue : fromTrends((point) => point.revenue);
	const ordersSparkline = sparklines?.orders?.length ? sparklines.orders : fromTrends((point) => point.orders);

	const productsSparkline = sparklines?.products ?? EMPTY_NUMBER_ARRAY;
	const customersSparkline = sparklines?.customers ?? EMPTY_NUMBER_ARRAY;

	if (isLoading || !metrics) {
		return <StatsGrid columns={4} isLoading />;
	}

	const hasCustomerGrowth = typeof metrics.customersGrowth === "number" && Number.isFinite(metrics.customersGrowth);
	const customerGrowth = hasCustomerGrowth ? metrics.customersGrowth : 0;

	return (
		<StatsGrid columns={4}>
			{/* 1. Total Revenue */}
			<StatCard
				title={t("metric_revenue_title")}
				value={metrics.totalRevenue}
				formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
				prefix="$"
				icon={DollarSign}
				theme="chart-2"
				description={t("metric_revenue_desc")}
				trend={{
					value: formatSignedGrowth(metrics.revenueGrowth),
					direction: metrics.revenueGrowth >= 0 ? "up" : "down",
					label: t("metric_revenue_trend"),
					isPositiveGood: true,
				}}
				sparklineData={revenueSparkline}
				sparklineType="area"
			/>

			{/* 2. Total Orders (with drilldown to /orders) */}
			<StatCard
				title={t("metric_orders_title")}
				value={metrics.totalOrders}
				icon={ShoppingCart}
				theme="chart-1"
				description={t("metric_orders_desc")}
				trend={{
					value: formatSignedGrowth(metrics.ordersGrowth),
					direction: metrics.ordersGrowth >= 0 ? "up" : "down",
					label: t("metric_orders_trend"),
					isPositiveGood: true,
				}}
				sparklineData={ordersSparkline}
				sparklineType="bar"
				to="/orders"
			/>

			{/* 3. Catalog Products (with drilldown to /products) */}
			<StatCard
				title={t("metric_products_title")}
				value={metrics.totalProducts}
				icon={Package}
				theme="chart-4"
				description={t("metric_products_desc")}
				trend={{
					value: t("metric_low_stock", { count: metrics.lowStockCount }),
					direction: metrics.lowStockCount > 0 ? "down" : "neutral",
					tone: metrics.lowStockCount > 0 ? "negative" : "neutral",
					label: t("metric_alert_label"),
				}}
				sparklineData={productsSparkline}
				to="/products"
			/>

			{/* 4. Active Customers */}
			<StatCard
				title={t("metric_customers_title")}
				value={metrics.totalCustomers}
				icon={Users}
				theme="chart-3"
				description={t("metric_customers_desc")}
				trend={{
					value: hasCustomerGrowth ? formatSignedGrowth(customerGrowth) : "—",
					direction: !hasCustomerGrowth ? "neutral" : customerGrowth >= 0 ? "up" : "down",
					label: t("metric_customers_trend"),
					isPositiveGood: true,
				}}
				sparklineData={customersSparkline}
				to="/users"
			/>
		</StatsGrid>
	);
}
