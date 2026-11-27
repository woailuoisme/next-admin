"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ComponentType, type KeyboardEvent, type MouseEvent, useState } from "react";

import { cn } from "cn";

import { type BaseInputProps, connectField, type FormFieldRenderProps } from "../core";

export interface RatingInputProps extends BaseInputProps {
	value?: number | null;
	defaultValue?: number | null;
	onChange?: (value: number | null) => void;
	onBlur?: () => void;
	count?: number;
	allowHalf?: boolean;
	allowClear?: boolean;
	tooltips?: string[];
	showScore?: boolean;
	size?: "sm" | "md" | "lg";
	icon?: ComponentType<{ className?: string }>;
}

type RatingExtraProps = Pick<
	RatingInputProps,
	"count" | "allowHalf" | "allowClear" | "tooltips" | "showScore" | "size" | "icon"
>;

const SIZE_MAP = {
	sm: "size-4",
	md: "size-5",
	lg: "size-6",
} as const;

const RATING_STAR_CLASSES = {
	empty: "text-muted-foreground/30 transition-colors",
	filled: "fill-chart-4 text-chart-4 transition-colors",
} as const;

function computePointerScore(starIndex: number, allowHalf: boolean, e: MouseEvent<HTMLElement>): number {
	if (!allowHalf || e.detail === 0) {
		return starIndex;
	}
	const rect = e.currentTarget.getBoundingClientRect();
	if (rect.width <= 0) {
		return starIndex;
	}
	const isLeftHalf = e.clientX - rect.left < rect.width / 2;
	return isLeftHalf ? starIndex - 0.5 : starIndex;
}

function RatingControl({
	id,
	value,
	onChange,
	onBlur,
	count = 5,
	allowHalf = false,
	allowClear = true,
	tooltips,
	showScore = false,
	size = "md",
	icon: CustomIcon = Star,
	disabled = false,
	readOnly = false,
	hasError,
	describedBy,
}: FormFieldRenderProps<number | null> & RatingExtraProps) {
	const t = useTranslations("form");
	const [hoverValue, setHoverValue] = useState<number | null>(null);

	const committedValue = typeof value === "number" && Number.isFinite(value) ? value : null;
	const activeValue = hoverValue ?? committedValue ?? 0;
	const iconSize = SIZE_MAP[size];

	const handleItemMouseMove = (index: number, e: MouseEvent<HTMLSpanElement>) => {
		if (disabled || readOnly) return;
		setHoverValue(computePointerScore(index, allowHalf, e));
	};

	const handleMouseLeave = () => {
		if (disabled || readOnly) return;
		setHoverValue(null);
	};

	const handleItemClick = (starIndex: number, e: MouseEvent<HTMLSpanElement>) => {
		if (disabled || readOnly) return;
		const score = computePointerScore(starIndex, allowHalf, e);
		if (allowClear && committedValue === score) {
			onChange(null);
			setHoverValue(null);
		} else {
			onChange(score);
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if (disabled || readOnly) return;
		const step = allowHalf ? 0.5 : 1;
		const current = committedValue ?? 0;

		if (e.key === "ArrowRight" || e.key === "ArrowUp") {
			e.preventDefault();
			onChange(Math.min(count, current + step));
		} else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
			e.preventDefault();
			const next = Math.max(0, current - step);
			onChange(next === 0 && allowClear ? null : next);
		} else if (e.key === "Home") {
			e.preventDefault();
			onChange(allowClear ? null : 0);
		} else if (e.key === "End") {
			e.preventDefault();
			onChange(count);
		} else if (e.key === "Escape" && allowClear) {
			e.preventDefault();
			onChange(null);
		}
	};

	const stars = Array.from({ length: count }, (_, i) => i + 1);
	const currentTooltip = tooltips && activeValue > 0 ? tooltips[Math.ceil(activeValue) - 1] : null;
	const committedTooltip =
		tooltips && committedValue && committedValue > 0 ? tooltips[Math.ceil(committedValue) - 1] : null;
	const valueText = committedTooltip ?? t("rating_of", { value: committedValue ?? 0, count });

	return (
		<div
			id={id}
			role="slider"
			aria-valuemin={0}
			aria-valuemax={count}
			aria-valuenow={committedValue ?? 0}
			aria-valuetext={valueText}
			aria-disabled={disabled || undefined}
			aria-readonly={readOnly || undefined}
			aria-invalid={hasError || undefined}
			aria-describedby={describedBy}
			tabIndex={disabled ? -1 : 0}
			onKeyDown={handleKeyDown}
			onBlur={onBlur}
			onMouseLeave={handleMouseLeave}
			className={cn(
				"focus-visible:ring-ring inline-flex items-center gap-2 rounded-lg py-1 outline-none focus-visible:ring-2",
				disabled && "pointer-events-none cursor-not-allowed opacity-50",
				readOnly && "cursor-default",
				hasError && "text-destructive",
			)}
		>
			<div className="flex items-center gap-1">
				{stars.map((starIndex) => {
					const fillPercentage = Math.max(0, Math.min(100, (activeValue - (starIndex - 1)) * 100));

					return (
						<span
							key={starIndex}
							role="presentation"
							title={t("rating_of", { value: starIndex, count })}
							onMouseMove={(e) => handleItemMouseMove(starIndex, e)}
							onClick={(e) => handleItemClick(starIndex, e)}
							className={cn(
								"relative inline-flex items-center justify-center p-0.5 transition-transform hover:scale-110 select-none",
								!disabled && !readOnly && "cursor-pointer",
							)}
						>
							<span className="relative inline-flex items-center justify-center">
								<CustomIcon className={cn(iconSize, RATING_STAR_CLASSES.empty)} aria-hidden="true" />

								{fillPercentage > 0 ? (
									<span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fillPercentage}%` }}>
										<CustomIcon className={cn(iconSize, RATING_STAR_CLASSES.filled)} aria-hidden="true" />
									</span>
								) : null}
							</span>
						</span>
					);
				})}
			</div>

			{showScore || currentTooltip ? (
				<span className="text-muted-foreground text-xs font-medium select-none">
					{currentTooltip ? (
						<span>{currentTooltip}</span>
					) : (
						<span>
							{activeValue} / {count}
						</span>
					)}
				</span>
			) : null}
		</div>
	);
}

export const RatingInput = connectField<number | null, RatingExtraProps>(RatingControl);
