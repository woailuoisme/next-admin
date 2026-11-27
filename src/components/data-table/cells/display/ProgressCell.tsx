import { clamp, isNil } from "es-toolkit";
import { useTranslations } from "next-intl";

import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

import type { ProgressCellProps } from "./types";

import { JUSTIFY_ALIGN_CLASSES } from "../base";

const heightClasses = {
	sm: "h-1.5",
	md: "h-2",
};

function TargetMarker({ percentage }: { percentage?: number }) {
	if (typeof percentage !== "number") return null;
	return (
		<div
			style={{ left: `${percentage}%` }}
			className="bg-foreground absolute -top-0.5 -bottom-0.5 z-10 w-0.5 -translate-x-1/2 rounded-full shadow-xs"
			aria-hidden="true"
		/>
	);
}

function getIndicatorColorClass(colorByValue: boolean, percentage: number): string | undefined {
	if (!colorByValue) return undefined;
	if (percentage >= 80) return "[&>[data-slot=progress-indicator]]:bg-chart-2";
	if (percentage >= 40) return "[&>[data-slot=progress-indicator]]:bg-chart-4";
	return "[&>[data-slot=progress-indicator]]:bg-destructive";
}

export function ProgressCell({
	value,
	max = 100,
	showLabel = true,
	showPercentage,
	showValue,
	size = "sm",
	colorByValue = false,
	segments,
	target,
	targetLabel,
	align = "left",
	className,
}: ProgressCellProps) {
	const t = useTranslations("table");
	const safeMax = typeof max === "number" && Number.isFinite(max) && max > 0 ? max : 100;
	const shouldShowLabel = showPercentage ?? showValue ?? showLabel;

	// 1. 多段堆叠进度条模式
	if (segments && segments.length > 0) {
		const totalVal = segments.reduce((sum, s) => sum + Math.max(0, Number.isFinite(s.value) ? s.value : 0), 0);
		const effectiveMax = safeMax;
		const totalPercentage = Math.min(100, Math.round((totalVal / effectiveMax) * 100));

		const targetPct =
			typeof target === "number" && Number.isFinite(target)
				? Math.min(100, Math.max(0, (target / effectiveMax) * 100))
				: undefined;

		const stackedContent = (
			<div
				className={cn(
					"flex w-full max-w-[200px] min-w-[90px] items-center gap-2",
					JUSTIFY_ALIGN_CLASSES[align],
					className,
				)}
			>
				<div className="relative min-w-[50px] flex-1">
					<div
						role="progressbar"
						aria-label={t("aria_progress")}
						aria-valuenow={totalPercentage}
						aria-valuemin={0}
						aria-valuemax={100}
						className={cn("relative flex w-full overflow-hidden rounded-full bg-muted/80", heightClasses[size])}
					>
						{segments.map((seg, idx) => {
							const segPct = effectiveMax > 0 ? (Math.max(0, seg.value) / effectiveMax) * 100 : 0;
							if (segPct <= 0) return null;

							return (
								<div
									key={idx}
									style={{ width: `${segPct}%` }}
									className={cn("h-full transition-all", seg.color || seg.className || "bg-primary")}
								/>
							);
						})}
					</div>

					<TargetMarker percentage={targetPct} />
				</div>

				{shouldShowLabel ? (
					<span className="text-muted-foreground w-8 shrink-0 text-right font-mono text-[11px] tabular-nums">
						{totalPercentage}%
					</span>
				) : null}
			</div>
		);

		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="w-full cursor-default">{stackedContent}</div>
				</TooltipTrigger>
				<TooltipContent side="top" className="flex flex-col gap-1 text-xs">
					<div className="font-mono text-[11px] font-medium">
						{t("progress_total", { total: totalVal, max: effectiveMax, percent: totalPercentage })}
					</div>
					<div className="flex flex-col gap-0.5 pt-0.5">
						{segments.map((seg, idx) => {
							const pct = Math.round((seg.value / (effectiveMax || 1)) * 100);
							return (
								<div key={idx} className="text-muted-foreground flex items-center gap-1.5 text-[10px]">
									<span className={cn("size-1.5 shrink-0 rounded-full", seg.color || seg.className || "bg-primary")} />
									<span>{seg.label || t("progress_segment", { index: idx + 1 })}:</span>
									<span className="text-foreground font-mono font-medium">
										{seg.value} ({pct}%)
									</span>
								</div>
							);
						})}
						{typeof target === "number" && Number.isFinite(target) ? (
							<div className="border-border/50 text-primary border-t pt-0.5 text-[10px]">
								{targetLabel || t("progress_target", { target, percent: Math.round(targetPct ?? 0) })}
							</div>
						) : null}
					</div>
				</TooltipContent>
			</Tooltip>
		);
	}

	// 2. 单一进度条模式
	if (isNil(value) || !Number.isFinite(value)) {
		return <span className="text-muted-foreground/40 text-xs italic">-</span>;
	}

	const safeValue = clamp(value, 0, safeMax);
	const percentage = Math.round((safeValue / safeMax) * 100);

	const indicatorColorClass = getIndicatorColorClass(colorByValue, percentage);

	const targetPct =
		typeof target === "number" && Number.isFinite(target)
			? Math.min(100, Math.max(0, (target / safeMax) * 100))
			: undefined;

	const content = (
		<div
			className={cn(
				"flex w-full max-w-[180px] min-w-[80px] items-center gap-2.5",
				JUSTIFY_ALIGN_CLASSES[align],
				className,
			)}
		>
			<div className="relative min-w-[50px] flex-1">
				<Progress
					value={percentage}
					className={cn(heightClasses[size], "overflow-hidden rounded-full bg-muted/80", indicatorColorClass)}
				/>
				<TargetMarker percentage={targetPct} />
			</div>

			{shouldShowLabel ? (
				<span className="text-muted-foreground w-8 shrink-0 text-right font-mono text-[11px] tabular-nums">
					{percentage}%
				</span>
			) : null}
		</div>
	);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="w-full cursor-default">{content}</div>
			</TooltipTrigger>
			<TooltipContent side="top" className="font-mono text-xs">
				<p>
					{safeValue} / {safeMax} ({percentage}%)
				</p>
				{typeof target === "number" && Number.isFinite(target) ? (
					<p className="text-muted-foreground mt-0.5 text-[10px]">
						{targetLabel || t("progress_target", { target, percent: Math.round(targetPct ?? 0) })}
					</p>
				) : null}
			</TooltipContent>
		</Tooltip>
	);
}
