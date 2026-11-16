"use client";

import { useMemoizedFn } from "ahooks";
import { type ChangeEvent, type ReactNode, memo } from "react";

import { AdornedInput, type BaseInputProps, FormFieldEngine, useDebouncedFieldValue } from "../core";

export interface TextInputProps<T extends string | number = string> extends BaseInputProps {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  onBlur?: () => void;
  type?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  clearable?: boolean;
  password?: boolean;
  numeric?: boolean;
  debounceMs?: number;
  min?: number;
  max?: number;
  step?: number;
  autoComplete?: string;
  inputClassName?: string;
}

interface TextInputInnerProps {
  id: string;
  effectiveType: string;
  isPassword?: boolean;
  numeric?: boolean;
  min?: number;
  max?: number;
  step?: number;
  autoComplete?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  inputClassName?: string;
  value?: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  hasError?: boolean;
  describedBy?: string;
  debounceMs?: number;
}

const TextInputInner = memo(function TextInputInner({
  id,
  effectiveType,
  isPassword,
  numeric,
  min,
  max,
  step,
  autoComplete,
  placeholder,
  disabled,
  readOnly,
  clearable,
  prefix,
  suffix,
  inputClassName,
  value,
  onChange,
  onBlur,
  hasError,
  describedBy,
  debounceMs = 0,
}: TextInputInnerProps) {
  const { displayValue, handleChange, handleClear, handleBlur } = useDebouncedFieldValue<string | number | undefined>({
    value,
    debounceMs,
    onChange: (nextVal) => onChange(nextVal ?? ""),
    onBlur,
  });

  const handleInputChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!numeric) {
      handleChange(raw);
      return;
    }
    if (raw === "") {
      handleChange("");
      return;
    }
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      handleChange(parsed);
    }
  });

  const handleClearClick = useMemoizedFn(() => {
    handleClear("");
  });

  return (
    <AdornedInput
      id={id}
      type={effectiveType}
      isPassword={isPassword}
      value={displayValue}
      onChange={handleInputChange}
      onClear={handleClearClick}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      clearable={clearable}
      prefix={prefix}
      suffix={suffix}
      min={min}
      max={max}
      step={step}
      autoComplete={autoComplete}
      hasError={hasError}
      describedBy={describedBy}
      inputClassName={inputClassName}
    />
  );
});

export function TextInput<T extends string | number = string>({
  type = "text",
  prefix,
  suffix,
  clearable = false,
  password = false,
  numeric = false,
  debounceMs,
  min,
  max,
  step,
  autoComplete,
  placeholder,
  inputClassName,
  ...fieldProps
}: TextInputProps<T>) {
  const isPassword = password || type === "password";
  const effectiveType = numeric ? "number" : type;

  return (
    <FormFieldEngine<T> {...fieldProps}>
      {({ id, value, onChange, onBlur, disabled, readOnly, hasError, describedBy }) => (
        <TextInputInner
          id={id}
          effectiveType={effectiveType}
          isPassword={isPassword}
          numeric={numeric}
          min={min}
          max={max}
          step={step}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          clearable={clearable}
          prefix={prefix}
          suffix={suffix}
          inputClassName={inputClassName}
          value={value}
          onChange={(nextVal) => onChange(nextVal as T)}
          onBlur={onBlur}
          hasError={hasError}
          describedBy={describedBy}
          debounceMs={debounceMs}
        />
      )}
    </FormFieldEngine>
  );
}
