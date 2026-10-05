import { useBoolean, useDebounceFn, useMemoizedFn } from "ahooks";
import { Eye, EyeOff, X } from "lucide-react";
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

import { type BaseInputProps, FieldConnector, FieldWrapper } from "../core";

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
  debounceMs?: number;
}

const TextInputInner = memo(function TextInputInner({
  id,
  effectiveType: baseType,
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
  debounceMs,
}: TextInputInnerProps) {
  const [showPassword, { toggle: togglePassword }] = useBoolean(false);
  const [localValue, setLocalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setLocalValue(value);
  }

  const debouncedOnChange = useDebounceFn(
    (val: string | number) => {
      onChange(val);
    },
    { wait: debounceMs ?? 0 },
  );

  const hasDebounce = (debounceMs ?? 0) > 0;

  const handleInputChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const nextVal = numeric ? (raw === "" ? "" : Number(raw)) : raw;
    setLocalValue(nextVal);
    if (hasDebounce) {
      debouncedOnChange.run(nextVal);
    } else {
      onChange(nextVal);
    }
  });

  const handleClear = useMemoizedFn(() => {
    if (hasDebounce) debouncedOnChange.cancel();
    const emptyVal = numeric ? 0 : "";
    setLocalValue(emptyVal);
    onChange(emptyVal);
  });

  const handleBlur = useMemoizedFn(() => {
    if (hasDebounce) debouncedOnChange.flush();
    onBlur?.();
  });

  const currentEffectiveType = isPassword ? (showPassword ? "text" : "password") : baseType;
  const hasValue = localValue != null && localValue !== "";
  const hasAdornments =
    Boolean(prefix) ||
    Boolean(suffix) ||
    (clearable && hasValue && !disabled && !readOnly) ||
    isPassword;

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
          type={currentEffectiveType}
          value={localValue ?? ""}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          min={min}
          max={max}
          step={step}
          autoComplete={autoComplete}
          aria-invalid={hasError}
          className={inputClassName}
        />

        {clearable && hasValue && !disabled && !readOnly && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              variant="ghost"
              onClick={handleClear}
              aria-label="清除内容"
            >
              <X className="size-3" />
            </InputGroupButton>
          </InputGroupAddon>
        )}

        {isPassword && !disabled && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              variant="ghost"
              onClick={togglePassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
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
      type={currentEffectiveType}
      value={localValue ?? ""}
      onChange={handleInputChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      min={min}
      max={max}
      step={step}
      autoComplete={autoComplete}
      aria-invalid={hasError}
      className={cn("rounded-md", inputClassName)}
    />
  );
});

export function TextInput<T extends string | number = string>({
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
  inputClassName,
}: TextInputProps<T>) {
  const autoId = useId();
  const id = explicitId || (name ? `field-${name}` : autoId);
  const isPassword = password || type === "password";
  const effectiveType = numeric ? "number" : type;

  return (
    <FieldConnector<string | number>
      name={name}
      form={form}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange as ((val: string | number) => void) | undefined}
      onBlur={controlledOnBlur}
      error={error}
      disabled={disabled}
      readOnly={readOnly}
      render={({
        value,
        onChange,
        onBlur,
        error: computedError,
        disabled: isDisabled,
        readOnly: isReadOnly,
        meta,
      }) => (
        <FieldWrapper
          label={label}
          id={id}
          required={required}
          hint={hint}
          helperText={helperText}
          tooltip={tooltip}
          error={computedError}
          meta={meta}
          colSpan={colSpan}
          className={className}
          hidden={hidden}
        >
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
            disabled={isDisabled}
            readOnly={isReadOnly}
            clearable={clearable}
            prefix={prefix}
            suffix={suffix}
            inputClassName={inputClassName}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            hasError={Boolean(computedError)}
            debounceMs={debounceMs}
          />
        </FieldWrapper>
      )}
    />
  );
}
