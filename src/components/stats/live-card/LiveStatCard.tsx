"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Activity, Clock, RefreshCw } from "lucide-react";

import { hasFiniteSparklinePoints } from "@/components/shared/sparkline/sparklineEngine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

import type { LiveStatCardProps, LiveStatus } from "./types";

import { StatCardHeadline, StatCardIcon, StatCardRoot, StatCardSkeleton, StatCardValue } from "../primitives";
import { getStatTheme } from "../shared/theme";
import { MiniSparkline } from "../sparkline/MiniSparkline";
import { STATUS_CONFIG } from "./constants";

export function LiveStatCard({
	title,
	value,
	prefix,
	suffix,
	status = "online",
	statusText,
	lastUpdated,
	isStale = false,
	errorMessage,
	onRetry,
	liveAnnouncement = "polite",
	pulse = true,
	sparklineData,
	icon: Icon = Activity,
	theme = "primary",
	density,
	description,
	badge,
	to,
	linkLabel,
	onClick,
	isLoading = false,
	className,
}: LiveStatCardProps) {
	const t = useTranslations("stats");
	const format = useFormatter();
	const themeConfig = getStatTheme(theme);

	if (isLoading) {
		return <StatCardSkeleton variant="live" density={density} className={className} />;
	}

	const effectiveStatus: LiveStatus = errorMessage
		? "error"
		: isStale && status !== "offline" && status !== "error"
			? "stale"
			: status;
	const statusCfg = STATUS_CONFIG[effectiveStatus] ?? STATUS_CONFIG.online;
	const resolvedStatusLabel = statusText ?? t(statusCfg.labelKey);

	const hasSparkline = hasFiniteSparklinePoints(sparklineData);
	const shouldPulse = pulse && effectiveStatus !== "offline" && effectiveStatus !== "stale" && !errorMessage;
	const fallbackStatusLabel = effectiveStatus === "offline" ? t("live_paused") : t("live_updating");

	let formattedLastUpdated: string;
	if (lastUpdated instanceof Date || typeof lastUpdated === "number") {
		const timestamp = lastUpdated instanceof Date ? lastUpdated : new Date(lastUpdated);
		formattedLastUpdated = Number.isNaN(timestamp.getTime())
			? fallbackStatusLabel
			: t("last_updated", {
					time: format.dateTime(timestamp, {
						hour: "2-digit",
						minute: "2-digit",
						second: "2-digit",
					}),
				});
	} else {
		formattedLastUpdated = lastUpdated || fallbackStatusLabel;
	}

	return (
		<StatCardRoot
			density={density}
			theme={theme}
			to={to}
			linkLabel={linkLabel ?? title}
			onClick={onClick}
			className={className}
		>
			<StatCardHeadline
				title={title}
				description={description}
				badge={badge}
				trailing={
					<Badge
						variant="outline"
						className={cn(
							"inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
							statusCfg.badgeClass,
						)}
					>
						<span className="relative flex size-2" aria-hidden="true">
							{shouldPulse ? (
								<span
									className={cn(
										"absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:animate-none",
										statusCfg.pingClass,
									)}
								/>
							) : null}
							<span className={cn("relative inline-flex size-2 rounded-full", statusCfg.dotClass)} />
						</span>
						<span>{resolvedStatusLabel}</span>
					</Badge>
				}
			/>

			{/* Middle Row: Numeric Value + Icon Badge */}
			<div className="flex items-baseline justify-between gap-3">
				<div
					className="min-w-0 flex-1"
					aria-live={liveAnnouncement === "off" ? undefined : "polite"}
					aria-atomic="true"
				>
					<StatCardValue value={value} prefix={prefix} suffix={suffix} />
				</div>
				{Icon ? <StatCardIcon icon={Icon} theme={theme} /> : null}
			</div>

			{/* Optional Error + Retry Telemetry Slot */}
			{errorMessage || onRetry ? (
				<div className="flex items-center justify-between gap-2 text-xs">
					<span
						role={errorMessage ? "alert" : undefined}
						className="text-destructive min-w-0 truncate"
						title={errorMessage}
					>
						{errorMessage}
					</span>
					{onRetry ? (
						<Button
							type="button"
							variant="outline"
							size="xs"
							className="relative z-10 h-6 shrink-0 gap-1 px-2 text-xs"
							onClick={(e) => {
								e.stopPropagation();
								onRetry();
							}}
						>
							<RefreshCw className="size-3.5" aria-hidden="true" />
							<span>{t("retry")}</span>
						</Button>
					) : null}
				</div>
			) : null}

			{/* Bottom Row: Last updated + Live Sparkline */}
			<div className="border-border/40 text-muted-foreground flex items-center justify-between gap-3 border-t pt-1 text-xs">
				<div className="flex min-w-0 items-center gap-1">
					<Clock className="size-3.5 shrink-0" aria-hidden="true" />
					<span className="truncate tabular-nums">{formattedLastUpdated}</span>
				</div>

				{hasSparkline && sparklineData ? (
					<div className="w-24 shrink-0">
						<MiniSparkline data={sparklineData} color={themeConfig.strokeColor} height={28} className="h-7" />
					</div>
				) : null}
			</div>
		</StatCardRoot>
	);
}
