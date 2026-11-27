import { isNil } from "es-toolkit";
import { type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

import type { RowActivationEvent } from "../../core/types";
import type { BadgeCellOption, BadgeCellProps, BadgeVariantType } from "./types";

import { JUSTIFY_ALIGN_CLASSES } from "../base";

// 与 InfolistCallout 的状态色约定保持一致：info→chart-1 / success→chart-2 / warning→chart-4
const semanticVariants: Record<string, string> = {
	success: "border-chart-2/30 bg-chart-2/10 text-chart-2",
	warning: "border-chart-4/30 bg-chart-4/10 text-chart-4",
	info: "border-chart-1/30 bg-chart-1/10 text-chart-1",
};

interface RenderSingleBadgeOptions {
	val: any;
	keyId: string;
	labelMap?: Record<string, BadgeCellOption | ReactNode>;
	variantMap?: Record<string, BadgeVariantType>;
	defaultVariant: BadgeVariantType;
	dot: boolean;
	pulse: boolean;
	density: "default" | "compact";
	DefaultIcon?: React.ComponentType<{ className?: string }>;
	onBadgeClick?: (value: any, event: RowActivationEvent) => void;
	className?: string;
}

function renderSingleBadge({
	val,
	keyId,
	labelMap,
	variantMap,
	defaultVariant,
	dot,
	pulse,
	density,
	DefaultIcon,
	onBadgeClick,
	className,
}: RenderSingleBadgeOptions) {
	const stringKey = String(val);
	const mappedOption = labelMap?.[stringKey];
	let labelText: ReactNode = val;
	let CellIcon = DefaultIcon;
	let showDot = dot || pulse;
	let showPulse = pulse;
	let resolvedVariant: BadgeVariantType = variantMap?.[stringKey] || defaultVariant;
	let customClass = "";

	if (mappedOption) {
		if (typeof mappedOption === "object" && "label" in mappedOption) {
			const opt = mappedOption as BadgeCellOption;
			labelText = opt.label;
			if (opt.variant) resolvedVariant = opt.variant;
			if (opt.icon) CellIcon = opt.icon;
			if (opt.pulse !== undefined) {
				showPulse = opt.pulse;
				if (opt.pulse) showDot = true;
			}
			if (opt.dot !== undefined) showDot = opt.dot;
			if (opt.className) customClass = opt.className;
		} else {
			labelText = mappedOption as React.ReactNode;
		}
	}

	const isSemantic = resolvedVariant in semanticVariants;
	const baseBadgeVariant = isSemantic
		? "outline"
		: (resolvedVariant as "default" | "secondary" | "destructive" | "outline");

	const isClickable = Boolean(onBadgeClick);

	return (
		<Badge
			key={keyId}
			variant={baseBadgeVariant}
			role={isClickable ? "button" : undefined}
			tabIndex={isClickable ? 0 : undefined}
			onKeyDown={
				isClickable
					? (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								e.stopPropagation();
								onBadgeClick?.(val, e);
							}
						}
					: undefined
			}
			onClick={
				isClickable
					? (e) => {
							e.stopPropagation();
							onBadgeClick?.(val, e);
						}
					: undefined
			}
			className={cn(
				density === "compact"
					? "h-4.5 shrink-0 gap-1 px-1.5 text-[10px] font-normal transition-all"
					: "h-5.5 shrink-0 gap-1.5 px-2 text-[11px] font-normal transition-all",
				isSemantic && semanticVariants[resolvedVariant],
				isClickable &&
					"cursor-pointer select-none hover:opacity-85 hover:shadow-2xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none active:scale-95",
				customClass,
				className,
			)}
		>
			{showDot ? (
				<span className="relative flex size-1.5 shrink-0 items-center justify-center">
					{showPulse ? (
						<span
							className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75"
							aria-hidden="true"
						/>
					) : null}
					<span className="relative inline-flex size-1.5 rounded-full bg-current" aria-hidden="true" />
				</span>
			) : null}
			{CellIcon ? (
				<span className="flex shrink-0 items-center justify-center">
					<CellIcon className="size-3" />
				</span>
			) : null}
			<span className="truncate">{labelText}</span>
		</Badge>
	);
}

export function BadgeCell({
	value,
	label,
	maxCount,
	labelMap,
	variantMap,
	dot = false,
	pulse = false,
	density = "default",
	icon: DefaultIcon,
	variant = "secondary",
	color,
	tooltip,
	onBadgeClick,
	align = "left",
	className,
}: BadgeCellProps) {
	const resolvedDefaultVariant = color ?? variant;
	const resolvedValue = value !== undefined ? value : label;
	if (isNil(resolvedValue)) {
		return <span className="text-muted-foreground/40 text-xs italic">-</span>;
	}

	const items = Array.isArray(resolvedValue) ? resolvedValue : [resolvedValue];
	if (items.length === 0) {
		return <span className="text-muted-foreground/40 text-xs italic">-</span>;
	}

	const visibleItems = typeof maxCount === "number" && maxCount > 0 ? items.slice(0, maxCount) : items;
	const hiddenCount = items.length - visibleItems.length;

	const content = (
		<div className={cn("flex flex-wrap items-center gap-1.5", JUSTIFY_ALIGN_CLASSES[align])}>
			{visibleItems.map((val, idx) =>
				renderSingleBadge({
					val,
					keyId: `${String(val)}-${idx}`,
					labelMap,
					variantMap,
					defaultVariant: resolvedDefaultVariant,
					dot,
					pulse,
					density,
					DefaultIcon,
					onBadgeClick,
					className,
				}),
			)}

			{hiddenCount > 0 ? (
				<Tooltip>
					<TooltipTrigger asChild>
						<Badge
							asChild
							variant="outline"
							className="text-muted-foreground h-5.5 cursor-pointer px-1.5 font-mono text-[10px]"
						>
							<button type="button">+{hiddenCount}</button>
						</Badge>
					</TooltipTrigger>
					<TooltipContent side="top" className="flex max-w-xs flex-wrap gap-1 p-2 text-xs">
						{items.map((val, idx) =>
							renderSingleBadge({
								val,
								keyId: `overflow-${String(val)}-${idx}`,
								labelMap,
								variantMap,
								defaultVariant: resolvedDefaultVariant,
								dot,
								pulse,
								density,
								DefaultIcon,
								onBadgeClick,
								className,
							}),
						)}
					</TooltipContent>
				</Tooltip>
			) : null}
		</div>
	);

	if (tooltip) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="w-full">{content}</div>
				</TooltipTrigger>
				<TooltipContent side="top" className="text-xs">
					{tooltip}
				</TooltipContent>
			</Tooltip>
		);
	}

	return content;
}
