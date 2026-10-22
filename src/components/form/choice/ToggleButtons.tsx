import { useMemoizedFn } from "ahooks";
import { memo } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

import {
  type BaseInputProps,
  FieldConnector,
  FieldWrapper,
  type ToggleButtonOption,
  useFieldId,
} from "../core";

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

interface ToggleButtonsInnerProps {
  id: string;
  label?: React.ReactNode;
  required?: boolean;
  hint?: React.ReactNode;
  helperText?: React.ReactNode;
  tooltip?: React.ReactNode;
  computedError?: React.ReactNode;
  colSpan?: BaseInputProps["colSpan"];
  className?: string;
  hidden?: boolean;
  disabled?: boolean;
  variant: "default" | "outline";
  size: "default" | "sm" | "lg";
  fullWidth: boolean;
  options: ToggleButtonOption[];
  value: string;
  onChange: (value: string) => void;
}

const ToggleButtonsInner = memo(function ToggleButtonsInner({
  id,
  label,
  required,
  hint,
  helperText,
  tooltip,
  computedError,
  colSpan,
  className,
  hidden,
  disabled,
  variant,
  size,
  fullWidth,
  options,
  value,
  onChange,
}: ToggleButtonsInnerProps) {
  const handleValueChange = useMemoizedFn((val: string) => {
    if (val) onChange(val);
  });

  return (
    <FieldWrapper
      label={label}
      id={id}
      required={required}
      hint={hint}
      helperText={helperText}
      tooltip={tooltip}
      error={computedError}
      colSpan={colSpan}
      className={className}
      hidden={hidden}
    >
      <ToggleGroup
        id={id}
        type="single"
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
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
              disabled={disabled || opt.disabled}
              className="cursor-pointer gap-1.5 text-xs"
            >
              {Icon && <Icon className="size-3.5 shrink-0" />}
              <span>{opt.label}</span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </FieldWrapper>
  );
});

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
  const id = useFieldId(name, explicitId);

  return (
    <FieldConnector<string>
      name={name}
      form={form}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
      error={error}
    >
      {({ value = "", onChange, error: computedError }) => (
        <ToggleButtonsInner
          id={id}
          label={label}
          required={required}
          hint={hint}
          helperText={helperText}
          tooltip={tooltip}
          computedError={computedError}
          colSpan={colSpan}
          className={className}
          hidden={hidden}
          disabled={disabled}
          variant={variant}
          size={size}
          fullWidth={fullWidth}
          options={options}
          value={value}
          onChange={onChange}
        />
      )}
    </FieldConnector>
  );
});
