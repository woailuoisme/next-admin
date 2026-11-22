"use client";

import { useTranslations } from "next-intl";

import { memo } from "react";

import { cn } from "cn";

import type { HorizontalBarChartProps } from "./types";

import { useChartHeight } from "../shared/ChartContext";
import { ChartEmptyState } from "../shared/ChartEmptyState";
import { useHorizontalBar } from "./useHorizontalBar";

export const HorizontalBarChart = memo(function HorizontalBarChart(props: HorizontalBarChartProps) {
	const { showPercentage = true, height, className } = props;
	const t = useTranslations("chart");
	const resolvedHeight = useChartHeight(height, 200);

	const { items, hasData, valueFormatter, percentageFormatter } = useHorizontalBar(props);

	if (!hasData) {
		return <ChartEmptyState message={t("empty_title")} height={resolvedHeight} className={className} />;
	}

	return (
		<div className={cn("w-full space-y-3", className)} style={{ minHeight: resolvedHeight }}>
			{items.map((item, idx) => {
				const Icon = item.icon;
				const rank = idx + 1;

				return (
					<div
						key={`${item.id ?? item.label}-${idx}`}
						className="hover:bg-muted/30 space-y-1.5 rounded-lg p-1.5 transition-colors"
					>
						{/* Top text line: Rank, Label, Value, Percentage */}
						<div className="flex items-center justify-between text-xs">
							<div className="flex min-w-0 items-center gap-2">
								{/* Rank number badge */}
								<span
									className={cn(
										"flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold",
										rank === 1 && "border border-primary/25 bg-primary/15 text-primary",
										rank === 2 && "border border-chart-1/30 bg-chart-1/15 text-chart-1",
										rank === 3 && "border border-chart-4/30 bg-chart-4/15 text-chart-4",
										rank > 3 && "border border-border/40 bg-muted text-muted-foreground",
									)}
								>
									{rank}
								</span>

								{Icon && <Icon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />}

								<span className="text-foreground truncate font-medium">{item.label}</span>

								{item.secondaryLabel && (
									<span className="text-muted-foreground/70 hidden truncate text-[11px] sm:inline">
										({item.secondaryLabel})
									</span>
								)}
							</div>

							<div className="ml-2 flex shrink-0 items-center gap-2.5">
								<span className="text-foreground font-mono font-semibold">{valueFormatter(item.value)}</span>
								{showPercentage && (
									<span className="text-muted-foreground w-12 text-right font-mono text-[11px]">
										{percentageFormatter(item.pct)}
									</span>
								)}
							</div>
						</div>

						{/* Progress Track */}
						<div
							className="bg-muted/60 h-2 w-full overflow-hidden rounded-full"
							role="progressbar"
							aria-label={item.label}
							aria-valuenow={Math.round(item.barPct)}
							aria-valuemin={0}
							aria-valuemax={100}
						>
							<div
								className="h-full rounded-full transition-all duration-500"
								style={{
									width: `${item.barPct <= 0 ? 0 : Math.min(100, Math.max(2, item.barPct))}%`,
									backgroundColor: item.color,
								}}
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
});
