import { useBoolean, useMemoizedFn } from "ahooks";
import { ArrowUpSquare, Eye, EyeOff, X } from "lucide-react";
import { type ChangeEvent, type KeyboardEvent, memo, useId, useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

import {
  type BaseInputProps,
  FieldConnector,
  FieldWrapper,
  type PasswordRequirement,
  resolveFieldHasError,
} from "../core";
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
  const [visible, { toggle: toggleVisible }] = useBoolean(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [localValue, setLocalValue] = useState(value ?? "");
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setLocalValue(value ?? "");
  }

  const handleInputChange = useMemoizedFn((e: ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setLocalValue(nextVal);
    onChange(nextVal);
  });

  const handleClear = useMemoizedFn(() => {
    setLocalValue("");
    onChange("");
  });

  const checkCapsLock = useMemoizedFn((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState("CapsLock"));
    }
  });

  const hasValue = Boolean(localValue);

  return (
    <div className="w-full space-y-1.5">
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
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={checkCapsLock}
          onKeyUp={checkCapsLock}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={autoComplete}
          aria-invalid={hasError}
          className={inputClassName}
        />

        {capsLockActive && !disabled && (
          <InputGroupAddon align="inline-end" className="pr-1">
            <span
              title="Caps Lock is active"
              className="bg-muted text-muted-foreground flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px]"
            >
              <ArrowUpSquare className="size-3 text-amber-500" />
              <span className="hidden sm:inline">CAPS</span>
            </span>
          </InputGroupAddon>
        )}

        {clearable && hasValue && !disabled && !readOnly && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              variant="ghost"
              onClick={handleClear}
              aria-label="Clear password"
            >
              <X className="size-3" />
            </InputGroupButton>
          </InputGroupAddon>
        )}

        {!disabled && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              variant="ghost"
              onClick={toggleVisible}
              aria-label={visible ? "Hide password" : "Show password"}
            >
              {visible ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>

      {showStrength && <PasswordStrengthMeter password={localValue} requirements={requirements} />}
    </div>
  );
});

export function PasswordInput({
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
  clearable = false,
  showStrength = false,
  requirements,
  inputClassName,
  autoComplete,
}: PasswordInputProps) {
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
          </FieldWrapper>
        );
      }}
    />
  );
}
