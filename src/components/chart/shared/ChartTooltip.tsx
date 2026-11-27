"use client";

import type { CSSProperties, ReactNode } from "react";

import { cn } from "cn";

import { useChartFormatters } from "../hooks/useChartFormatters";

export interface ChartTooltipEntry {
	name?: string | number;
	value?: number | string | ReadonlyArray<number | string>;
	dataKey?: string | number | ((obj: unknown) => unknown);
	color?: string;
	stroke?: string;
	fill?: string;
	payload?: unknown;
}

export interface ChartTooltipRow {
	label?: string;
	value: string;
	color?: string;
	valueClassName?: string;
}

export interface ChartTooltipDetail {
	title?: string;
	color?: string;
	rows: ChartTooltipRow[];
}

export interface ChartTooltipSurfaceProps {
	title?: string | number;
	color?: string;
	className?: string;
	style?: CSSProperties;
	children: ReactNode;
}

/**
 * Shared glassmorphic tooltip shell reused across Recharts Tooltip content and SVG overlays.
 */
export function ChartTooltipSurface({ title, color, className, style, children }: ChartTooltipSurfaceProps) {
	return (
		<div
			className={cn(
				"animate-in border-border/80 bg-background/95 text-popover-foreground fade-in-50 zoom-in-95 rounded-lg border p-3 text-xs shadow-lg backdrop-blur-md transition-all duration-150 select-none",
				className,
			)}
			style={style}
		>
			{title !== undefined && title !== "" && (
				<div className="border-border/40 text-foreground mb-1.5 flex items-center gap-1.5 border-b pb-1 font-semibold">
					{color && <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />}
					<span>{title}</span>
				</div>
			)}
			<div className="flex flex-col gap-1">{children}</div>
		</div>
	);
}

export interface ChartTooltipProps {
	active?: boolean;
	payload?: ReadonlyArray<ChartTooltipEntry>;
	label?: string | number;
	valueFormatter?: (value: number) => string;
	titleFormatter?: (label: string | number) => string;
	hideLabel?: boolean;
	resolveDetail?: (payload: ReadonlyArray<ChartTooltipEntry>) => ChartTooltipDetail | null;
}

/**
 * Shared, high-performance memoized tooltip for Recharts visualizations.
 * Supports both default multi-series entries and custom single-entity detail resolvers.
 */
export function ChartTooltip({
	active,
	payload,
	label,
	valueFormatter,
	titleFormatter,
	hideLabel = false,
	resolveDetail,
}: ChartTooltipProps) {
	const { valueFormatter: resolvedValueFormatter } = useChartFormatters({ valueFormatter });

	if (!active || !payload?.length) {
		return null;
	}

	if (resolveDetail) {
		const detail = resolveDetail(payload);
		if (!detail) return null;

		return (
			<ChartTooltipSurface title={detail.title} color={detail.color}>
				{detail.rows.map((row, idx) => (
					<div key={`${row.label ?? idx}-${idx}`} className="flex items-center justify-between gap-4 py-0.5">
						{row.label ? (
							<div className="flex min-w-0 items-center gap-1.5">
								{row.color && <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />}
								<span className="text-muted-foreground">{row.label}:</span>
							</div>
						) : null}
						<span className={cn("text-foreground shrink-0 font-mono font-semibold tabular-nums", row.valueClassName)}>
							{row.value}
						</span>
					</div>
				))}
			</ChartTooltipSurface>
		);
	}

	const displayLabel = titleFormatter ? titleFormatter(label ?? "") : label;

	return (
		<ChartTooltipSurface title={!hideLabel && displayLabel !== undefined ? displayLabel : undefined}>
			{payload.map((entry, idx) => {
				const rawVal = Array.isArray(entry.value) ? entry.value[0] : entry.value;
				const val =
					rawVal === null || rawVal === undefined
						? "-"
						: typeof rawVal === "number"
							? resolvedValueFormatter(rawVal)
							: String(rawVal);
				const dotColor = entry.color || entry.stroke || entry.fill || "var(--primary)";
				const baseKey =
					typeof entry.dataKey === "function" ? String(entry.name ?? "") : String(entry.dataKey ?? entry.name ?? "");
				const itemKey = `${baseKey}-${idx}`;
				const itemName =
					entry.name !== undefined && entry.name !== ""
						? String(entry.name)
						: typeof entry.dataKey !== "function" && entry.dataKey !== undefined
							? String(entry.dataKey)
							: "";

				return (
					<div key={itemKey} className="flex items-center justify-between gap-4 py-0.5">
						<div className="flex min-w-0 items-center gap-1.5">
							<span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: dotColor }} />
							<span className="text-muted-foreground max-w-[120px] truncate capitalize">{itemName}</span>
						</div>
						<span className="text-foreground shrink-0 font-mono font-semibold tabular-nums">{val}</span>
					</div>
				);
			})}
		</ChartTooltipSurface>
	);
}

export function useChartDetailTooltip(
	resolveDetail: (payload: ReadonlyArray<ChartTooltipEntry>) => ChartTooltipDetail | null,
) {
	return (tooltipProps: { active?: boolean; payload?: ReadonlyArray<unknown>; label?: string | number }) => (
		<ChartTooltip
			active={tooltipProps.active}
			payload={tooltipProps.payload as ReadonlyArray<ChartTooltipEntry> | undefined}
			label={tooltipProps.label}
			resolveDetail={resolveDetail}
		/>
	);
}

export function createValueTooltipContent(valueFormatter?: (value: number) => string) {
	return function ValueTooltipContent(tooltipProps: {
		active?: boolean;
		payload?: ReadonlyArray<unknown>;
		label?: string | number;
	}) {
		return (
			<ChartTooltip
				active={tooltipProps.active}
				payload={tooltipProps.payload as ReadonlyArray<ChartTooltipEntry> | undefined}
				label={tooltipProps.label}
				valueFormatter={valueFormatter}
			/>
		);
	};
}
