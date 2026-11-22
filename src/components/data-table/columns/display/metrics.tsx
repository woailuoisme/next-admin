import type { ProgressCellProps, RatingCellProps, SparklineCellProps } from "../../cells/display/types";
import type { DataTableColDef, DataTableRenderCellParams } from "../../core/types";
import type { OmitRender } from "../types";

import { ProgressCell } from "../../cells/display/ProgressCell";
import { RatingCell } from "../../cells/display/RatingCell";
import { SparklineCell } from "../../cells/display/SparklineCell";
import { resolveProp } from "../utils";

/** 进度条列构造器 (ProgressColumn) */
export function progressCol<TData = any>(
	field: keyof TData & string,
	headerName: string,
	options?: OmitRender<TData> & {
		headerDescription?: string;
		max?: number;
		showValue?: boolean;
		colorByValue?: boolean;
		segments?: ProgressCellProps["segments"] | ((row: TData) => ProgressCellProps["segments"]);
		target?: number | ((row: TData) => number | undefined);
		targetLabel?: string;
		showPercentage?: boolean;
	},
): DataTableColDef<TData> {
	const { headerDescription, max, showValue, colorByValue, segments, target, targetLabel, showPercentage, ...colDef } =
		options || {};

	return {
		field,
		headerName,
		description: headerDescription,
		sortable: true,
		filterable: true,
		align: "left",
		renderCell: ({ value, row }: DataTableRenderCellParams<TData>) => (
			<ProgressCell
				value={value}
				max={max}
				showValue={showValue}
				colorByValue={colorByValue}
				segments={resolveProp(segments, row)}
				target={resolveProp(target, row)}
				targetLabel={targetLabel}
				showPercentage={showPercentage}
			/>
		),
		...colDef,
	};
}

/** 迷你走势图列构造器 (SparklineColumn) */
export function sparklineCol<TData = any>(
	field: keyof TData & string,
	headerName: string,
	options?: OmitRender<TData> & {
		headerDescription?: string;
		variant?: SparklineCellProps["variant"];
		color?: SparklineCellProps["color"];
		height?: number;
		width?: number;
		showDot?: boolean;
		showMinMax?: boolean;
		autoTrendColor?: boolean;
		interactive?: boolean;
		barWidth?: number;
		barGap?: number;
	},
): DataTableColDef<TData> {
	const {
		headerDescription,
		variant,
		color,
		height,
		width,
		showDot,
		showMinMax,
		autoTrendColor,
		interactive,
		barWidth,
		barGap,
		...colDef
	} = options || {};

	return {
		field,
		headerName,
		description: headerDescription,
		sortable: false,
		filterable: false,
		align: "center",
		headerAlign: "center",
		renderCell: ({ value }: DataTableRenderCellParams<TData>) => (
			<SparklineCell
				data={Array.isArray(value) ? value : []}
				variant={variant}
				color={color}
				height={height}
				width={width}
				showDot={showDot}
				showMinMax={showMinMax}
				autoTrendColor={autoTrendColor}
				interactive={interactive}
				barWidth={barWidth}
				barGap={barGap}
			/>
		),
		...colDef,
	};
}

/** 星级/评级列构造器 (RatingColumn) */
export function ratingCol<TData = any>(
	field: keyof TData & string,
	headerName: string,
	options?: OmitRender<TData> & {
		headerDescription?: string;
		max?: number;
		size?: RatingCellProps["size"];
		showScore?: boolean;
		allowHalf?: boolean;
		iconType?: RatingCellProps["iconType"];
		reviewCount?: number | ((row: TData) => number | undefined);
	},
): DataTableColDef<TData> {
	const { headerDescription, max, size, showScore, allowHalf, iconType, reviewCount, ...colDef } = options || {};

	return {
		field,
		headerName,
		description: headerDescription,
		sortable: true,
		filterable: true,
		align: "left",
		renderCell: ({ value, row }: DataTableRenderCellParams<TData>) => (
			<RatingCell
				value={value}
				max={max}
				size={size}
				showScore={showScore}
				allowHalf={allowHalf}
				iconType={iconType}
				reviewCount={resolveProp(reviewCount, row)}
			/>
		),
		...colDef,
	};
}
