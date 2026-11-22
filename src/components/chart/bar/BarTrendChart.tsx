"use client";

import { memo } from "react";

import { Bar } from "recharts";

import type { BarTrendChartProps } from "./types";

import { useChartAnimation } from "../hooks/useChartAnimation";
import { useChartFormatters } from "../hooks/useChartFormatters";
import { useChartTheme } from "../hooks/useChartTheme";
import { CartesianScaffold } from "../shared/CartesianScaffold";
import { DEFAULT_ANIMATION_DURATION, DEFAULT_CHART_MARGIN } from "../shared/constants";

const BAR_RADIUS: [number, number, number, number] = [4, 4, 0, 0];

export const BarTrendChart = memo(function BarTrendChart({
	data,
	dataKey = "value",
	xAxisKey = "label",
	secondaryDataKey,
	theme = "primary",
	color,
	valueFormatter: propValueFormatter,
	xAxisFormatter: propXAxisFormatter,
	yAxisFormatter: propYAxisFormatter,
	referenceLines,
	showBrush,
	height,
	showGrid = true,
	showTooltip = true,
	isAnimationActive = true,
	ariaLabel,
	className,
}: BarTrendChartProps) {
	const effectiveAnimationActive = useChartAnimation(isAnimationActive);
	const { activeStroke, secondaryStroke } = useChartTheme({ theme, color });

	const { valueFormatter, xAxisFormatter, yAxisFormatter } = useChartFormatters({
		valueFormatter: propValueFormatter,
		xAxisFormatter: propXAxisFormatter,
		yAxisFormatter: propYAxisFormatter,
	});

	return (
		<CartesianScaffold
			chartType="bar"
			data={data}
			height={height}
			margin={DEFAULT_CHART_MARGIN}
			xAxisKey={xAxisKey}
			xAxisFormatter={xAxisFormatter}
			yAxisFormatter={yAxisFormatter}
			valueFormatter={valueFormatter}
			showGrid={showGrid}
			showTooltip={showTooltip}
			referenceLines={referenceLines}
			showBrush={showBrush}
			ariaLabel={ariaLabel}
			className={className}
		>
			<Bar
				dataKey={dataKey}
				fill={activeStroke}
				radius={BAR_RADIUS}
				maxBarSize={40}
				isAnimationActive={effectiveAnimationActive}
				animationDuration={DEFAULT_ANIMATION_DURATION}
			/>

			{secondaryDataKey && (
				<Bar
					dataKey={secondaryDataKey}
					fill={secondaryStroke}
					opacity={0.7}
					radius={BAR_RADIUS}
					maxBarSize={40}
					isAnimationActive={effectiveAnimationActive}
					animationDuration={DEFAULT_ANIMATION_DURATION}
				/>
			)}
		</CartesianScaffold>
	);
});
