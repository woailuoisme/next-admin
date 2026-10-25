import { useMemoizedFn } from "ahooks";
import { ArrowUpSquare, Eye, EyeOff, X } from "lucide-react";
import { type ChangeEvent, type KeyboardEvent, memo, useState } from "react";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "cn";

import { type BaseInputProps, FormFieldEngine, type PasswordRequirement } from "../core";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

export interface PasswordInputProps extends BaseInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  clearable?: boolean;
  showStrength?: boolean;
  requirements?: PasswordRequirement[];
  inputClassName?: string;
  autoComplete?: string;
}

interface PasswordInputInnerProps {
  id: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  showStrength?: boolean;
  requirements?: PasswordRequirement[];
  inputClassName?: string;
  autoComplete?: string;
  hasError?: boolean;
}

const PasswordInputInner = memo(function PasswordInputInner({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "Enter password",
  disabled,
  readOnly,
  clearable = false,
  showStrength = false,
  requirements,
  inputClassName,
  autoComplete = "current-password",
  hasError,
}: PasswordInputInnerProps) {
  const [visible, setVisible] = useState(false);
  const toggleVisible = useMemoizedFn(() => setVisible((prev) => !prev));
  const [capsLockActive, setCapsLockActive] = useState(false);

  const handleInputChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  });

  const handleClear = useMemoizedFn(() => {
    onChange("");
  });

  const checkCapsLock = useMemoizedFn((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState("CapsLock"));
    }
  });

  const stringVal = value ?? "";
  const hasValue = stringVal.length > 0;

  return (
    <div className="w-full space-y-2">
      <InputGroup
        className={cn(
          "w-full rounded-md",
          hasError && "border-destructive ring-destructive/20",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <InputGroupInput
          id={id}
          type={visible ? "text" : "password"}
          value={stringVal}
          onChange={handleInputChange}
          onKeyDown={checkCapsLock}
          onKeyUp={checkCapsLock}
          onBlur={() => {
            setCapsLockActive(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={autoComplete}
          aria-invalid={hasError}
          className={cn("pr-2 text-xs", inputClassName)}
        />

        {/* CapsLock Indicator Addon */}
        {capsLockActive && !disabled && (
          <InputGroupAddon align="inline-end" title="Caps Lock is ON" className="text-amber-500">
            <ArrowUpSquare className="size-3.5 animate-pulse" />
          </InputGroupAddon>
        )}

        {/* Clear Button Addon */}
        {clearable && hasValue && !disabled && !readOnly && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              size="icon-xs"
              variant="ghost"
              onClick={handleClear}
              aria-label="Clear password"
            >
              <X className="size-3" />
            </InputGroupButton>
          </InputGroupAddon>
        )}

        {/* Password Visibility Toggle */}
        {!disabled && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              size="icon-xs"
              variant="ghost"
              onClick={toggleVisible}
              aria-label={visible ? "Hide password" : "Show password"}
            >
              {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>

      {/* Visual Strength Meter */}
      {showStrength && hasValue && (
        <div className="pt-1">
          <PasswordStrengthMeter password={stringVal} requirements={requirements} />
        </div>
      )}
    </div>
  );
});

export const PasswordInput = memo(function PasswordInput({
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
  defaultValue = "",
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  clearable = false,
  showStrength = false,
  requirements,
  inputClassName,
  autoComplete,
}: PasswordInputProps) {
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
      readOnly={readOnly}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
    >
      {({ id, value, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError }) => (
        <PasswordInputInner
          id={id}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={isDisabled}
          readOnly={isReadOnly}
          clearable={clearable}
          showStrength={showStrength}
          requirements={requirements}
          inputClassName={inputClassName}
          autoComplete={autoComplete}
          hasError={hasError}
        />
      )}
    </FormFieldEngine>
  );
});
