"use client";

import { useTranslations } from "next-intl";

import { Bar, Cell, LabelList } from "recharts";

import type { WaterfallFinancialChartProps, WaterfallItemType } from "./types";

import { useChartAnimation } from "../hooks/useChartAnimation";
import { CartesianScaffold } from "../shared/CartesianScaffold";
import { type ChartTooltipEntry, useChartDetailTooltip } from "../shared/ChartTooltip";
import { DEFAULT_ANIMATION_DURATION, DEFAULT_CHART_MARGIN } from "../shared/constants";
import { toFiniteNumber } from "../shared/formatters";
import { useWaterfallFinancial } from "./useWaterfallFinancial";

const WATERFALL_BAR_RADIUS: [number, number, number, number] = [4, 4, 4, 4];
const WATERFALL_TOOLTIP_CURSOR = { fill: "color-mix(in oklab, var(--muted) 25%, transparent)" } as const;

interface WaterfallTooltipItem {
	label: string;
	rawVal: number;
	runningTotal: number;
	fill: string;
	type?: WaterfallItemType;
}

export function WaterfallFinancialChart(props: WaterfallFinancialChartProps) {
	const {
		height,
		xAxisFormatter,
		showGrid = true,
		showTooltip = true,
		showLabels = false,
		isAnimationActive = true,
		ariaLabel,
		className,
	} = props;
	const effectiveAnimationActive = useChartAnimation(isAnimationActive);

	const t = useTranslations("chart");
	const { processedData, valueFormatter } = useWaterfallFinancial(props);

	const resolveTooltipDetail = (payload: ReadonlyArray<ChartTooltipEntry>) => {
		const item = payload[0]?.payload as WaterfallTooltipItem | undefined;
		if (!item) return null;

		const signedChange =
			item.type === "decrease"
				? -Math.abs(item.rawVal)
				: item.type === "increase"
					? Math.abs(item.rawVal)
					: item.rawVal;
		const isPositive = signedChange > 0;
		const isNegative = signedChange < 0;
		const prefix = isPositive && item.type === "increase" ? "+" : "";

		return {
			title: item.label,
			color: item.fill,
			rows: [
				{
					label: t("waterfall_change"),
					value: `${prefix}${valueFormatter(signedChange)}`,
					valueClassName:
						isPositive && item.type === "increase"
							? "text-primary font-medium"
							: isNegative || item.type === "decrease"
								? "text-destructive font-medium"
								: "text-foreground font-medium",
				},
				{
					label: t("waterfall_total"),
					value: valueFormatter(item.runningTotal),
				},
			],
		};
	};

	const renderTooltip = useChartDetailTooltip(resolveTooltipDetail);
	const formatBarLabel = (val: unknown) => valueFormatter(toFiniteNumber(val));

	return (
		<CartesianScaffold
			chartType="bar"
			data={processedData}
			height={height}
			defaultHeight={320}
			margin={DEFAULT_CHART_MARGIN}
			xAxisKey="label"
			xAxisFormatter={xAxisFormatter}
			yAxisFormatter={valueFormatter}
			showGrid={showGrid}
			showTooltip={showTooltip}
			tooltipContent={renderTooltip}
			tooltipCursor={WATERFALL_TOOLTIP_CURSOR}
			ariaLabel={ariaLabel}
			className={className}
		>
			{/* Native Recharts range tuple bar [min, max] safely handles cross-zero steps */}
			<Bar
				dataKey="range"
				radius={WATERFALL_BAR_RADIUS}
				maxBarSize={48}
				isAnimationActive={effectiveAnimationActive}
				animationDuration={DEFAULT_ANIMATION_DURATION}
			>
				{processedData.map((entry, index) => (
					<Cell key={`waterfall-cell-${entry.label}_${index}`} fill={entry.fill} />
				))}
				{showLabels && (
					<LabelList
						dataKey="rawVal"
						position="top"
						formatter={formatBarLabel}
						className="fill-muted-foreground font-mono text-[11px]"
					/>
				)}
			</Bar>
		</CartesianScaffold>
	);
}
