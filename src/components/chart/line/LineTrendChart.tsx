"use client";

import { memo } from "react";

import { Line } from "recharts";

import type { LineTrendChartProps } from "./types";

import { useChartAnimation } from "../hooks/useChartAnimation";
import { CartesianScaffold } from "../shared/CartesianScaffold";
import { DEFAULT_ANIMATION_DURATION, DEFAULT_CHART_MARGIN, DEFAULT_LINE_DOT } from "../shared/constants";
import { useLineTrend } from "./useLineTrend";

export const LineTrendChart = memo(function LineTrendChart(props: LineTrendChartProps) {
	const {
		data,
		xAxisKey = "label",
		showBrush,
		curveType = "monotone",
		showDots = false,
		height,
		showGrid = true,
		showTooltip = true,
		isAnimationActive = true,
		ariaLabel,
		className,
	} = props;
	const effectiveAnimationActive = useChartAnimation(isAnimationActive);

	const { normalizedSeries, referenceLines, valueFormatter, xAxisFormatter, yAxisFormatter } = useLineTrend(props);

	return (
		<CartesianScaffold
			chartType="line"
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
			{normalizedSeries.map((s) => (
				<Line
					key={s.dataKey}
					type={curveType}
					dataKey={s.dataKey}
					name={s.name}
					stroke={s.color}
					strokeWidth={s.strokeWidth}
					strokeDasharray={s.strokeDasharray}
					isAnimationActive={effectiveAnimationActive}
					animationDuration={DEFAULT_ANIMATION_DURATION}
					dot={showDots ? DEFAULT_LINE_DOT : false}
					activeDot={s.activeDot}
				/>
			))}
		</CartesianScaffold>
	);
});
