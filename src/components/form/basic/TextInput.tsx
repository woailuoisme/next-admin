import { useDebounceFn, useMemoizedFn } from "ahooks";
import { Eye, EyeOff, X } from "lucide-react";
import { type ChangeEvent, type ReactNode, memo, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { cn } from "cn";

import { type BaseInputProps, FormFieldEngine } from "../core";

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

const StandardTextInputInner = memo(function StandardTextInputInner({
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
}: TextInputInnerProps) {
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = useMemoizedFn(() => setShowPassword((prev) => !prev));

  const handleInputChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const nextVal = numeric ? (raw === "" ? "" : Number(raw)) : raw;
    onChange(nextVal);
  });

  const handleClear = useMemoizedFn(() => {
    onChange(numeric ? 0 : "");
  });

  const currentEffectiveType = isPassword ? (showPassword ? "text" : "password") : baseType;
  const hasValue = value != null && value !== "";
  const hasAdornments =
    Boolean(prefix) || Boolean(suffix) || (clearable && hasValue && !disabled && !readOnly) || isPassword;

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
          value={value ?? ""}
          onChange={handleInputChange}
          onBlur={onBlur}
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
            <InputGroupButton size="icon-xs" variant="ghost" onClick={handleClear} aria-label="清除内容">
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
      value={value ?? ""}
      onChange={handleInputChange}
      onBlur={onBlur}
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

const DebouncedTextInputInner = memo(function DebouncedTextInputInner({
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
  debounceMs = 300,
}: TextInputInnerProps) {
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = useMemoizedFn(() => setShowPassword((prev) => !prev));
  const [prevValue, setPrevValue] = useState(value);
  const [localValue, setLocalValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setLocalValue(value);
  }

  const debouncedOnChange = useDebounceFn(
    (val: string | number) => {
      onChange(val);
    },
    { wait: debounceMs },
  );

  const handleInputChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const nextVal = numeric ? (raw === "" ? "" : Number(raw)) : raw;
    setLocalValue(nextVal);
    debouncedOnChange.run(nextVal);
  });

  const handleClear = useMemoizedFn(() => {
    debouncedOnChange.cancel();
    const emptyVal = numeric ? 0 : "";
    setLocalValue(emptyVal);
    onChange(emptyVal);
  });

  const handleBlur = useMemoizedFn(() => {
    debouncedOnChange.flush();
    onBlur?.();
  });

  const currentEffectiveType = isPassword ? (showPassword ? "text" : "password") : baseType;
  const hasValue = localValue != null && localValue !== "";
  const hasAdornments =
    Boolean(prefix) || Boolean(suffix) || (clearable && hasValue && !disabled && !readOnly) || isPassword;

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
            <InputGroupButton size="icon-xs" variant="ghost" onClick={handleClear} aria-label="清除内容">
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

const TextInputInner = memo(function TextInputInner(props: TextInputInnerProps) {
  if ((props.debounceMs ?? 0) > 0) {
    return <DebouncedTextInputInner {...props} />;
  }
  return <StandardTextInputInner {...props} />;
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
    <FormFieldEngine<string | number> {...(fieldProps as any)}>
      {({ id, value, onChange, onBlur, disabled, readOnly, hasError }) => (
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
          onChange={onChange}
          onBlur={onBlur}
          hasError={hasError}
          debounceMs={debounceMs}
        />
      )}
    </FormFieldEngine>
  );
}
