"use client";

import { useLocale } from "next-intl";
import * as React from "react";

import { COL_SPAN_CLASSES, type ColSpan } from "@/components/shared/grid";
import { Separator } from "@/components/ui/separator";
import { cn } from "cn";

export interface SummaryLineItem {
	label: React.ReactNode;
	value: number | string;
	format?: "currency" | "number" | "text";
}

export interface SummaryEntryProps {
	items: readonly SummaryLineItem[];
	total?: SummaryLineItem;
	currencyPrefix?: string;
	decimals?: number;
	hidden?: boolean;
	colSpan?: ColSpan;
	className?: string;
}

const SUMMARY_FORMATTER_CACHE = new Map<string, Intl.NumberFormat>();

function getSummaryNumberFormatter(locale: string, decimals?: number): Intl.NumberFormat {
	const key = `${locale}:${decimals ?? ""}`;
	let formatter = SUMMARY_FORMATTER_CACHE.get(key);
	if (!formatter) {
		formatter =
			decimals !== undefined
				? new Intl.NumberFormat(locale || undefined, {
						minimumFractionDigits: decimals,
						maximumFractionDigits: decimals,
					})
				: new Intl.NumberFormat(locale || undefined);
		if (SUMMARY_FORMATTER_CACHE.size < 50) {
			SUMMARY_FORMATTER_CACHE.set(key, formatter);
		}
	}
	return formatter;
}

function formatSummaryValue(
	item: SummaryLineItem,
	locale: string,
	currencyPrefix: string,
	decimals: number,
): React.ReactNode {
	if (typeof item.value !== "number") return item.value;
	if (!Number.isFinite(item.value)) return "-";
	if (item.format === "number") return getSummaryNumberFormatter(locale).format(item.value);
	if (item.format === "text") return String(item.value);
	return `${currencyPrefix}${getSummaryNumberFormatter(locale, decimals).format(item.value)}`;
}

/**
 * Filament 风格详情账单/指标汇总卡片：
 * 统一渲染明细行与高亮总计行，消除业务 Infolist 内的手工财务卡片 JSX。
 */
export function SummaryEntry({
	items,
	total,
	currencyPrefix = "$",
	decimals = 2,
	hidden = false,
	colSpan,
	className,
}: SummaryEntryProps) {
	const locale = useLocale();

	if (hidden) return null;

	return (
		<div
			className={cn(
				"border-border/60 bg-muted/10 flex flex-col gap-1.5 rounded-lg border p-3 text-xs",
				colSpan ? COL_SPAN_CLASSES[colSpan] : undefined,
				className,
			)}
		>
			{items.map((item, idx) => (
				<div
					key={`${typeof item.label === "string" ? item.label : "node"}-${idx}`}
					className="text-muted-foreground flex justify-between gap-2"
				>
					<span>{item.label}</span>
					<span>{formatSummaryValue(item, locale, currencyPrefix, decimals)}</span>
				</div>
			))}
			{total ? (
				<>
					<Separator className="my-1" />
					<div className="text-foreground flex justify-between gap-2 pt-1 text-sm font-bold">
						<span>{total.label}</span>
						<span className="text-primary font-mono">
							{formatSummaryValue(total, locale, currencyPrefix, decimals)}
						</span>
					</div>
				</>
			) : null}
		</div>
	);
}
