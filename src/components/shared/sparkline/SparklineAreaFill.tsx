"use client";

import type { SparklineTrend } from "./sparklineEngine";

export const SPARKLINE_TREND_KEYS: Record<
	SparklineTrend,
	"sparkline_trend_up" | "sparkline_trend_down" | "sparkline_trend_neutral"
> = {
	up: "sparkline_trend_up",
	down: "sparkline_trend_down",
	neutral: "sparkline_trend_neutral",
};

interface SparklineAreaFillProps {
	gradientId: string;
	areaPath: string;
	color: string;
	stopOpacity?: number;
}

/**
 * Shared SVG gradient definitions and shaded area fill for sparkline charts.
 * Skips rendering <defs> when areaPath is empty (e.g. bar mode or single-point lines).
 */
export function SparklineAreaFill({ gradientId, areaPath, color, stopOpacity = 0.25 }: SparklineAreaFillProps) {
	if (!areaPath) {
		return null;
	}

	return (
		<>
			<defs>
				<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor={color} stopOpacity={stopOpacity} />
					<stop offset="100%" stopColor={color} stopOpacity={0} />
				</linearGradient>
			</defs>
			<path d={areaPath} fill={`url(#${gradientId})`} />
		</>
	);
}
