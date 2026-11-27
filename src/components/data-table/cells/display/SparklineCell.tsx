"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import { SparklinePrimitive } from "@/components/shared/sparkline/SparklinePrimitive";
import { computeSparklineGeometry } from "@/components/shared/sparkline/sparklineEngine";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

import { JUSTIFY_ALIGN_CLASSES } from "../base";
import type { SparklineCellProps } from "./types";

function renderSparklineTooltip(
	hoveredIndex: number | null,
	values: number[],
	min: number,
	max: number,
	isUp: boolean,
	t: ReturnType<typeof useTranslations<"table">>,
	customTooltip?: React.ReactNode,
) {
	if (hoveredIndex !== null) {
		return (
			<div className="font-mono text-[11px]">
				<span>{t("sparkline_point", { index: hoveredIndex + 1 })} </span>
				<span className="font-semibold">{values[hoveredIndex]}</span>
			</div>
		);
	}
	if (customTooltip) return customTooltip;
	return (
		<div className="flex flex-col gap-0.5 font-mono text-[11px]">
			<p>
				{t("sparkline_latest")} <span className="font-semibold">{values[values.length - 1]}</span>
			</p>
			<p className="text-muted-foreground">
				{t("sparkline_range", { min, max, trend: isUp ? t("sparkline_up") : t("sparkline_down") })}
			</p>
		</div>
	);
}

export function SparklineCell({
	data,
	variant = "line",
	width = 96,
	height = 24,
	strokeWidth = 1.5,
	barWidth = 4,
	barGap = 2,
	color,
	showFill = true,
	fillGradient,
	autoTrendColor = true,
	showEndpoint = true,
	showDot,
	showMinMax = false,
	interactive = false,
	tooltip,
	align = "left",
	className,
}: SparklineCellProps) {
	const t = useTranslations("table");
	const gradientId = useId();
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	if (!data || data.length < 2) {
		return <span className="text-muted-foreground/40 text-xs italic">-</span>;
	}

	const effectiveShowEndpoint = showDot ?? showEndpoint;
	const effectiveShowFill = fillGradient ?? showFill;
	const engineVariant = variant === "bar" ? "bar" : effectiveShowFill ? "area" : "line";

	const geometry = computeSparklineGeometry({
		data,
		variant: engineVariant,
		curve: "linear",
		width,
		height,
		padding: 3,
		barWidth: variant === "bar" ? barWidth : undefined,
		barGap: variant === "bar" ? barGap : undefined,
	});

	const isUp = geometry.last >= geometry.first;
	const autoColorClass = isUp ? "text-chart-2" : "text-destructive";
	const resolvedColorClass = color ? "" : autoTrendColor ? autoColorClass : "text-primary";
	const viewBoxWidth = variant === "bar" ? geometry.totalWidth : width;

	return (
		<Tooltip open={interactive ? hoveredIndex !== null : undefined}>
			<TooltipTrigger asChild>
				<div className="w-full cursor-default">
					<div
						className={cn("flex items-center", JUSTIFY_ALIGN_CLASSES[align], resolvedColorClass, className)}
						data-testid={variant === "bar" ? "sparkline-bar-cell" : "sparkline-cell"}
					>
						<SparklinePrimitive
							geometry={geometry}
							variant={engineVariant}
							svgWidth={viewBoxWidth}
							svgHeight={height}
							viewBoxWidth={viewBoxWidth}
							viewBoxHeight={height}
							color={color || "currentColor"}
							gradientId={gradientId}
							strokeWidth={strokeWidth}
							showArea={effectiveShowFill}
							barRadius={1}
							interactive={interactive}
							hoveredIndex={hoveredIndex}
							onHoverIndexChange={setHoveredIndex}
							barWidth={barWidth}
							barGap={barGap}
							showMinMaxDots={showMinMax}
							minMaxRadius={2}
							minDotTestId="sparkline-min-dot"
							maxDotTestId="sparkline-max-dot"
							showEndpointDot={effectiveShowEndpoint}
							endpointRadius={2}
							endpointDotTestId="sparkline-endpoint-dot"
							pulseEndpoint
							ariaHidden
						/>
					</div>
				</div>
			</TooltipTrigger>
			<TooltipContent side="top" className="text-xs">
				{renderSparklineTooltip(hoveredIndex, geometry.values, geometry.min, geometry.max, isUp, t, tooltip)}
			</TooltipContent>
		</Tooltip>
	);
}
