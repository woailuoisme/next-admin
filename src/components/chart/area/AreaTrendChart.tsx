"use client";

import { Area } from "recharts";

import type { AreaTrendChartProps } from "./types";

import { useChartAnimation } from "../hooks/useChartAnimation";
import { useChartFormatters } from "../hooks/useChartFormatters";
import { useChartTheme } from "../hooks/useChartTheme";
import { CartesianScaffold } from "../shared/CartesianScaffold";
import { DEFAULT_ANIMATION_DURATION, DEFAULT_CHART_MARGIN } from "../shared/constants";

export function AreaTrendChart({
	data,
	dataKey = "value",
	xAxisKey = "label",
	secondaryDataKey,
	theme = "primary",
	color,
	valueFormatter: propValueFormatter,
	xAxisFormatter: propXAxisFormatter,
	yAxisFormatter: propYAxisFormatter,
	height,
	showGrid = true,
	showTooltip = true,
	isAnimationActive = true,
	referenceLines,
	showBrush,
	ariaLabel,
	className,
}: AreaTrendChartProps) {
	const effectiveAnimationActive = useChartAnimation(isAnimationActive);
	const { activeStroke, secondaryStroke, gradientId } = useChartTheme({
		theme,
		color,
		gradientPrefix: "area-grad-p",
	});

	const secondaryGradId = `area-grad-s-${gradientId}`;

	const { valueFormatter, xAxisFormatter, yAxisFormatter } = useChartFormatters({
		valueFormatter: propValueFormatter,
		xAxisFormatter: propXAxisFormatter,
		yAxisFormatter: propYAxisFormatter,
	});

	return (
		<CartesianScaffold
			chartType="area"
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
			<defs>
				<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
					<stop offset="5%" stopColor={activeStroke} stopOpacity={0.35} />
					<stop offset="95%" stopColor={activeStroke} stopOpacity={0.0} />
				</linearGradient>
				{secondaryDataKey && (
					<linearGradient id={secondaryGradId} x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor={secondaryStroke} stopOpacity={0.25} />
						<stop offset="95%" stopColor={secondaryStroke} stopOpacity={0.0} />
					</linearGradient>
				)}
			</defs>

			{secondaryDataKey && (
				<Area
					type="monotone"
					dataKey={secondaryDataKey}
					stroke={secondaryStroke}
					strokeWidth={2}
					strokeDasharray="4 4"
					fillOpacity={1}
					fill={`url(#${secondaryGradId})`}
					isAnimationActive={effectiveAnimationActive}
					animationDuration={DEFAULT_ANIMATION_DURATION}
				/>
			)}

			<Area
				type="monotone"
				dataKey={dataKey}
				stroke={activeStroke}
				strokeWidth={2.5}
				fillOpacity={1}
				fill={`url(#${gradientId})`}
				isAnimationActive={effectiveAnimationActive}
				animationDuration={DEFAULT_ANIMATION_DURATION}
			/>
		</CartesianScaffold>
	);
}
