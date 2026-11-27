"use client";

import { useMemoizedFn } from "ahooks";
import { ArrowDownRight, ArrowUpRight, Check, Copy, Minus } from "lucide-react";
import { useFormatter, useTranslations, type NumberFormatOptions } from "next-intl";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { hasFiniteSparklinePoints } from "@/components/shared/sparkline/sparklineEngine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

import type { PacingStatus } from "../progress-card/types";
import { computeProgressStat, type ProgressStatResult } from "../progress-card/useProgressStat";
import { getStatTheme } from "../shared/theme";
import { resolveTrendInfo } from "../shared/trendEngine";
import type { SparklineLayout, StatCardTheme, StatDensity } from "../shared/types";
import { MiniSparkline } from "../sparkline/MiniSparkline";
import type { SparklinePoint, SparklineType } from "../sparkline/types";
import type { StatCardTrendData } from "../stat-card/types";
import { useStatCardContext } from "./StatCardRoot";
import { DENSITY_STYLES, type StatCardTrendProps, type StatCardValueProps } from "./types";
import { useNumberTween } from "./useNumberTween";

function TweenedValueDisplay({
	value,
	animated,
	formatter,
	formatOptions,
	noDataText,
	valueClassName,
}: {
	value?: number | string | null;
	animated: boolean;
	formatter?: (value: number | string) => ReactNode;
	formatOptions?: NumberFormatOptions;
	noDataText: string;
	valueClassName: string;
}) {
	const format = useFormatter();
	const isNumeric = typeof value === "number" && Number.isFinite(value);
	const animatedValue = useNumberTween(isNumeric ? value : 0, {
		enabled: animated && isNumeric,
	});

	const activeValue = animated && isNumeric ? animatedValue : value;

	let formattedContent: ReactNode;
	if (
		activeValue === null ||
		activeValue === undefined ||
		(typeof activeValue === "number" && !Number.isFinite(activeValue))
	) {
		formattedContent = noDataText;
	} else if (formatter) {
		formattedContent = formatter(activeValue);
	} else if (typeof activeValue === "number") {
		formattedContent = format.number(activeValue, formatOptions);
	} else {
		formattedContent = activeValue;
	}

	return (
		<span
			className={cn("min-w-0 truncate font-mono font-bold tracking-tight text-foreground tabular-nums", valueClassName)}
			title={
				typeof formattedContent === "string" || typeof formattedContent === "number"
					? String(formattedContent)
					: undefined
			}
		>
			{formattedContent}
		</span>
	);
}

export function StatCardValue({
	value,
	prefix,
	suffix,
	formatter,
	formatOptions,
	copyable = false,
	copyText,
	animated = false,
	density,
	className,
	children,
	...props
}: StatCardValueProps) {
	const context = useStatCardContext();
	const t = useTranslations("stats");
	const resolvedDensity = density ?? context.density ?? "compact";
	const dStyles = DENSITY_STYLES[resolvedDensity] ?? DENSITY_STYLES.compact;
	const [copied, setCopied] = useState(false);
	const copyResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(
		() => () => {
			if (copyResetTimerRef.current) clearTimeout(copyResetTimerRef.current);
		},
		[],
	);

	const resolvedCopyText =
		copyText ??
		(typeof value === "number"
			? Number.isFinite(value)
				? String(value)
				: ""
			: value !== undefined && value !== null
				? String(value)
				: "");
	const canCopy = copyable && resolvedCopyText.trim().length > 0;

	const handleCopy = useMemoizedFn(async (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		if (!resolvedCopyText.trim()) return;

		try {
			await navigator.clipboard.writeText(resolvedCopyText);
			setCopied(true);
			toast.success(t("copied_success"));
			if (copyResetTimerRef.current) clearTimeout(copyResetTimerRef.current);
			copyResetTimerRef.current = setTimeout(() => setCopied(false), 1500);
		} catch {
			toast.error(t("copied_failed"));
		}
	});

	return (
		<div className={cn("group/val flex min-w-0 items-baseline gap-1", className)} {...props}>
			{prefix ? (
				<span className={cn("shrink-0 font-semibold text-muted-foreground", dStyles.prefixText)}>{prefix}</span>
			) : null}

			{children !== undefined ? (
				<span
					className={cn(
						"min-w-0 truncate font-mono font-bold tracking-tight text-foreground tabular-nums",
						dStyles.valueText,
					)}
				>
					{children}
				</span>
			) : (
				<TweenedValueDisplay
					value={value}
					animated={animated}
					formatter={formatter}
					formatOptions={formatOptions}
					noDataText={t("no_data")}
					valueClassName={dStyles.valueText}
				/>
			)}

			{suffix ? (
				<span className={cn("ml-0.5 shrink-0 font-medium text-muted-foreground", dStyles.suffixText)}>{suffix}</span>
			) : null}

			{canCopy ? (
				<>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								className="text-muted-foreground/60 hover:bg-muted hover:text-foreground relative z-10 ml-1 shrink-0 cursor-pointer rounded opacity-70 transition-all focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/val:opacity-100"
								onClick={handleCopy}
								aria-label={t("copy_value")}
							>
								{copied ? (
									<Check className="animate-in text-primary zoom-in" aria-hidden="true" />
								) : (
									<Copy aria-hidden="true" />
								)}
							</Button>
						</TooltipTrigger>
						<TooltipContent side="top" className="px-1.5 py-0.5 text-[10px]">
							{copied ? t("copied") : t("click_to_copy")}
						</TooltipContent>
					</Tooltip>
					<span className="sr-only" aria-live="polite">
						{copied ? t("copied_success") : ""}
					</span>
				</>
			) : null}
		</div>
	);
}

export function StatCardTrend({
	trend,
	value,
	direction,
	tone,
	label,
	isPositiveGood,
	variant = "badge",
	showLabel = true,
	className,
	...props
}: StatCardTrendProps) {
	const t = useTranslations("stats");
	const format = useFormatter();

	const trendConfig = trend ?? (value !== undefined ? { value, direction, tone, label, isPositiveGood } : null);
	const trendInfo = resolveTrendInfo(trendConfig);

	if (!trendInfo) return null;

	const normalizedNumericValue =
		typeof trendInfo.displayValue === "number" && Number.isFinite(trendInfo.displayValue)
			? trendInfo.dir === "down" && trendInfo.displayValue > 0
				? -trendInfo.displayValue
				: trendInfo.displayValue
			: null;

	const formattedDisplay =
		typeof trendInfo.displayValue === "number"
			? normalizedNumericValue !== null
				? format.number(normalizedNumericValue, { signDisplay: "exceptZero" })
				: "--"
			: trendInfo.displayValue;

	const srDescription =
		trendInfo.dir === "neutral" ? t("trend_neutral") : t(trendInfo.srKey, { value: String(formattedDisplay) });

	const dirIcon =
		trendInfo.dir === "up" ? (
			<ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
		) : trendInfo.dir === "down" ? (
			<ArrowDownRight className="size-3.5 shrink-0" aria-hidden="true" />
		) : (
			<Minus className="size-3.5 shrink-0" aria-hidden="true" />
		);

	if (variant === "inline") {
		return (
			<div className={cn("inline-flex min-w-0 items-center gap-1", className)} {...props}>
				<span
					className={cn(
						"inline-flex shrink-0 items-center gap-0.5 font-mono text-[10px] font-medium tabular-nums",
						trendInfo.inlineColorClass,
					)}
				>
					{dirIcon}
					<span>{formattedDisplay}</span>
					<span className="sr-only">{srDescription}</span>
				</span>
				{showLabel && trendInfo.label ? (
					<span className="text-muted-foreground truncate text-[10px]" title={trendInfo.label}>
						{trendInfo.label}
					</span>
				) : null}
			</div>
		);
	}

	return (
		<div className={cn("flex min-w-0 items-center gap-1.5", className)} {...props}>
			<Badge
				variant="outline"
				className={cn(
					"inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] leading-tight font-medium tabular-nums",
					trendInfo.colorClass,
				)}
			>
				{dirIcon}
				<span>{formattedDisplay}</span>
				<span className="sr-only">{srDescription}</span>
			</Badge>
			{showLabel && trendInfo.label ? (
				<span className="text-muted-foreground truncate text-[11px]" title={trendInfo.label}>
					{trendInfo.label}
				</span>
			) : null}
		</div>
	);
}

export interface StatCardSparklineProps {
	data?: readonly (number | SparklinePoint)[];
	type?: SparklineType;
	layout?: SparklineLayout;
	theme?: StatCardTheme;
	density?: StatDensity;
	color?: string;
	height?: number;
	ariaLabel?: string;
	decorative?: boolean;
	className?: string;
}

export function StatCardSparkline({
	data,
	type = "area",
	layout,
	theme,
	density,
	color,
	height,
	ariaLabel,
	decorative,
	className,
}: StatCardSparklineProps) {
	const context = useStatCardContext();
	const resolvedLayout = layout ?? context.sparklineLayout ?? "inline";
	const resolvedDensity = density ?? context.density ?? "compact";
	const resolvedTheme = theme ?? context.theme ?? "primary";

	if (!data || !hasFiniteSparklinePoints(data)) return null;

	const themeConfig = getStatTheme(resolvedTheme);
	const dStyles = DENSITY_STYLES[resolvedDensity] ?? DENSITY_STYLES.compact;
	const sparkHeight = height ?? dStyles.sparklineHeight;
	const strokeColor = color ?? themeConfig.strokeColor;

	const sparkline = (
		<MiniSparkline
			data={data}
			color={strokeColor}
			type={type}
			height={sparkHeight}
			ariaLabel={ariaLabel}
			decorative={decorative}
			className={cn("w-full", className)}
		/>
	);

	if (resolvedLayout === "bottom") {
		return <div className="w-full pt-1">{sparkline}</div>;
	}

	return <div className="ml-auto w-20 shrink-0">{sparkline}</div>;
}

/** 进度节奏状态的静态国际化 Key 映射 */
const PACING_LABEL_KEYS: Record<PacingStatus, "pacing_ahead" | "pacing_on_track" | "pacing_behind"> = {
	ahead: "pacing_ahead",
	on_track: "pacing_on_track",
	behind: "pacing_behind",
};

export interface StatCardProgressProps {
	value?: number | string | null;
	targetValue?: number | string | null;
	progress?: number;
	pacingStatus?: PacingStatus;
	pacingLabel?: string;
	progressResult?: ProgressStatResult;
	prefix?: string;
	suffix?: string;
	trend?: StatCardTrendData;
	theme?: StatCardTheme;
	ariaLabel?: string;
	className?: string;
}

export function StatCardProgress({
	value = 0,
	targetValue,
	progress,
	pacingStatus,
	pacingLabel,
	progressResult,
	prefix,
	suffix,
	trend,
	theme,
	ariaLabel,
	className,
}: StatCardProgressProps) {
	const context = useStatCardContext();
	const t = useTranslations("stats");
	const format = useFormatter();
	const resolvedTheme = theme ?? context.theme ?? "primary";
	const themeConfig = getStatTheme(resolvedTheme);

	const { calculatedProgress, pacingInfo } =
		progressResult ??
		computeProgressStat({
			value: value ?? 0,
			targetValue,
			progress,
			pacingStatus,
			pacingLabel,
		});

	const hasTarget = targetValue !== undefined && targetValue !== null && String(targetValue).trim() !== "";
	const targetDisplay =
		typeof targetValue === "number" ? (Number.isFinite(targetValue) ? format.number(targetValue) : "0") : targetValue;

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<Progress
				value={calculatedProgress}
				data-value={calculatedProgress}
				data-state={calculatedProgress >= 100 ? "complete" : "loading"}
				aria-label={ariaLabel || t("target_label").replace(/:\s*$/, "")}
				aria-valuenow={calculatedProgress}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuetext={`${calculatedProgress}%`}
				className={cn("h-2 w-full", themeConfig.progressIndicator)}
			/>

			<div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
				<div className="tabular-nums">
					{hasTarget ? (
						<span>
							{t("target_label")}
							{prefix || ""}
							{targetDisplay}
							{suffix || ""}
						</span>
					) : null}
				</div>

				{pacingInfo ? (
					<Badge
						variant="outline"
						className={cn(
							"inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
							pacingInfo.colorClass,
						)}
					>
						<pacingInfo.PacingIcon className="size-3.5" aria-hidden="true" />
						<span>{pacingLabel || t(PACING_LABEL_KEYS[pacingInfo.status])}</span>
					</Badge>
				) : trend ? (
					<StatCardTrend trend={trend} showLabel={false} />
				) : null}
			</div>
		</div>
	);
}
