"use client";

import { useTranslations } from "next-intl";
import { memo } from "react";

export interface HeatmapLegendProps {
	legendTitle?: string;
	stops: Array<[number, string]>;
	maxIntensity?: number;
}

export const HeatmapLegend = memo(function HeatmapLegend({ legendTitle, stops, maxIntensity = 1 }: HeatmapLegendProps) {
	const t = useTranslations("map");
	const title = legendTitle ?? t("heatmap_legend_default");
	const visibleStops = stops.filter((_, idx) => idx > 0);
	const gradientString = visibleStops.map(([s, c]) => `${c} ${Math.round(s * 100)}%`).join(", ");

	const safeMax = Number.isFinite(maxIntensity) && maxIntensity > 0 ? maxIntensity : 1;
	const formatTick = (val: number) => (Number.isInteger(val) ? String(val) : val.toFixed(1));

	return (
		<div className="border-border bg-card/90 pointer-events-auto absolute bottom-3 left-3 z-10 w-52 rounded-xl border p-3 shadow-md backdrop-blur-md">
			<div className="text-foreground mb-2 text-xs font-medium">{title}</div>
			<div
				role="img"
				aria-label={title}
				className="border-border/40 mb-1.5 h-2.5 w-full rounded-full border shadow-inner"
				style={{
					background: visibleStops.length > 0 ? `linear-gradient(to right, ${gradientString})` : "transparent",
				}}
			/>
			<div className="text-muted-foreground flex justify-between text-[10px] font-medium tabular-nums">
				<span>{t("heatmap_scale_low")}</span>
				<span>{formatTick(safeMax * 0.5)}</span>
				<span>
					{t("heatmap_scale_high")} ({formatTick(safeMax)})
				</span>
			</div>
		</div>
	);
});
