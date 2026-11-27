"use client";

import { useTranslations } from "next-intl";

import dynamic from "next/dynamic";
import { AlertCircle, Maximize2, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "cn";

import type { ChartCardProps, ChartPeriodOption } from "./types";

import { ChartProvider } from "../shared/ChartContext";
import { ChartEmptyState } from "../shared/ChartEmptyState";
import { ChartSkeleton } from "../shared/ChartSkeleton";
import type { MessageKeyOf } from "@/types/i18n";

const ChartFullscreenDialog = dynamic(
	() => import("./ChartFullscreenDialog").then((mod) => mod.ChartFullscreenDialog),
	{ ssr: false },
);

const EMPTY_PERIODS: ChartPeriodOption[] = [];

const PERIOD_KEY_MAP: Record<string, MessageKeyOf<"chart">> = {
	"7D": "period_7d",
	"30D": "period_30d",
	"90D": "period_90d",
	"1Y": "period_1y",
	"12M": "period_year",
	day: "period_day",
	week: "period_week",
	month: "period_month",
	year: "period_year",
	all: "period_all",
};

export function ChartCard({
	title,
	description,
	periods,
	activePeriod,
	onPeriodChange,
	actionSlot,
	legendSlot,
	footerSlot,
	height = 300,
	isLoading = false,
	isEmpty = false,
	emptyMessage,
	errorMessage,
	onRetry,
	skeletonVariant = "trend",
	className,
	children,
	showFullscreen = false,
	fullscreenHeight = 500,
}: ChartCardProps) {
	const t = useTranslations("chart");
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [hasOpenedFullscreen, setHasOpenedFullscreen] = useState(false);
	const handleOpenFullscreen = () => {
		setHasOpenedFullscreen(true);
		setIsFullscreen(true);
	};

	// Normalize periods to ChartPeriodOption[]
	const normalizedPeriods: ChartPeriodOption[] = !periods?.length
		? EMPTY_PERIODS
		: periods.map((p) => {
				if (typeof p === "string") {
					const i18nKey = PERIOD_KEY_MAP[p];
					return { label: i18nKey ? t(i18nKey) : p, value: p };
				}
				return p;
			});

	const currentPeriod = activePeriod ?? normalizedPeriods[0]?.value;

	return (
		<>
			<Card className={cn("flex flex-col overflow-hidden shadow-xs", className)}>
				<CardHeader className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex min-w-0 flex-col gap-1">
						<CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
						{description && <CardDescription className="text-muted-foreground text-xs">{description}</CardDescription>}
					</div>

					<div className="flex shrink-0 flex-wrap items-center gap-1.5">
						{legendSlot}

						{normalizedPeriods.length > 0 && (
							<Tabs value={currentPeriod} onValueChange={onPeriodChange}>
								<TabsList>
									{normalizedPeriods.map((opt) => (
										<TabsTrigger key={opt.value} value={opt.value} className="px-2.5 text-xs">
											{opt.label}
										</TabsTrigger>
									))}
								</TabsList>
							</Tabs>
						)}

						{actionSlot}

						{showFullscreen && (
							<Button
								type="button"
								variant="outline"
								size="icon"
								onClick={handleOpenFullscreen}
								disabled={isLoading || isEmpty}
								className="text-muted-foreground hover:text-foreground"
								title={t("fullscreen_title")}
								aria-label={t("fullscreen_title")}
							>
								<Maximize2 aria-hidden="true" />
							</Button>
						)}
					</div>
				</CardHeader>

				<CardContent className={cn("min-w-0 flex-1 pt-2", !footerSlot && "pb-5")}>
					{isLoading ? (
						<ChartSkeleton height={height} variant={skeletonVariant} />
					) : errorMessage ? (
						<Empty role="alert" style={{ minHeight: height }} className="border-0 p-6">
							<EmptyHeader>
								<EmptyMedia variant="icon" className="bg-destructive/10 text-destructive rounded-full">
									<AlertCircle aria-hidden="true" />
								</EmptyMedia>
								<EmptyTitle className="text-destructive">{errorMessage}</EmptyTitle>
							</EmptyHeader>
							{onRetry && (
								<EmptyContent>
									<Button type="button" variant="outline" size="sm" onClick={onRetry}>
										<RefreshCw data-icon="inline-start" aria-hidden="true" />
										{t("retry")}
									</Button>
								</EmptyContent>
							)}
						</Empty>
					) : isEmpty ? (
						<ChartEmptyState message={emptyMessage} height={height} />
					) : (
						<div className="w-full min-w-0" style={{ minHeight: height }}>
							<ChartProvider height={height}>{children}</ChartProvider>
						</div>
					)}
				</CardContent>

				{footerSlot && <CardFooter>{footerSlot}</CardFooter>}
			</Card>

			{/* Fullscreen Focus Dialog (Lazy loaded on demand, preserved mounted after first open for exit animation) */}
			{showFullscreen && hasOpenedFullscreen && (
				<ChartFullscreenDialog
					open={isFullscreen}
					onOpenChange={setIsFullscreen}
					title={title}
					description={description}
					fullscreenHeight={fullscreenHeight}
				>
					{children}
				</ChartFullscreenDialog>
			)}
		</>
	);
}
