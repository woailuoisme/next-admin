"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";

import { SPARKLINE_TREND_KEYS } from "@/components/shared/sparkline/SparklineAreaFill";
import { SparklinePrimitive } from "@/components/shared/sparkline/SparklinePrimitive";
import { computeSparklineGeometry } from "@/components/shared/sparkline/sparklineEngine";
import { cn } from "cn";

import type { MetricSparklineProps } from "./types";

export function MetricSparkline({
	data,
	width = 100,
	height = 32,
	color,
	trendColor = false,
	curve = "monotone",
	fill = true,
	strokeWidth = 2,
	showEndpointDot = true,
	showMinMaxDots = false,
	className,
	ariaLabel,
}: MetricSparklineProps) {
	const t = useTranslations("chart");
	const rawGradId = useId();
	const gradId = `metric-spark-${rawGradId.replace(/:/g, "")}`;
	const viewBoxWidth = 100;
	const viewBoxHeight = 32;

	const geometry = computeSparklineGeometry({
		data,
		variant: "area",
		curve,
		width: viewBoxWidth,
		height: viewBoxHeight,
		padding: 3,
	});

	if (!geometry.linePath) {
		return (
			<div
				className={cn("inline-flex items-center justify-center text-xs text-muted-foreground", className)}
				style={{ width, height }}
			>
				-
			</div>
		);
	}

	const activeColor = trendColor
		? geometry.trend === "up"
			? "var(--chart-2)"
			: geometry.trend === "down"
				? "var(--destructive)"
				: "var(--muted-foreground)"
		: color || "var(--primary)";

	const defaultLabel = t("sparkline_aria_label", {
		first: geometry.first,
		last: geometry.last,
		trend: t(SPARKLINE_TREND_KEYS[geometry.trend]),
	});

	return (
		<div
			className={cn("inline-flex shrink-0 items-center overflow-hidden", className)}
			style={{ width, height }}
			role="img"
			aria-label={ariaLabel || defaultLabel}
		>
			<SparklinePrimitive
				geometry={geometry}
				variant="area"
				viewBoxWidth={viewBoxWidth}
				viewBoxHeight={viewBoxHeight}
				preserveAspectRatio="none"
				svgClassName="h-full w-full"
				color={activeColor}
				gradientId={gradId}
				strokeWidth={strokeWidth}
				showArea={fill}
				showMinMaxDots={showMinMaxDots}
				minMaxRadius={2.5}
				showEndpointDot={showEndpointDot}
				endpointRadius={2.5}
			/>
		</div>
	);
}
