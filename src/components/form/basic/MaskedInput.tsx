"use client";

import { useMemoizedFn } from "ahooks";
import { type ChangeEvent, type ReactNode, memo, useMemo } from "react";

import { cn } from "cn";

import { AdornedInput, type BaseInputProps, FormFieldEngine } from "../core";

export interface MaskedInputProps extends BaseInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  mask: string;
  unmask?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  clearable?: boolean;
  inputClassName?: string;
}

interface MaskedControlProps {
  id: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  mask: string;
  unmask?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  inputClassName?: string;
  hasError?: boolean;
  describedBy?: string;
}

export function formatWithMask(rawInput: string, mask: string): { masked: string; unmasked: string } {
  let rawChars = "";
  for (const ch of rawInput) {
    if (/[0-9a-zA-Z]/.test(ch)) {
      rawChars += ch;
    }
  }

  let masked = "";
  let unmasked = "";
  let rawIdx = 0;

  for (let i = 0; i < mask.length && rawIdx < rawChars.length; i++) {
    const maskChar = mask[i];
    const nextChar = rawChars[rawIdx];

    if (maskChar === "#") {
      if (/[0-9]/.test(nextChar)) {
        masked += nextChar;
        unmasked += nextChar;
        rawIdx++;
      } else {
        rawIdx++;
        i--;
      }
    } else if (maskChar === "A") {
      if (/[a-zA-Z]/.test(nextChar)) {
        masked += nextChar;
        unmasked += nextChar;
        rawIdx++;
      } else {
        rawIdx++;
        i--;
      }
    } else if (maskChar === "*") {
      masked += nextChar;
      unmasked += nextChar;
      rawIdx++;
    } else {
      masked += maskChar;
      if (nextChar === maskChar) {
        rawIdx++;
      }
    }
  }

  return { masked, unmasked };
}

const MaskedControl = memo(function MaskedControl({
  id,
  value = "",
  onChange,
  onBlur,
  mask,
  unmask = false,
  placeholder,
  disabled,
  readOnly,
  clearable = false,
  prefix,
  suffix,
  inputClassName,
  hasError,
  describedBy,
}: MaskedControlProps) {
  const displayValue = useMemo(() => formatWithMask(value ?? "", mask).masked, [value, mask]);

  const handleInputChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const { masked, unmasked: cleanUnmasked } = formatWithMask(raw, mask);
    onChange(unmask ? cleanUnmasked : masked);
  });

  const handleClear = useMemoizedFn(() => {
    onChange("");
  });

  return (
    <AdornedInput
      id={id}
      type="text"
      value={displayValue}
      onChange={handleInputChange}
      onClear={handleClear}
      onBlur={onBlur}
      placeholder={placeholder || mask}
      disabled={disabled}
      readOnly={readOnly}
      clearable={clearable}
      prefix={prefix}
      suffix={suffix}
      hasError={hasError}
      describedBy={describedBy}
      inputClassName={cn("font-mono tracking-wide", inputClassName)}
    />
  );
});

export function MaskedInput({
  placeholder,
  defaultValue = "",
  mask,
  unmask = false,
  prefix,
  suffix,
  clearable = false,
  inputClassName,
  ...fieldProps
}: MaskedInputProps) {
  return (
    <FormFieldEngine<string> defaultValue={defaultValue} {...fieldProps}>
      {({ id, value = "", onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy }) => (
        <MaskedControl
          id={id}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          onBlur={onBlur}
          mask={mask}
          unmask={unmask}
          placeholder={placeholder}
          disabled={isDisabled}
          readOnly={isReadOnly}
          clearable={clearable}
          prefix={prefix}
          suffix={suffix}
          inputClassName={inputClassName}
          hasError={hasError}
          describedBy={describedBy}
        />
      )}
    </FormFieldEngine>
  );
}
