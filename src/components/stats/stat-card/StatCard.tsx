"use client";

import { hasFiniteSparklinePoints } from "@/components/shared/sparkline/sparklineEngine";
import { cn } from "cn";

import {
	DENSITY_STYLES,
	StatCardHeadline,
	StatCardRoot,
	StatCardSkeleton,
	StatCardSparkline,
	StatCardTrend,
	StatCardValue,
	useStatCardContext,
} from "../primitives";
import type { StatCardProps } from "./types";

interface StatCardFooterMetricsProps {
	trend: StatCardProps["trend"];
	sparklineData: StatCardProps["sparklineData"];
	sparklineType: NonNullable<StatCardProps["sparklineType"]>;
	theme: NonNullable<StatCardProps["theme"]>;
}

function StatCardFooterMetrics({ trend, sparklineData, sparklineType, theme }: StatCardFooterMetricsProps) {
	const { density, sparklineLayout } = useStatCardContext();
	const dStyles = DENSITY_STYLES[density] ?? DENSITY_STYLES.compact;
	const hasTrend = Boolean(trend);
	const hasSparkline = hasFiniteSparklinePoints(sparklineData);

	if (!hasTrend && !hasSparkline) {
		return null;
	}

	return (
		<div
			className={cn(
				sparklineLayout === "bottom" ? "flex flex-col gap-2" : "flex items-center justify-between gap-2.5",
				dStyles.trendSpacing,
			)}
		>
			{hasTrend ? <StatCardTrend trend={trend} /> : null}
			{hasSparkline ? <StatCardSparkline data={sparklineData} type={sparklineType} theme={theme} /> : null}
		</div>
	);
}

export function StatCard({
	title,
	value,
	prefix,
	suffix,
	description,
	icon,
	theme = "primary",
	trend,
	sparklineData,
	sparklineType = "area",
	sparklineLayout,
	density,
	badge,
	actions,
	copyable,
	copyText,
	animated,
	formatter,
	formatOptions,
	to,
	linkLabel,
	onClick,
	isLoading = false,
	className,
}: StatCardProps) {
	if (isLoading) {
		return (
			<StatCardSkeleton
				density={density}
				sparklineLayout={sparklineLayout}
				hasSparkline={hasFiniteSparklinePoints(sparklineData)}
				className={className}
			/>
		);
	}

	return (
		<StatCardRoot
			density={density}
			sparklineLayout={sparklineLayout}
			theme={theme}
			to={to}
			linkLabel={linkLabel ?? title}
			onClick={onClick}
			className={className}
		>
			{/* Top row: Title + Tooltip & Icon + Actions + Badge */}
			<StatCardHeadline
				title={title}
				description={description}
				badge={badge}
				actions={actions}
				icon={icon}
				theme={theme}
			/>

			{/* Middle row: Metric Value */}
			<StatCardValue
				value={value}
				prefix={prefix}
				suffix={suffix}
				formatter={formatter}
				formatOptions={formatOptions}
				copyable={copyable}
				copyText={copyText}
				animated={animated}
			/>

			{/* Bottom row / Sparkline */}
			<StatCardFooterMetrics trend={trend} sparklineData={sparklineData} sparklineType={sparklineType} theme={theme} />
		</StatCardRoot>
	);
}
