import { useMemoizedFn } from "ahooks";
import { Star } from "lucide-react";
import { type ComponentType, type KeyboardEvent, type MouseEvent, memo, useId, useState } from "react";

import { cn } from "@/lib/utils";

import { type BaseInputProps, FieldConnector, FieldWrapper, resolveFieldHasError } from "../core";

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

interface RatingInputInnerProps {
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
}

const SIZE_MAP = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

/**
 * 评分星标配色（已选/未选两态统一收敛于此表）
 */
const RATING_STAR_CLASSES = {
  empty: "text-muted-foreground/30 transition-colors",
  filled: "fill-amber-500 text-amber-500 transition-colors",
} as const;

const RatingInputInner = memo(function RatingInputInner({
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
}: RatingInputInnerProps) {
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
            <button
              key={starIndex}
              type="button"
              tabIndex={-1}
              disabled={disabled || readOnly}
              onMouseMove={(e) => handleItemMouseMove(starIndex, e)}
              onClick={() => handleClick(hoverValue ?? starIndex)}
              className={cn(
                "relative inline-flex items-center justify-center p-0.5 transition-transform hover:scale-110 focus:outline-none",
                !disabled && !readOnly && "cursor-pointer",
              )}
              aria-label={`${starIndex} of ${count}`}
            >
              {/* Background Star (Muted Empty) */}
              <CustomIcon className={cn(iconSize, RATING_STAR_CLASSES.empty)} />

              {/* Foreground Star (Filled overlay) */}
              {fillPercentage > 0 && (
                <div className="absolute inset-0 overflow-hidden p-0.5" style={{ width: `${fillPercentage}%` }}>
                  <CustomIcon className={cn(iconSize, RATING_STAR_CLASSES.filled)} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Score or Tooltip indicator */}
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
  name,
  form,
  label,
  id: explicitId,
  required,
  hint,
  helperText,
  tooltip,
  error,
  colSpan,
  className,
  hidden,
  disabled,
  readOnly,
  value: controlledValue,
  defaultValue,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  count = 5,
  allowHalf = false,
  allowClear = true,
  tooltips,
  showScore = false,
  size = "md",
  icon,
}: RatingInputProps) {
  const generatedId = useId();
  const id = explicitId || generatedId;

  return (
    <FieldConnector
      name={name}
      form={form}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
      disabled={disabled}
      readOnly={readOnly}
      render={({ value, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, meta }) => {
        const hasError = resolveFieldHasError(error, meta);
        const numValue = typeof value === "number" ? value : null;

        return (
          <FieldWrapper
            id={id}
            label={label}
            required={required}
            hint={hint}
            helperText={helperText}
            tooltip={tooltip}
            error={error}
            meta={meta}
            colSpan={colSpan}
            className={className}
            hidden={hidden}
          >
            <RatingInputInner
              id={id}
              value={numValue}
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
            />
          </FieldWrapper>
        );
      }}
    />
  );
}
