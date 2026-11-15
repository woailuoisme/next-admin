"use client";

import { useMemoizedFn } from "ahooks";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ComponentType, type KeyboardEvent, type MouseEvent, memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "cn";

import { type BaseInputProps, FormFieldEngine } from "../core";

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

interface RatingControlProps {
  id: string;
  value?: number | null;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  count?: number;
  allowHalf?: boolean;
  allowClear?: boolean;
  tooltips?: string[];
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
  readOnly?: boolean;
  hasError?: boolean;
  describedBy?: string;
}

const SIZE_MAP = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

const RATING_STAR_CLASSES = {
  empty: "text-muted-foreground/30 transition-colors",
  filled: "fill-chart-4 text-chart-4 transition-colors",
} as const;

const RatingControl = memo(function RatingControl({
  id,
  value = 0,
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
}: RatingControlProps) {
  const t = useTranslations("form");
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const activeValue = hoverValue ?? value ?? 0;
  const iconSize = SIZE_MAP[size];

  const handleItemMouseMove = useMemoizedFn((index: number, e: MouseEvent<HTMLButtonElement>) => {
    if (disabled || readOnly) return;
    if (allowHalf) {
      const rect = e.currentTarget.getBoundingClientRect();
      const isLeftHalf = e.clientX - rect.left < rect.width / 2;
      setHoverValue(isLeftHalf ? index - 0.5 : index);
    } else {
      setHoverValue(index);
    }
  });

  const handleMouseLeave = useMemoizedFn(() => {
    if (disabled || readOnly) return;
    setHoverValue(null);
  });

  const handleClick = useMemoizedFn((score: number) => {
    if (disabled || readOnly) return;
    if (allowClear && value === score) {
      onChange(null);
      setHoverValue(null);
    } else {
      onChange(score);
    }
  });

  const handleKeyDown = useMemoizedFn((e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || readOnly) return;
    const step = allowHalf ? 0.5 : 1;
    const current = value ?? 0;

    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(count, current + step);
      onChange(next);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(0, current - step);
      onChange(next === 0 && allowClear ? null : next);
    } else if (e.key === "Escape" && allowClear) {
      e.preventDefault();
      onChange(null);
    }
  });

  const stars = Array.from({ length: count }, (_, i) => i + 1);
  const currentTooltip = tooltips && activeValue > 0 ? tooltips[Math.ceil(activeValue) - 1] : null;

  return (
    <div
      id={id}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={count}
      aria-valuenow={activeValue}
      aria-disabled={disabled}
      aria-readonly={readOnly}
      aria-invalid={hasError}
      aria-describedby={describedBy}
      tabIndex={disabled || readOnly ? -1 : 0}
      onKeyDown={handleKeyDown}
      onBlur={onBlur}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "inline-flex items-center gap-2 rounded-md py-1 outline-none focus-visible:ring-1 focus-visible:ring-ring",
        disabled && "pointer-events-none cursor-not-allowed opacity-50",
        readOnly && "cursor-default",
        hasError && "text-destructive",
      )}
    >
      <div className="flex items-center gap-1">
        {stars.map((starIndex) => {
          const fillPercentage = Math.max(0, Math.min(100, (activeValue - (starIndex - 1)) * 100));

          return (
            <Button
              key={starIndex}
              type="button"
              variant="ghost"
              size="icon-xs"
              tabIndex={-1}
              disabled={disabled || readOnly}
              onMouseMove={(e) => handleItemMouseMove(starIndex, e)}
              onClick={() => handleClick(hoverValue ?? starIndex)}
              className={cn(
                "relative inline-flex size-auto items-center justify-center p-0.5 transition-transform hover:scale-110 hover:bg-transparent focus:outline-none",
                !disabled && !readOnly && "cursor-pointer",
              )}
              aria-label={t("rating_of", { value: starIndex, count })}
            >
              <CustomIcon className={cn(iconSize, RATING_STAR_CLASSES.empty)} />

              {fillPercentage > 0 && (
                <div className="absolute inset-0 overflow-hidden p-0.5" style={{ width: `${fillPercentage}%` }}>
                  <CustomIcon className={cn(iconSize, RATING_STAR_CLASSES.filled)} />
                </div>
              )}
            </Button>
          );
        })}
      </div>

      {(showScore || currentTooltip) && (
        <span className="text-muted-foreground text-xs font-medium select-none">
          {currentTooltip ? (
            <span>{currentTooltip}</span>
          ) : (
            <span>
              {activeValue} / {count}
            </span>
          )}
        </span>
      )}
    </div>
  );
});

export function RatingInput({
  count = 5,
  allowHalf = false,
  allowClear = true,
  tooltips,
  showScore = false,
  size = "md",
  icon,
  ...fieldProps
}: RatingInputProps) {
  return (
    <FormFieldEngine<number | null> {...fieldProps}>
      {({ id, value, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy }) => (
        <RatingControl
          id={id}
          value={typeof value === "number" ? value : null}
          onChange={onChange}
          onBlur={onBlur}
          count={count}
          allowHalf={allowHalf}
          allowClear={allowClear}
          tooltips={tooltips}
          showScore={showScore}
          size={size}
          icon={icon}
          disabled={isDisabled}
          readOnly={isReadOnly}
          hasError={hasError}
          describedBy={describedBy}
        />
      )}
    </FormFieldEngine>
  );
}
