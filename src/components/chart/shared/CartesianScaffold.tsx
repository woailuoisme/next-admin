"use client";

import type { ReactElement, ReactNode } from "react";

import {
	AreaChart,
	BarChart,
	CartesianGrid,
	ComposedChart,
	LineChart,
	ScatterChart,
	Tooltip,
	type TooltipProps,
	XAxis,
	YAxis,
} from "recharts";

import type { ChartBrushConfig, ChartHeight, ChartReferenceLine } from "./types";

import { AXIS_TICK_STYLE, CHART_GRID_STROKE, DEFAULT_CHART_MARGIN } from "./constants";
import { ChartBrush } from "./ChartBrush";
import { useChartHeight } from "./ChartContext";
import { ChartFrame } from "./ChartFrame";
import { ChartReferenceLines } from "./ChartReferenceLines";
import { createValueTooltipContent } from "./ChartTooltip";
import { resolveNumericChartHeight } from "./formatters";

export type CartesianChartType = "area" | "bar" | "line" | "composed" | "scatter";

export interface ChartMargin {
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
}

export interface CartesianScaffoldProps {
	chartType: CartesianChartType;
	data?: readonly object[];
	height?: ChartHeight;
	defaultHeight?: ChartHeight;
	margin?: ChartMargin;
	xAxisKey?: string;
	xAxisType?: "category" | "number";
	xAxisName?: string;
	xAxisFormatter?: (value: string | number) => string;
	yAxisId?: string;
	yAxisType?: "number" | "category";
	yAxisKey?: string;
	yAxisName?: string;
	yAxisFormatter?: (value: number) => string;
	rightAxisFormatter?: (value: number) => string;
	valueFormatter?: (value: number) => string;
	showGrid?: boolean;
	gridVertical?: boolean;
	showTooltip?: boolean;
	tooltipContent?: TooltipProps["content"];
	tooltipCursor?: boolean | Record<string, unknown>;
	referenceLines?: ChartReferenceLine[];
	showBrush?: boolean | ChartBrushConfig;
	ariaLabel?: string;
	className?: string;
	children: ReactNode;
}

/**
 * Unified Cartesian chart scaffold consolidating responsive frame, grid, X/Y axes,
 * tooltip chrome, reference lines, and timeline brush across Cartesian Recharts charts.
 */
export function CartesianScaffold({
	chartType,
	data,
	height,
	defaultHeight = 300,
	margin = DEFAULT_CHART_MARGIN,
	xAxisKey = "label",
	xAxisType = "category",
	xAxisName,
	xAxisFormatter,
	yAxisId,
	yAxisType = "number",
	yAxisKey,
	yAxisName,
	yAxisFormatter,
	rightAxisFormatter,
	valueFormatter,
	showGrid = true,
	gridVertical = false,
	showTooltip = true,
	tooltipContent,
	tooltipCursor,
	referenceLines,
	showBrush,
	ariaLabel,
	className,
	children,
}: CartesianScaffoldProps) {
	const defaultNumericHeight = resolveNumericChartHeight(defaultHeight, 300);
	const resolvedHeight = useChartHeight(height, defaultNumericHeight);
	const renderDefaultTooltip = createValueTooltipContent(valueFormatter);

	const inner = (
		<>
			{showGrid && <CartesianGrid strokeDasharray="3 3" vertical={gridVertical} stroke={CHART_GRID_STROKE} />}

			<XAxis
				type={xAxisType}
				dataKey={xAxisKey}
				name={xAxisName}
				axisLine={false}
				tickLine={false}
				tick={AXIS_TICK_STYLE}
				tickFormatter={xAxisFormatter}
			/>

			<YAxis
				yAxisId={yAxisId}
				type={yAxisType}
				dataKey={yAxisKey}
				name={yAxisName}
				axisLine={false}
				tickLine={false}
				tick={AXIS_TICK_STYLE}
				tickFormatter={yAxisFormatter}
			/>

			{rightAxisFormatter && (
				<YAxis
					yAxisId="right"
					orientation="right"
					axisLine={false}
					tickLine={false}
					tick={AXIS_TICK_STYLE}
					tickFormatter={rightAxisFormatter}
				/>
			)}

			{showTooltip && (
				<Tooltip
					content={tooltipContent ?? renderDefaultTooltip}
					{...(tooltipCursor !== undefined ? { cursor: tooltipCursor } : {})}
				/>
			)}

			<ChartReferenceLines lines={referenceLines} />

			{children}

			<ChartBrush showBrush={showBrush} xAxisKey={xAxisKey} tickFormatter={xAxisFormatter} />
		</>
	);

	let chartElement: ReactElement;
	switch (chartType) {
		case "area":
			chartElement = (
				<AreaChart data={data} margin={margin}>
					{inner}
				</AreaChart>
			);
			break;
		case "bar":
			chartElement = (
				<BarChart data={data} margin={margin}>
					{inner}
				</BarChart>
			);
			break;
		case "line":
			chartElement = (
				<LineChart data={data} margin={margin}>
					{inner}
				</LineChart>
			);
			break;
		case "composed":
			chartElement = (
				<ComposedChart data={data} margin={margin}>
					{inner}
				</ComposedChart>
			);
			break;
		case "scatter":
			chartElement = <ScatterChart margin={margin}>{inner}</ScatterChart>;
			break;
	}

	return (
		<ChartFrame height={resolvedHeight} className={className} ariaLabel={ariaLabel}>
			{chartElement}
		</ChartFrame>
	);
}
