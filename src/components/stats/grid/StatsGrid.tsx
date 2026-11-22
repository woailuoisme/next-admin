"use client";

import { cn } from "cn";

import type { StatsGridProps } from "./types";

import { StatCardSkeleton } from "../primitives/StatCardSkeleton";
import { COLUMN_MAP } from "./constants";
import { StatsGridContext } from "./StatsGridContext";

export function StatsGrid({
	children,
	columns = 4,
	density = "compact",
	sparklineLayout = "inline",
	isLoading = false,
	skeletonCount,
	skeletonVariant = "default",
	hasSparkline = false,
	className,
}: StatsGridProps) {
	const count = skeletonCount ?? columns;
	const contextValue = { density, sparklineLayout };

	return (
		<StatsGridContext value={contextValue}>
			<div className="@container/grid">
				<div className={cn("grid gap-4", COLUMN_MAP[columns], className)}>
					{isLoading
						? Array.from({ length: count }).map((_, idx) => (
								<StatCardSkeleton
									key={`skeleton-card-${idx}`}
									variant={skeletonVariant}
									density={density}
									sparklineLayout={sparklineLayout}
									hasSparkline={hasSparkline}
								/>
							))
						: children}
				</div>
			</div>
		</StatsGridContext>
	);
}
