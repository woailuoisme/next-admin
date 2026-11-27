"use client";

import { Pie, PieChart, Tooltip } from "recharts";

import { cn } from "cn";

import type { DonutDistributionChartProps, EnrichedDonutSliceData } from "./types";

import { useChartAnimation } from "../hooks/useChartAnimation";
import { useChartHeight } from "../shared/ChartContext";
import { ChartFrame } from "../shared/ChartFrame";
import { type ChartTooltipEntry, useChartDetailTooltip } from "../shared/ChartTooltip";
import { DEFAULT_ANIMATION_DURATION } from "../shared/constants";
import { resolveNumericChartHeight } from "../shared/formatters";
import { useDonutDistribution } from "./useDonutDistribution";

export function DonutDistributionChart(props: DonutDistributionChartProps) {
	const {
		innerRadius = "58%",
		outerRadius = "82%",
		height,
		showLegend = true,
		isAnimationActive = true,
		ariaLabel,
		className,
	} = props;
	const effectiveAnimationActive = useChartAnimation(isAnimationActive);

	const resolvedHeight = useChartHeight(height, 260);
	const numericHeight = resolveNumericChartHeight(resolvedHeight, 260);
	const { enrichedData, centerLabel, displayCenterValue, valueFormatter } = useDonutDistribution(props);

	const resolveTooltipDetail = (payload: ReadonlyArray<ChartTooltipEntry>) => {
		const item = payload[0]?.payload as EnrichedDonutSliceData | undefined;
		if (!item) return null;
		return {
			title: item.name,
			color: item.color,
			rows: [
				{
					value: `${valueFormatter(item.value)} (${item.percentage.toFixed(1)}%)`,
				},
			],
		};
	};

	const renderTooltip = useChartDetailTooltip(resolveTooltipDetail);

	return (
		<div
			className={cn("flex w-full flex-col items-center justify-between gap-6 md:flex-row", className)}
			style={{ minHeight: resolvedHeight }}
		>
			{/* Donut chart with centered text */}
			<div
				className={cn(
					"relative flex w-full min-w-0 shrink-0 items-center justify-center",
					showLegend && "md:w-[46%] md:max-w-[360px]",
				)}
				style={{ height: resolvedHeight }}
			>
				<ChartFrame height={resolvedHeight} initialWidth={numericHeight} ariaLabel={ariaLabel}>
					<PieChart>
						<Tooltip content={renderTooltip} />
						<Pie
							data={enrichedData}
							dataKey="value"
							nameKey="name"
							cx="50%"
							cy="50%"
							innerRadius={innerRadius}
							outerRadius={outerRadius}
							paddingAngle={3}
							stroke="var(--background)"
							strokeWidth={2}
							isAnimationActive={effectiveAnimationActive}
							animationDuration={DEFAULT_ANIMATION_DURATION}
						/>
					</PieChart>
				</ChartFrame>

				{/* Center summary text overlay */}
				<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center select-none">
					<span className="text-muted-foreground text-xs font-medium">{centerLabel}</span>
					<span className="text-foreground font-mono text-lg font-bold tracking-tight">{displayCenterValue}</span>
				</div>
			</div>

			{/* Legend list */}
			{showLegend && (
				<div className="flex max-h-[220px] w-full flex-1 flex-col gap-2.5 overflow-y-auto pr-1">
					{enrichedData.map((item, index) => (
						<div
							key={`${item.name}-${index}`}
							className="hover:bg-muted/40 flex items-center justify-between rounded-md px-2 py-1 text-xs transition-colors"
						>
							<div className="flex min-w-0 items-center gap-2">
								<span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
								<span className="text-foreground truncate font-medium">{item.name}</span>
							</div>
							<div className="flex shrink-0 items-center gap-3">
								<span className="text-muted-foreground font-mono">{valueFormatter(item.value)}</span>
								<span className="text-foreground w-12 text-right font-mono font-medium">
									{item.percentage.toFixed(1)}%
								</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
