"use client";

import { useMemoizedFn } from "ahooks";
import { memo } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "cn";

import { type BaseInputProps, FormFieldEngine, type ToggleButtonOption } from "../core";

const EMPTY_OPTIONS: ToggleButtonOption[] = [];

export interface ToggleButtonsProps extends BaseInputProps {
  options: ToggleButtonOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  fullWidth?: boolean;
}

export const ToggleButtons = memo(function ToggleButtons({
  options = EMPTY_OPTIONS,
  defaultValue = "",
  variant = "outline",
  size = "sm",
  fullWidth = false,
  ...fieldProps
}: ToggleButtonsProps) {
  const handleValueChange = useMemoizedFn((onChange: (val: string) => void, val: string) => {
    if (val) onChange(val);
  });

  return (
    <FormFieldEngine<string> defaultValue={defaultValue} {...fieldProps}>
      {({ id, value = "", onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy }) => {
        const locked = Boolean(isDisabled || isReadOnly);
        return (
          <ToggleGroup
            id={id}
            type="single"
            value={value}
            onValueChange={(val) => {
              if (!isReadOnly) handleValueChange(onChange, val);
            }}
            onBlur={onBlur}
            disabled={locked}
            variant={variant}
            size={size}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            className={cn("pt-1", fullWidth && "flex w-full *:flex-1")}
          >
            {options.map((opt) => {
              const Icon = opt.icon;
              return (
                <ToggleGroupItem
                  key={opt.value}
                  value={opt.value}
                  disabled={locked || opt.disabled}
                  className="cursor-pointer gap-1.5 text-xs"
                >
                  {Icon && <Icon className="size-3.5 shrink-0" />}
                  <span>{opt.label}</span>
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        );
      }}
    </FormFieldEngine>
  );
});
