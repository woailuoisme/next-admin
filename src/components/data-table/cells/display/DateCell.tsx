import { format, formatDistanceToNow, isPast, isValid, parseISO } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import { isNil } from "es-toolkit";
import { AlertCircle, Calendar, Clock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

import type { DateCellProps } from "./types";

import { STACK_ALIGN_CLASSES, TEXT_ALIGN_CLASSES } from "../base";

function parseDate(value: Date | number | string): Date {
	if (value instanceof Date) return value;
	if (typeof value === "number") return new Date(value);
	return parseISO(value);
}

export function DateCell({
	value,
	format: formatStr = "yyyy-MM-dd HH:mm",
	relative = false,
	showTooltip = true,
	dualLine = false,
	primaryFormat = "relative",
	showIcon = false,
	overdueAlert = false,
	countdown = false,
	countdownPrefix,
	timezone,
	align = "left",
	className,
}: DateCellProps) {
	const locale = useLocale();
	const t = useTranslations("common");
	const dateLocale = locale === "zh" ? zhCN : enUS;

	if (isNil(value) || value === "") {
		return <span className="text-muted-foreground/40 text-xs italic">-</span>;
	}

	const parsedDate = parseDate(value);
	if (!isValid(parsedDate)) {
		return <span className="text-muted-foreground/40 text-xs italic">{t("invalid_date")}</span>;
	}

	const dateIsPast = isPast(parsedDate);
	const isOverdue = overdueAlert && dateIsPast;

	const exactFormatted = format(parsedDate, "yyyy-MM-dd HH:mm:ss", { locale: dateLocale });
	const customFormatted = format(parsedDate, formatStr, { locale: dateLocale });
	const relativeString = formatDistanceToNow(parsedDate, { addSuffix: true, locale: dateLocale });
	const countdownString = countdown
		? dateIsPast
			? t("countdown_expired")
			: `${countdownPrefix ?? t("countdown_prefix")}${formatDistanceToNow(parsedDate, { locale: dateLocale })}`
		: "";

	// 1. 双行同屏排版模式 (免悬停即可兼顾相对与绝对时间)
	if (dualLine) {
		const isRelativePrimary = primaryFormat === "relative";
		const primaryText = isRelativePrimary ? relativeString : customFormatted;
		const secondaryText = isRelativePrimary ? customFormatted : relativeString;

		return (
			<div className={cn("flex max-w-full flex-col leading-tight", STACK_ALIGN_CLASSES[align], className)}>
				<div
					className={cn(
						"flex items-center gap-1 text-xs",
						isOverdue ? "font-medium text-destructive" : "font-medium text-foreground",
					)}
				>
					{isOverdue ? (
						<span className="inline-flex shrink-0 animate-pulse" aria-hidden="true">
							<AlertCircle className="text-destructive size-3" />
						</span>
					) : (
						showIcon && <Calendar className="text-muted-foreground/60 size-3 shrink-0" />
					)}
					<span className="truncate">{primaryText}</span>
					{isOverdue ? (
						<span className="bg-destructive/10 text-destructive rounded-xs px-1 font-sans text-[9px]">
							{t("overdue")}
						</span>
					) : null}
					{countdown && !(isOverdue && dateIsPast) ? (
						<span
							className={cn(
								"rounded-xs px-1 font-sans text-[9px]",
								dateIsPast ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
							)}
						>
							{countdownString}
						</span>
					) : null}
				</div>

				<div className="text-muted-foreground/80 mt-0.5 flex items-center gap-1 font-mono text-[10px]">
					<span className="truncate">{secondaryText}</span>
					{timezone ? (
						<span className="bg-muted/60 text-muted-foreground/60 rounded-xs px-0.5 text-[9px]">{timezone}</span>
					) : null}
				</div>
			</div>
		);
	}

	// 2. 单行排版模式
	const displayString = relative ? relativeString : customFormatted;

	const content = (
		<div
			className={cn(
				"flex items-center gap-1.5 font-mono text-xs tracking-tight whitespace-nowrap",
				isOverdue ? "font-medium text-destructive" : "text-foreground/90",
				TEXT_ALIGN_CLASSES[align],
				className,
			)}
		>
			{isOverdue ? (
				<span className="inline-flex shrink-0 animate-pulse" aria-hidden="true">
					<AlertCircle className="text-destructive size-3" />
				</span>
			) : countdown ? (
				<Clock className="text-muted-foreground/60 size-3 shrink-0" />
			) : (
				showIcon && <Calendar className="text-muted-foreground/60 size-3 shrink-0" />
			)}
			<span className="truncate">{countdown ? countdownString : displayString}</span>
			{timezone && !countdown ? (
				<span className="bg-muted/60 text-muted-foreground/70 rounded-xs px-1 font-sans text-[10px]">{timezone}</span>
			) : null}
			{isOverdue ? (
				<span className="bg-destructive/10 text-destructive rounded-xs px-1 font-sans text-[10px]">{t("overdue")}</span>
			) : null}
		</div>
	);

	if (!showTooltip) {
		return content;
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="w-full cursor-default">{content}</div>
			</TooltipTrigger>
			<TooltipContent side="top" className="font-mono text-xs">
				<p>{exactFormatted}</p>
				{relative ? (
					<p className="text-muted-foreground mt-0.5 text-[10px]">
						{t("date_format_label")} {customFormatted}
					</p>
				) : null}
				{timezone ? (
					<p className="text-muted-foreground mt-0.5 text-[10px]">
						{t("date_timezone_label")} {timezone}
					</p>
				) : null}
				{isOverdue ? <p className="text-destructive mt-0.5 text-[10px] font-semibold">{t("overdue_hint")}</p> : null}
			</TooltipContent>
		</Tooltip>
	);
}
