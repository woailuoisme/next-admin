"use client";

import { useTranslations } from "next-intl";
import type { KeyboardEvent } from "react";

import type { ComputedHeatmapCell } from "./useHeatmapMatrix";

const CELL_RADIUS = 3;
const LEGEND_STEP_RATIOS = [0.1, 0.3, 0.55, 0.8, 1] as const;

export interface HeatmapCellNodeProps {
	cell: ComputedHeatmapCell;
	rowIndex: number;
	colIndex: number;
	x: number;
	y: number;
	width: number;
	height: number;
	fill: string;
	opacity: number;
	isHovered: boolean;
	isFocusable: boolean;
	ariaLabel: string;
	onHover: (cell: ComputedHeatmapCell, rowIndex: number, colIndex: number, target: SVGRectElement) => void;
	onFocusCell: (cell: ComputedHeatmapCell, rowIndex: number, colIndex: number, target: SVGRectElement) => void;
	onDeactivate: () => void;
	onKeyNavigate: (e: KeyboardEvent<SVGRectElement>, rowIndex: number, colIndex: number) => void;
}

export function HeatmapCellNode({
	cell,
	rowIndex,
	colIndex,
	x,
	y,
	width,
	height,
	fill,
	opacity,
	isHovered,
	isFocusable,
	ariaLabel,
	onHover,
	onFocusCell,
	onDeactivate,
	onKeyNavigate,
}: HeatmapCellNodeProps) {
	return (
		<rect
			x={x}
			y={y}
			width={width}
			height={height}
			rx={CELL_RADIUS}
			fill={fill}
			opacity={opacity}
			stroke={isHovered ? "var(--foreground)" : "transparent"}
			strokeWidth={isHovered ? 1.5 : 0}
			tabIndex={isFocusable ? 0 : -1}
			role="gridcell"
			aria-label={ariaLabel}
			data-row={rowIndex}
			data-col={colIndex}
			className="focus-visible:stroke-foreground cursor-pointer transition-all duration-150 outline-none hover:brightness-110"
			onMouseEnter={(e) => onHover(cell, rowIndex, colIndex, e.currentTarget)}
			onMouseLeave={onDeactivate}
			onFocus={(e) => onFocusCell(cell, rowIndex, colIndex, e.currentTarget)}
			onBlur={onDeactivate}
			onKeyDown={(e) => onKeyNavigate(e, rowIndex, colIndex)}
		/>
	);
}

interface HeatmapLegendProps {
	title: string;
	minLabel: string;
	maxLabel: string;
	themeColor: string;
}

export function HeatmapLegend({ title, minLabel, maxLabel, themeColor }: HeatmapLegendProps) {
	const t = useTranslations("chart");

	return (
		<div className="text-muted-foreground mt-2 flex flex-wrap items-center justify-end gap-2 px-1 text-[11px] font-medium">
			<span>
				{title}: {t("legend_low")} ({minLabel})
			</span>
			<div className="flex items-center gap-1" aria-hidden="true">
				{LEGEND_STEP_RATIOS.map((stepRatio) => (
					<span
						key={`legend-step-${stepRatio}`}
						className="inline-block size-3 rounded-[2px]"
						style={{ backgroundColor: themeColor, opacity: stepRatio }}
					/>
				))}
			</div>
			<span>
				{t("legend_high")} ({maxLabel})
			</span>
		</div>
	);
}
