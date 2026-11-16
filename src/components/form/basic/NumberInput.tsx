"use client";

import { useMemoizedFn } from "ahooks";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ChangeEvent, type ReactNode, memo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

import { FormFieldEngine, type BaseInputProps } from "../core";

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
  inputClassName?: string;
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
  readOnly?: boolean;
  placeholder?: string;
  hasError?: boolean;
  describedBy?: string;
  inputClassName?: string;
}

function getDecimalPrecision(num: number): number {
  const str = String(num);
  if (str.includes("e-")) {
    const [coeff, exp] = str.split("e-");
    const fracLen = coeff?.split(".")[1]?.length ?? 0;
    return fracLen + Number(exp || 0);
  }
  return str.split(".")[1]?.length ?? 0;
}

function roundWithStepPrecision(next: number, current: number, step: number): number {
  const precision = Math.min(10, Math.max(getDecimalPrecision(current), getDecimalPrecision(step)));
  return Number(next.toFixed(precision));
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
  readOnly,
  placeholder = "0",
  hasError,
  describedBy,
  inputClassName,
}: NumberInputInnerProps) {
  const t = useTranslations("form");
  const isLocked = Boolean(disabled || readOnly);

  const handleInputChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    if (raw === "") {
      onChange(null);
      return;
    }
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      onChange(parsed);
    }
  });

  const stepUp = useMemoizedFn(() => {
    if (isLocked) return;
    const current = typeof value === "number" && Number.isFinite(value) ? value : 0;
    let next = roundWithStepPrecision(current + step, current, step);
    if (min !== undefined && next < min) next = min;
    if (max !== undefined && next > max) {
      if (typeof value !== "number" && max >= (min ?? -Infinity)) {
        next = max;
      } else {
        return;
      }
    }
    onChange(next);
  });

  const stepDown = useMemoizedFn(() => {
    if (isLocked) return;
    const current = typeof value === "number" && Number.isFinite(value) ? value : 0;
    let next = roundWithStepPrecision(current - step, current, step);
    if (max !== undefined && next > max) next = max;
    if (min !== undefined && next < min) {
      if (typeof value !== "number" && min <= (max ?? Infinity)) {
        next = min;
      } else {
        return;
      }
    }
    onChange(next);
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
        readOnly={readOnly}
        placeholder={placeholder}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        className={cn(
          "h-8 [appearance:textfield] font-mono text-xs tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          prefix && "pl-7",
          (suffix || steppers) && "pr-16",
          hasError && "border-destructive focus-visible:ring-destructive/20",
          inputClassName,
        )}
      />
      <div className="absolute right-1 flex items-center gap-0.5">
        {suffix && <span className="text-muted-foreground pointer-events-none mr-1 text-xs select-none">{suffix}</span>}
        {steppers && !isLocked && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={t("number_decrease")}
              onClick={stepDown}
              disabled={min !== undefined && (value ?? 0) <= min}
              className="text-muted-foreground hover:text-foreground size-6 cursor-pointer"
            >
              <Minus aria-hidden="true" className="size-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={t("number_increase")}
              onClick={stepUp}
              disabled={max !== undefined && (value ?? 0) >= max}
              className="text-muted-foreground hover:text-foreground size-6 cursor-pointer"
            >
              <Plus aria-hidden="true" className="size-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
});

export const NumberInput = memo(function NumberInput({
  placeholder = "0",
  defaultValue = null,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  steppers = true,
  inputClassName,
  ...fieldProps
}: NumberInputProps) {
  return (
    <FormFieldEngine<number | null> defaultValue={defaultValue} {...fieldProps}>
      {({ id, value, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy }) => (
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
          disabled={isDisabled}
          readOnly={isReadOnly}
          placeholder={placeholder}
          hasError={hasError}
          describedBy={describedBy}
          inputClassName={inputClassName}
        />
      )}
    </FormFieldEngine>
  );
});
