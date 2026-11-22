"use client";

import type { MouseEvent } from "react";

import { cn } from "cn";

import { SparklineAreaFill } from "./SparklineAreaFill";
import type { SparklineGeometryResult, SparklineVariant } from "./sparklineEngine";

export interface SparklinePrimitiveProps {
	geometry: SparklineGeometryResult;
	variant: SparklineVariant;
	svgWidth?: number;
	svgHeight?: number;
	viewBoxWidth: number;
	viewBoxHeight: number;
	preserveAspectRatio?: string;
	svgClassName?: string;
	color: string;
	gradientId: string;
	strokeWidth?: number;
	nonScalingStroke?: boolean;
	showArea?: boolean;
	areaOpacity?: number;
	barRadius?: number;
	interactive?: boolean;
	hoveredIndex?: number | null;
	onHoverIndexChange?: (idx: number | null) => void;
	barWidth?: number;
	barGap?: number;
	showMinMaxDots?: boolean;
	minMaxRadius?: number;
	minDotTestId?: string;
	maxDotTestId?: string;
	showEndpointDot?: boolean;
	endpointRadius?: number;
	endpointDotTestId?: string;
	pulseEndpoint?: boolean;
	role?: "img";
	ariaLabel?: string;
	ariaHidden?: boolean;
}

/**
 * 跨 KPI 统计卡、图表与表格单元格复用的统一 SVG Sparkline 渲染原语。
 */
export function SparklinePrimitive({
	geometry,
	variant,
	svgWidth,
	svgHeight,
	viewBoxWidth,
	viewBoxHeight,
	preserveAspectRatio,
	svgClassName,
	color,
	gradientId,
	strokeWidth = 2,
	nonScalingStroke = false,
	showArea = true,
	areaOpacity = 0.25,
	barRadius = 1.5,
	interactive = false,
	hoveredIndex = null,
	onHoverIndexChange,
	barWidth = 4,
	barGap = 2,
	showMinMaxDots = false,
	minMaxRadius = 2.5,
	minDotTestId,
	maxDotTestId,
	showEndpointDot = false,
	endpointRadius = 2.5,
	endpointDotTestId,
	pulseEndpoint = false,
	role,
	ariaLabel,
	ariaHidden,
}: SparklinePrimitiveProps) {
	const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
		if (!interactive || !onHoverIndexChange) return;
		const rect = e.currentTarget.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const len = geometry.values.length;

		if (variant === "bar") {
			const idx = Math.floor(mouseX / (barWidth + barGap));
			if (idx >= 0 && idx < len) onHoverIndexChange(idx);
			return;
		}

		const ratio = Math.max(0, Math.min(1, (mouseX - 2) / Math.max(1, viewBoxWidth - 4)));
		const idx = Math.round(ratio * (len - 1));
		if (idx >= 0 && idx < len) onHoverIndexChange(idx);
	};

	const handleMouseLeave = () => {
		if (interactive) onHoverIndexChange?.(null);
	};

	const hoveredPoint = hoveredIndex !== null ? geometry.points[hoveredIndex] : null;
	const { minPoint, maxPoint, lastPoint } = geometry;

	return (
		<svg
			width={svgWidth}
			height={svgHeight}
			viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
			preserveAspectRatio={preserveAspectRatio}
			className={cn("overflow-visible", svgClassName)}
			onMouseMove={interactive ? handleMouseMove : undefined}
			onMouseLeave={interactive ? handleMouseLeave : undefined}
			role={role}
			aria-label={ariaLabel}
			aria-hidden={ariaHidden}
		>
			{variant === "bar" ? (
				geometry.bars.map((bar) => {
					const isHovered = hoveredIndex === bar.key;
					return (
						<rect
							key={bar.key}
							x={bar.x}
							y={bar.y}
							width={bar.width}
							height={bar.height}
							rx={barRadius}
							fill={color}
							opacity={interactive ? undefined : bar.opacity}
							className={
								interactive
									? cn(
											"transition-opacity",
											hoveredIndex !== null && !isHovered
												? "opacity-35"
												: isHovered
													? "ring-foreground opacity-100 ring-1"
													: "opacity-80",
										)
									: undefined
							}
						/>
					);
				})
			) : (
				<>
					{showArea ? (
						<SparklineAreaFill
							gradientId={gradientId}
							areaPath={geometry.areaPath}
							color={color}
							stopOpacity={areaOpacity}
						/>
					) : null}
					<path
						d={geometry.linePath}
						fill="none"
						stroke={color}
						strokeWidth={strokeWidth}
						strokeLinecap="round"
						strokeLinejoin="round"
						vectorEffect={nonScalingStroke ? "non-scaling-stroke" : undefined}
					/>
					{showMinMaxDots && minPoint ? (
						<circle
							cx={minPoint.x}
							cy={minPoint.y}
							r={minMaxRadius}
							fill="var(--destructive)"
							stroke="var(--background)"
							strokeWidth={1.5}
							data-testid={minDotTestId}
						/>
					) : null}
					{showMinMaxDots && maxPoint ? (
						<circle
							cx={maxPoint.x}
							cy={maxPoint.y}
							r={minMaxRadius}
							fill="var(--chart-2)"
							stroke="var(--background)"
							strokeWidth={1.5}
							data-testid={maxDotTestId}
						/>
					) : null}
					{showEndpointDot && lastPoint && hoveredIndex === null ? (
						<circle
							cx={lastPoint.x}
							cy={lastPoint.y}
							r={endpointRadius}
							fill={color}
							stroke={pulseEndpoint ? undefined : "var(--background)"}
							strokeWidth={pulseEndpoint ? undefined : 1.5}
							className={pulseEndpoint ? "animate-pulse" : undefined}
							data-testid={endpointDotTestId}
						/>
					) : null}
					{hoveredPoint ? (
						<>
							<line
								x1={hoveredPoint.x}
								y1={0}
								x2={hoveredPoint.x}
								y2={viewBoxHeight}
								stroke="currentColor"
								strokeWidth={1}
								strokeDasharray="2 2"
								className="opacity-50"
							/>
							<circle
								cx={hoveredPoint.x}
								cy={hoveredPoint.y}
								r={3}
								fill={color}
								className="stroke-background stroke-2"
							/>
						</>
					) : null}
				</>
			)}
		</svg>
	);
}
