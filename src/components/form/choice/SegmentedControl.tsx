import { useMemoizedFn } from "ahooks";
import { type KeyboardEvent, memo, useId } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  type BaseInputProps,
  FieldConnector,
  FieldWrapper,
  resolveFieldHasError,
  type SegmentedOption,
} from "../core";

export interface SegmentedControlProps<T extends string | number = string> extends BaseInputProps {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  onBlur?: () => void;
  options: SegmentedOption<T>[];
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

interface SegmentedControlInnerProps<T extends string | number = string> {
  id: string;
  value?: T;
  onChange: (value: T) => void;
  onBlur?: () => void;
  options: SegmentedOption<T>[];
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  hasError?: boolean;
}

const SIZE_STYLES = {
  sm: "h-7 text-xs px-2.5 gap-1.5",
  md: "h-8 text-xs px-3 gap-2",
  lg: "h-9 text-sm px-4 gap-2.5",
};

const SegmentedControlInner = memo(function SegmentedControlInner<
  T extends string | number = string,
>({
  id,
  value,
  onChange,
  onBlur,
  options,
  size = "md",
  fullWidth = false,
  disabled = false,
  readOnly = false,
  hasError,
}: SegmentedControlInnerProps<T>) {
  const handleSelect = useMemoizedFn((optValue: T, optDisabled?: boolean) => {
    if (disabled || readOnly || optDisabled) return;
    onChange(optValue);
  });

  const handleKeyDown = useMemoizedFn((e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || readOnly) return;
    const enabledOptions = options.filter((o) => !o.disabled);
    if (enabledOptions.length === 0) return;

    const currentIndex = enabledOptions.findIndex((o) => o.value === value);

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = (currentIndex + 1) % enabledOptions.length;
      onChange(enabledOptions[nextIdx].value);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevIdx = (currentIndex - 1 + enabledOptions.length) % enabledOptions.length;
      onChange(enabledOptions[prevIdx].value);
    }
  });

  const sizeStyle = SIZE_STYLES[size];

  return (
    <div
      id={id}
      role="radiogroup"
      tabIndex={disabled || readOnly ? -1 : 0}
      onKeyDown={handleKeyDown}
      onBlur={onBlur}
      className={cn(
        "inline-flex items-center rounded-lg bg-muted p-1 text-muted-foreground transition-colors outline-none select-none focus-visible:ring-1 focus-visible:ring-ring",
        fullWidth && "flex w-full",
        disabled && "pointer-events-none cursor-not-allowed opacity-50",
        hasError && "ring-1 ring-destructive",
      )}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        const isItemDisabled = disabled || readOnly || opt.disabled;
        const Icon = opt.icon;

        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isItemDisabled}
            onClick={() => handleSelect(opt.value, opt.disabled)}
            className={cn(
              "relative inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none",
              sizeStyle,
              fullWidth && "flex-1",
              isSelected
                ? "bg-background font-semibold text-foreground shadow-xs"
                : "hover:bg-background/40 hover:text-foreground/80",
              isItemDisabled && "cursor-not-allowed opacity-50",
              !isItemDisabled && "cursor-pointer",
            )}
          >
            {Icon && <Icon className="size-3.5 shrink-0" />}
            <span>{opt.label}</span>
            {opt.badge != null && (
              <span className="ml-1 shrink-0">
                {typeof opt.badge === "string" || typeof opt.badge === "number" ? (
                  <Badge
                    variant={isSelected ? "default" : "secondary"}
                    className="h-4 rounded-full px-1 text-[10px]"
                  >
                    {opt.badge}
                  </Badge>
                ) : (
                  opt.badge
                )}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}) as <T extends string | number = string>(
  props: SegmentedControlInnerProps<T>,
) => React.ReactElement;

export function SegmentedControl<T extends string | number = string>({
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
  options,
  size = "md",
  fullWidth = false,
}: SegmentedControlProps<T>) {
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
            <SegmentedControlInner<T>
              id={id}
              value={value as T | undefined}
              onChange={onChange as (val: T) => void}
              onBlur={onBlur}
              options={options}
              size={size}
              fullWidth={fullWidth}
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
