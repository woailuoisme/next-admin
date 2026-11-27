import { isNil } from "es-toolkit";
import { Flame, Heart, Star, ThumbsUp } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "cn";

import type { RatingCellProps } from "./types";

import { JUSTIFY_ALIGN_CLASSES } from "../base";

const starSizes = {
	xs: "size-3",
	sm: "size-3.5",
	md: "size-4",
};

const iconComponents = {
	star: Star,
	heart: Heart,
	flame: Flame,
	thumb: ThumbsUp,
};

const defaultIconColors = {
	star: "text-chart-4 fill-chart-4",
	heart: "text-destructive fill-destructive",
	flame: "text-chart-3 fill-chart-3",
	thumb: "text-primary fill-primary",
};

export function RatingCell({
	value,
	max = 5,
	allowHalf = true,
	showScore = false,
	reviewCount,
	precision = 1,
	size = "sm",
	iconType = "star",
	activeColor,
	color,
	align = "left",
	className,
}: RatingCellProps) {
	const t = useTranslations("table");
	if (isNil(value) || !Number.isFinite(value)) {
		return <span className="text-muted-foreground/40 text-xs italic">-</span>;
	}

	const safeMax = typeof max === "number" && Number.isFinite(max) && max > 0 ? Math.floor(max) : 5;
	const clampedValue = Math.max(0, Math.min(value, safeMax));
	const starSizeClass = starSizes[size];
	const IconComp = iconComponents[iconType] || Star;
	const resolvedActiveColor = color || activeColor || defaultIconColors[iconType] || defaultIconColors.star;

	return (
		<div className={cn("flex items-center gap-1.5", JUSTIFY_ALIGN_CLASSES[align], className)} data-testid="rating-cell">
			<div
				className="flex items-center gap-0.5"
				role="img"
				aria-label={t("aria_rating", { value: Number(clampedValue.toFixed(precision)), max: safeMax })}
			>
				{Array.from({ length: safeMax }, (_, index) => {
					const starNumber = index + 1;
					const isFull = clampedValue >= starNumber;
					const isHalf = allowHalf && clampedValue >= starNumber - 0.5 && clampedValue < starNumber;

					if (isFull) {
						return (
							<IconComp
								key={index}
								className={cn(starSizeClass, "shrink-0 fill-current", resolvedActiveColor)}
								aria-hidden="true"
							/>
						);
					}

					if (isHalf) {
						return (
							<div key={index} className="relative inline-flex shrink-0">
								<IconComp
									className={cn(starSizeClass, "fill-transparent text-muted-foreground/30")}
									aria-hidden="true"
								/>
								<div className="absolute inset-0 w-1/2 overflow-hidden">
									<IconComp
										className={cn(starSizeClass, "shrink-0 fill-current", resolvedActiveColor)}
										aria-hidden="true"
									/>
								</div>
							</div>
						);
					}

					return (
						<IconComp
							key={index}
							className={cn(starSizeClass, "shrink-0 fill-transparent text-muted-foreground/30")}
							aria-hidden="true"
						/>
					);
				})}
			</div>

			{showScore && (
				<span className="text-foreground/80 font-mono text-xs font-semibold tabular-nums">
					{clampedValue.toFixed(precision)}
				</span>
			)}

			{reviewCount !== undefined && reviewCount !== null && (
				<span className="text-muted-foreground/70 font-sans text-[11px]">({reviewCount})</span>
			)}
		</div>
	);
}
