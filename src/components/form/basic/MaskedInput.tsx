import { useMemoizedFn } from "ahooks";
import { X } from "lucide-react";
import { type ChangeEvent, type ReactNode, memo, useId, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

import { type BaseInputProps, FieldConnector, FieldWrapper, resolveFieldHasError } from "../core";

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

interface MaskedInputInnerProps {
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
}

export function formatWithMask(rawInput: string, mask: string): { masked: string; unmasked: string } {
  let rawChars = "";
  // Extract unmasked characters that could match pattern slots
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
        // Skip non-digit
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
      // Literal mask character
      masked += maskChar;
      if (nextChar === maskChar) {
        rawIdx++;
      }
    }
  }

  return { masked, unmasked };
}

const MaskedInputInner = memo(function MaskedInputInner({
  id,
  value,
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
}: MaskedInputInnerProps) {
  const initial = formatWithMask(value ?? "", mask);
  const [displayValue, setDisplayValue] = useState(initial.masked);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setDisplayValue(formatWithMask(value ?? "", mask).masked);
  }

  const handleInputChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const { masked, unmasked: cleanUnmasked } = formatWithMask(raw, mask);
    setDisplayValue(masked);
    onChange(unmask ? cleanUnmasked : masked);
  });

  const handleClear = useMemoizedFn(() => {
    setDisplayValue("");
    onChange("");
  });

  const hasValue = Boolean(displayValue);
  const hasAdornments = Boolean(prefix) || Boolean(suffix) || (clearable && hasValue && !disabled && !readOnly);

  if (hasAdornments) {
    return (
      <InputGroup
        className={cn(
          "w-full rounded-md",
          hasError && "border-destructive ring-destructive/20",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        {prefix && (
          <InputGroupAddon align="inline-start">
            {typeof prefix === "string" ? <InputGroupText>{prefix}</InputGroupText> : prefix}
          </InputGroupAddon>
        )}

        <InputGroupInput
          id={id}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={onBlur}
          placeholder={placeholder || mask}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={hasError}
          className={cn("font-mono tracking-wide", inputClassName)}
        />

        {clearable && hasValue && !disabled && !readOnly && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" variant="ghost" onClick={handleClear} aria-label="Clear content">
              <X className="size-3" />
            </InputGroupButton>
          </InputGroupAddon>
        )}

        {suffix && (
          <InputGroupAddon align="inline-end">
            {typeof suffix === "string" ? <InputGroupText>{suffix}</InputGroupText> : suffix}
          </InputGroupAddon>
        )}
      </InputGroup>
    );
  }

  return (
    <Input
      id={id}
      type="text"
      value={displayValue}
      onChange={handleInputChange}
      onBlur={onBlur}
      placeholder={placeholder || mask}
      disabled={disabled}
      readOnly={readOnly}
      aria-invalid={hasError}
      className={cn("rounded-md font-mono tracking-wide", inputClassName)}
    />
  );
});

export function MaskedInput({
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
  placeholder,
  disabled,
  readOnly,
  value: controlledValue,
  defaultValue,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  mask,
  unmask = false,
  prefix,
  suffix,
  clearable = false,
  inputClassName,
}: MaskedInputProps) {
  const generatedId = useId();
  const id = explicitId || generatedId;

  return (
    <FieldConnector
      name={name}
      form={form}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
      disabled={disabled}
      readOnly={readOnly}
      render={({ value, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, meta }) => {
        const hasError = resolveFieldHasError(error, meta);

        return (
          <FieldWrapper
            id={id}
            label={label}
            required={required}
            hint={hint}
            helperText={helperText}
            tooltip={tooltip}
            error={error}
            meta={meta}
            colSpan={colSpan}
            className={className}
            hidden={hidden}
          >
            <MaskedInputInner
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
            />
          </FieldWrapper>
        );
      }}
    />
  );
}
