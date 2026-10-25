import { useMemoizedFn } from "ahooks";
import { Clock, X } from "lucide-react";
import { memo } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "cn";

import { type BaseInputProps, FormFieldEngine } from "../core";

export interface TimePickerInputProps extends BaseInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  step?: number;
  clearable?: boolean;
}

interface TimePickerControlProps {
  id: string;
  step: number;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  clearable?: boolean;
  hasError?: boolean;
}

const TimePickerControl = memo(function TimePickerControl({
  id,
  step,
  value,
  onChange,
  onBlur,
  disabled,
  placeholder,
  clearable,
  hasError,
}: TimePickerControlProps) {
  const handleClear = useMemoizedFn((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  });

  const handleInputChange = useMemoizedFn((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  });

  return (
    <div className="relative flex w-full items-center">
      <div className="text-muted-foreground pointer-events-none absolute left-2.5">
        <Clock className="size-3.5" />
      </div>
      <Input
        id={id}
        type="time"
        step={step}
        value={value}
        onChange={handleInputChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "h-8 bg-transparent pr-7 pl-8 font-mono text-xs",
          hasError && "border-destructive focus-visible:ring-destructive/20",
        )}
      />
      {clearable && value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground absolute right-2 cursor-pointer rounded p-0.5"
          aria-label="清除时间"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
});

export const TimePickerInput = memo(function TimePickerInput({
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
  placeholder = "--:--",
  disabled,
  value: controlledValue,
  defaultValue = "",
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  step = 60,
  clearable = true,
}: TimePickerInputProps) {
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
      {({ id, value = "", onChange, onBlur, disabled: isDisabled, hasError }) => (
        <TimePickerControl
          id={id}
          step={step}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={isDisabled}
          placeholder={placeholder}
          clearable={clearable}
          hasError={hasError}
        />
      )}
    </FormFieldEngine>
  );
});
