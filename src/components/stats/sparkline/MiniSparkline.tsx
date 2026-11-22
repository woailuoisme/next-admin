"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";

import { SPARKLINE_TREND_KEYS } from "@/components/shared/sparkline/SparklineAreaFill";
import { SparklinePrimitive } from "@/components/shared/sparkline/SparklinePrimitive";
import { computeSparklineGeometry } from "@/components/shared/sparkline/sparklineEngine";
import { cn } from "cn";

import type { SparklineProps } from "./types";

import { getStatTheme } from "../shared/theme";

const DEFAULT_COLOR = "var(--primary)";

export function MiniSparkline({
	data,
	theme,
	color,
	gradientId: customGradientId,
	type = "area",
	width = 100,
	height = 32,
	strokeWidth = 2,
	className,
	ariaLabel,
	decorative = true,
}: SparklineProps) {
	const t = useTranslations("chart");
	const rawId = useId();
	const generatedId = `spark-grad-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
	const sanitizedCustomId = customGradientId?.replace(/[^a-zA-Z0-9_-]/g, "");
	const gradientId = sanitizedCustomId || generatedId;

	const safeWidth = Number.isFinite(width) && width > 0 ? width : 100;
	const safeHeight = Number.isFinite(height) && height > 0 ? height : 32;
	const resolvedColor = color ?? (theme ? getStatTheme(theme).strokeColor : DEFAULT_COLOR);

	const geometry = computeSparklineGeometry({
		data,
		variant: type,
		curve: "monotone",
		width: safeWidth,
		height: safeHeight,
		padding: 2,
	});

	if (geometry.isEmpty) return null;

	const isAccessible = Boolean(ariaLabel) || decorative === false;
	const computedAriaLabel = isAccessible
		? ariaLabel ||
			t("sparkline_aria_label", {
				first: geometry.first,
				last: geometry.last,
				trend: t(SPARKLINE_TREND_KEYS[geometry.trend]),
			})
		: undefined;

	return (
		<SparklinePrimitive
			geometry={geometry}
			variant={type}
			svgHeight={safeHeight}
			viewBoxWidth={safeWidth}
			viewBoxHeight={safeHeight}
			preserveAspectRatio="none"
			svgClassName={cn("w-full", className)}
			color={resolvedColor}
			gradientId={gradientId}
			strokeWidth={strokeWidth}
			nonScalingStroke
			areaOpacity={0.35}
			role={isAccessible ? "img" : undefined}
			ariaLabel={computedAriaLabel}
			ariaHidden={isAccessible ? undefined : true}
		/>
	);
}

export const Sparkline = MiniSparkline;
