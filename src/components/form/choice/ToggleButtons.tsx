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
  options = EMPTY_OPTIONS,
  value: controlledValue,
  defaultValue = "",
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  variant = "outline",
  size = "sm",
  fullWidth = false,
}: ToggleButtonsProps) {
  const handleValueChange = useMemoizedFn((onChange: (val: string) => void, val: string) => {
    if (val) onChange(val);
  });

  return (
    <FormFieldEngine<string>
      name={name}
      form={form}
      label={label}
      id={explicitId}
      required={required}
      hint={hint}
      helperText={helperText}
      tooltip={tooltip}
      error={error}
      colSpan={colSpan}
      className={className}
      hidden={hidden}
      disabled={disabled}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
    >
      {({ id, value = "", onChange, onBlur, disabled: isDisabled }) => (
        <ToggleGroup
          id={id}
          type="single"
          value={value}
          onValueChange={(val) => handleValueChange(onChange, val)}
          onBlur={onBlur}
          disabled={isDisabled}
          variant={variant}
          size={size}
          className={cn("pt-1", fullWidth && "flex w-full *:flex-1")}
        >
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <ToggleGroupItem
                key={opt.value}
                value={opt.value}
                disabled={isDisabled || opt.disabled}
                className="cursor-pointer gap-1.5 text-xs"
              >
                {Icon && <Icon className="size-3.5 shrink-0" />}
                <span>{opt.label}</span>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      )}
    </FormFieldEngine>
  );
});
