"use client";

import { useMemoizedFn } from "ahooks";
import { type KeyboardEvent, memo, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

import { type BaseInputProps, createContainerBlurHandler, FormFieldEngine, type SegmentedOption } from "../core";

export interface SegmentedControlProps<T extends string | number = string> extends BaseInputProps {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  onBlur?: () => void;
  options: SegmentedOption<T>[];
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

interface SegmentedControlGroupProps<T extends string | number = string> {
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
  describedBy?: string;
}

const SIZE_STYLES = {
  sm: "h-7 text-xs px-2.5 gap-1.5",
  md: "h-8 text-xs px-3 gap-2",
  lg: "h-9 text-sm px-4 gap-2.5",
};

const SegmentedControlGroup = memo(function SegmentedControlGroup<T extends string | number = string>({
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
  describedBy,
}: SegmentedControlGroupProps<T>) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleSelect = useMemoizedFn((optValue: T, optDisabled?: boolean) => {
    if (disabled || readOnly || optDisabled) return;
    onChange(optValue);
  });

  const handleKeyDown = useMemoizedFn((e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || readOnly) return;
    const enabledEntries = options.map((opt, index) => ({ opt, index })).filter(({ opt }) => !opt.disabled);
    if (enabledEntries.length === 0) return;

    const currentIndex = enabledEntries.findIndex(
      ({ opt }) => value !== undefined && String(opt.value) === String(value),
    );

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextEntry = enabledEntries[(currentIndex + 1) % enabledEntries.length];
      onChange(nextEntry.opt.value);
      itemRefs.current[nextEntry.index]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevEntry = enabledEntries[(currentIndex - 1 + enabledEntries.length) % enabledEntries.length];
      onChange(prevEntry.opt.value);
      itemRefs.current[prevEntry.index]?.focus();
    }
  });

  const handleBlur = createContainerBlurHandler(onBlur);

  const sizeStyle = SIZE_STYLES[size];
  const selectedIndex = options.findIndex(
    (opt) => !opt.disabled && value !== undefined && String(opt.value) === String(value),
  );
  const firstEnabledIndex = options.findIndex((opt) => !opt.disabled);
  const tabStopIndex = selectedIndex >= 0 ? selectedIndex : firstEnabledIndex;

  return (
    <div
      id={id}
      role="radiogroup"
      aria-invalid={hasError}
      aria-describedby={describedBy}
      aria-readonly={readOnly}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={cn(
        "inline-flex items-center rounded-lg bg-muted p-1 text-muted-foreground transition-colors outline-none select-none",
        fullWidth && "flex w-full",
        disabled && "pointer-events-none cursor-not-allowed opacity-50",
        hasError && "ring-1 ring-destructive",
      )}
    >
      {options.map((opt, index) => {
        const isSelected = value !== undefined && String(opt.value) === String(value);
        const isItemDisabled = disabled || readOnly || opt.disabled;
        const Icon = opt.icon;

        return (
          <Button
            key={String(opt.value)}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            type="button"
            variant="ghost"
            role="radio"
            aria-checked={isSelected}
            tabIndex={disabled || readOnly || opt.disabled ? -1 : index === tabStopIndex ? 0 : -1}
            disabled={isItemDisabled}
            onClick={() => handleSelect(opt.value, opt.disabled)}
            className={cn(
              "relative inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:ring-1 focus-visible:ring-ring focus:outline-none",
              sizeStyle,
              fullWidth && "flex-1",
              isSelected
                ? "bg-background font-semibold text-foreground shadow-xs hover:bg-background"
                : "hover:bg-background/40 hover:text-foreground/80",
              isItemDisabled && "cursor-not-allowed opacity-50",
              !isItemDisabled && "cursor-pointer",
            )}
          >
            {Icon && <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
            <span>{opt.label}</span>
            {opt.badge != null && (
              <span className="ml-1 shrink-0">
                {typeof opt.badge === "string" || typeof opt.badge === "number" ? (
                  <Badge variant={isSelected ? "default" : "secondary"} className="h-4 rounded-full px-1 text-[10px]">
                    {opt.badge}
                  </Badge>
                ) : (
                  opt.badge
                )}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}) as <T extends string | number = string>(props: SegmentedControlGroupProps<T>) => React.ReactElement;

export function SegmentedControl<T extends string | number = string>({
  options,
  size = "md",
  fullWidth = false,
  ...fieldProps
}: SegmentedControlProps<T>) {
  return (
    <FormFieldEngine<T> {...fieldProps}>
      {({ id, value, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy }) => (
        <SegmentedControlGroup<T>
          id={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          options={options}
          size={size}
          fullWidth={fullWidth}
          disabled={isDisabled}
          readOnly={isReadOnly}
          hasError={hasError}
          describedBy={describedBy}
        />
      )}
    </FormFieldEngine>
  );
}
