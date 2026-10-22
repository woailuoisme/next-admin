import { useMemoizedFn } from "ahooks";
import { Minus, Plus } from "lucide-react";
import { type ChangeEvent, type ReactNode, memo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { FieldConnector, FieldWrapper, useFieldId, type BaseInputProps } from "../core";

export interface NumberInputProps extends BaseInputProps {
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  steppers?: boolean;
}

interface NumberInputInnerProps {
  id: string;
  value?: number | null;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  steppers?: boolean;
  disabled?: boolean;
  placeholder?: string;
  hasError?: boolean;
}

const NumberInputInner = memo(function NumberInputInner({
  id,
  value,
  onChange,
  onBlur,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  steppers = true,
  disabled,
  placeholder = "0",
  hasError,
}: NumberInputInnerProps) {
  const handleInputChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    if (raw === "") {
      onChange(null);
      return;
    }
    const parsed = Number(raw);
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    }
  });

  const stepUp = useMemoizedFn(() => {
    if (disabled) return;
    const current = typeof value === "number" ? value : 0;
    const next = current + step;
    if (max !== undefined && next > max) return;
    onChange(Number(next.toFixed(4)));
  });

  const stepDown = useMemoizedFn(() => {
    if (disabled) return;
    const current = typeof value === "number" ? value : 0;
    const next = current - step;
    if (min !== undefined && next < min) return;
    onChange(Number(next.toFixed(4)));
  });

  return (
    <div className="relative flex w-full items-center">
      {prefix && (
        <span className="text-muted-foreground pointer-events-none absolute left-2.5 text-xs select-none">
          {prefix}
        </span>
      )}
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value ?? ""}
        onChange={handleInputChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "h-8 [appearance:textfield] font-mono text-xs tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          prefix && "pl-7",
          (suffix || steppers) && "pr-16",
          hasError && "border-destructive focus-visible:ring-destructive/20",
        )}
      />
      <div className="absolute right-1 flex items-center gap-0.5">
        {suffix && (
          <span className="text-muted-foreground pointer-events-none mr-1 text-xs select-none">{suffix}</span>
        )}
        {steppers && !disabled && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="减少数值"
              onClick={stepDown}
              disabled={min !== undefined && (value ?? 0) <= min}
              className="text-muted-foreground hover:text-foreground size-6 cursor-pointer"
            >
              <Minus className="size-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="增加数值"
              onClick={stepUp}
              disabled={max !== undefined && (value ?? 0) >= max}
              className="text-muted-foreground hover:text-foreground size-6 cursor-pointer"
            >
              <Plus className="size-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
});

export const NumberInput = memo(function NumberInput({
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
  placeholder = "0",
  disabled,
  value: controlledValue,
  defaultValue = null,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  steppers = true,
}: NumberInputProps) {
  const id = useFieldId(name, explicitId);

  return (
    <FieldConnector<number | null>
      name={name}
      form={form}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
      error={error}
    >
      {({ value, onChange, onBlur, error: computedError }) => (
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
          <NumberInputInner
            id={id}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            min={min}
            max={max}
            step={step}
            prefix={prefix}
            suffix={suffix}
            steppers={steppers}
            disabled={disabled}
            placeholder={placeholder}
            hasError={Boolean(computedError)}
          />
        </FieldWrapper>
      )}
    </FieldConnector>
  );
});
