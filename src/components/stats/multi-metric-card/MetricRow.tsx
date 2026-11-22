"use client";

import { useFormatter, useTranslations } from "next-intl";

import type { SubMetricItem } from "./types";

import { StatCardTrend } from "../primitives";

interface MetricRowProps {
	item: SubMetricItem;
}

export function MetricRow({ item }: MetricRowProps) {
	const format = useFormatter();
	const t = useTranslations("stats");

	const formattedValue =
		item.value === null || item.value === undefined
			? t("no_data")
			: typeof item.value === "number"
				? Number.isFinite(item.value)
					? format.number(item.value)
					: t("no_data")
				: item.value;

	return (
		<div className="border-border/30 bg-muted/40 flex flex-col justify-between space-y-1 rounded-lg border p-2">
			<span className="text-muted-foreground truncate text-[11px] font-medium">{item.label}</span>
			<div className="flex flex-wrap items-baseline justify-between gap-1">
				<span className="text-foreground min-w-0 truncate font-mono text-sm font-bold tabular-nums">
					{item.prefix}
					{formattedValue}
					{item.suffix}
				</span>
				{item.trend ? <StatCardTrend trend={item.trend} variant="inline" showLabel={false} /> : null}
			</div>
		</div>
	);
}
