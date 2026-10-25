import { memo } from "react";

import { Slider } from "@/components/ui/slider";

import { type BaseInputProps, FormFieldEngine } from "../core";

export interface SliderInputProps extends BaseInputProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (val: number) => string;
  showValue?: boolean;
}

export const SliderInput = memo(function SliderInput({
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
  value: controlledValue,
  defaultValue = 0,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  min = 0,
  max = 100,
  step = 1,
  formatValue,
  showValue = true,
}: SliderInputProps) {
  return (
    <FormFieldEngine<number>
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
      {({ id, value = min, onChange, onBlur, disabled: isDisabled }) => {
        const numValue = typeof value === "number" ? value : min;
        const displayStr = formatValue ? formatValue(numValue) : String(numValue);

        return (
          <div className="flex w-full items-center gap-3 pt-1.5">
            <Slider
              id={id}
              value={[numValue]}
              onValueChange={(vals) => onChange(vals[0] ?? min)}
              onBlur={onBlur}
              min={min}
              max={max}
              step={step}
              disabled={isDisabled}
              className="flex-1 cursor-pointer"
            />
            {showValue && (
              <span className="text-muted-foreground w-10 shrink-0 text-right font-mono text-xs tabular-nums">
                {displayStr}
              </span>
            )}
          </div>
        );
      }}
    </FormFieldEngine>
  );
});
