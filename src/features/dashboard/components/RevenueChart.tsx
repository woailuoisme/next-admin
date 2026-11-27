"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import { ChartCard, LazyAreaTrendChart } from "@/components/chart";

import type { MonthlyTrendPoint } from "../types";

const EMPTY_REVENUE_DATA: MonthlyTrendPoint[] = [];

interface RevenueChartProps {
	data?: MonthlyTrendPoint[];
	isLoading?: boolean;
}

export function RevenueChart({ data = EMPTY_REVENUE_DATA, isLoading = false }: RevenueChartProps) {
	const t = useTranslations("dashboard");
	const format = useFormatter();
	const [activePeriod, setActivePeriod] = useState("12M");

	const formatRevenueTooltip = (val: number) =>
		format.number(val, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

	const revenuePeriods = [
		{ label: t("period_3m"), value: "3M" },
		{ label: t("period_6m"), value: "6M" },
		{ label: t("period_12m"), value: "12M" },
	];

	// Map MonthlyTrendPoint data to AreaTrendChart data format filtered by active month-window
	const sliced = activePeriod === "3M" ? data.slice(-3) : activePeriod === "6M" ? data.slice(-6) : data;
	const chartData = sliced.map((item) => ({
		label: item.month,
		value: item.revenue,
		secondaryValue: item.orders * 100, // normalized scale if needed
	}));

	return (
		<ChartCard
			title={t("revenue_chart_title")}
			description={t("revenue_chart_desc")}
			periods={revenuePeriods}
			activePeriod={activePeriod}
			onPeriodChange={setActivePeriod}
			height={300}
			isLoading={isLoading}
			isEmpty={!isLoading && chartData.length === 0}
			className="col-span-full lg:col-span-4"
		>
			<LazyAreaTrendChart
				data={chartData}
				theme="chart-2"
				dataKey="value"
				xAxisKey="label"
				valueFormatter={formatRevenueTooltip}
			/>
		</ChartCard>
	);
}
