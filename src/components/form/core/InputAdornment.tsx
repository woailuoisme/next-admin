"use client";

import { useTranslations } from "next-intl";
import { useDebounceFn, useMemoizedFn } from "ahooks";
import { Eye, EyeOff, X } from "lucide-react";
import { type ChangeEvent, type FocusEvent, type KeyboardEvent, type ReactNode, memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { cn } from "cn";

export interface UseDebouncedFieldValueOptions<T> {
  value: T;
  debounceMs?: number;
  onChange: (value: T) => void;
  onBlur?: () => void;
}

interface DraftState<T> {
  base: T;
  committed?: T;
  hasCommitted?: boolean;
  current: T;
}

/**
 * Manages local typing draft during debounce without render-phase setState or useEffect.
 * Automatically discards the draft when an external update (e.g., form reset) diverges from
 * both the starting base and our own last committed value.
 */
export function useDebouncedFieldValue<T>({
  value,
  debounceMs = 0,
  onChange,
  onBlur,
}: UseDebouncedFieldValueOptions<T>) {
  const isDebounced = debounceMs > 0;
  const [draft, setDraft] = useState<DraftState<T> | null>(null);

  const debouncedCommit = useDebounceFn(
    (nextVal: T) => {
      setDraft((prev) =>
        prev && !Object.is(prev.current, nextVal) ? { ...prev, hasCommitted: true, committed: nextVal } : null,
      );
      onChange(nextVal);
    },
    { wait: Math.max(debounceMs, 0) },
  );

  const isActiveDraft =
    isDebounced &&
    draft !== null &&
    (Object.is(draft.base, value) || (Boolean(draft.hasCommitted) && Object.is(draft.committed, value)));

  const displayValue = isActiveDraft ? draft.current : value;

  const handleChange = useMemoizedFn((nextVal: T) => {
    if (!isDebounced) {
      onChange(nextVal);
      return;
    }
    setDraft((prev) => {
      const sameBase =
        prev !== null &&
        (Object.is(prev.base, value) || (Boolean(prev.hasCommitted) && Object.is(prev.committed, value)));
      return {
        base: sameBase ? prev.base : value,
        committed: sameBase ? prev.committed : undefined,
        hasCommitted: sameBase ? prev.hasCommitted : false,
        current: nextVal,
      };
    });
    debouncedCommit.run(nextVal);
  });

  const handleClear = useMemoizedFn((emptyVal: T) => {
    if (isDebounced) {
      debouncedCommit.cancel();
      setDraft(null);
    }
    onChange(emptyVal);
  });

  const handleBlur = useMemoizedFn(() => {
    if (isDebounced) {
      debouncedCommit.flush();
    }
    onBlur?.();
  });

  return {
    displayValue,
    handleChange,
    handleClear,
    handleBlur,
  };
}

export interface FieldClearButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
  className?: string;
}

export const FieldClearButton = memo(function FieldClearButton({
  onClick,
  ariaLabel,
  className,
}: FieldClearButtonProps) {
  const t = useTranslations("form");
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={onClick}
      aria-label={ariaLabel ?? t("clear_value")}
      className={cn(
        "text-muted-foreground hover:text-foreground relative size-5 cursor-pointer rounded-full p-0 after:absolute after:-inset-1 after:content-['']",
        className,
      )}
    >
      <X className="size-3" aria-hidden="true" />
    </Button>
  );
});

export interface AdornedInputProps {
  id: string;
  type?: string;
  value?: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onKeyUp?: (e: KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  isPassword?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  extraEndAddon?: ReactNode;
  min?: number;
  max?: number;
  step?: number;
  autoComplete?: string;
  inputMode?: "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";
  hasError?: boolean;
  describedBy?: string;
  inputClassName?: string;
  clearAriaLabel?: string;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
}

export const AdornedInput = memo(function AdornedInput({
  id,
  type = "text",
  value,
  onChange,
  onClear,
  onBlur,
  onKeyDown,
  onKeyUp,
  placeholder,
  disabled,
  readOnly,
  clearable,
  isPassword,
  prefix,
  suffix,
  extraEndAddon,
  min,
  max,
  step,
  autoComplete,
  inputMode,
  hasError,
  describedBy,
  inputClassName,
  clearAriaLabel,
  showPasswordLabel,
  hidePasswordLabel,
}: AdornedInputProps) {
  const t = useTranslations("form");
  const resolvedClearLabel = clearAriaLabel ?? t("clear_value");
  const resolvedShowPasswordLabel = showPasswordLabel ?? t("password_show");
  const resolvedHidePasswordLabel = hidePasswordLabel ?? t("password_hide");
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = useMemoizedFn(() => setShowPassword((prev) => !prev));

  const currentType = isPassword ? (showPassword ? "text" : "password") : type;
  const hasValue = value != null && value !== "";
  const canClear = Boolean(clearable && onClear && hasValue && !disabled && !readOnly);
  const hasAdornments = Boolean(prefix) || Boolean(suffix) || canClear || Boolean(isPassword) || Boolean(extraEndAddon);

  if (!hasAdornments) {
    return (
      <Input
        id={id}
        type={currentType}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        min={min}
        max={max}
        step={step}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        className={cn("rounded-md", inputClassName)}
      />
    );
  }

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
        type={currentType}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        min={min}
        max={max}
        step={step}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        className={inputClassName}
      />

      {extraEndAddon}

      {canClear && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            size="icon-xs"
            variant="ghost"
            onClick={onClear}
            aria-label={resolvedClearLabel}
          >
            <X className="size-3" aria-hidden="true" />
          </InputGroupButton>
        </InputGroupAddon>
      )}

      {isPassword && !disabled && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            size="icon-xs"
            variant="ghost"
            onClick={togglePassword}
            aria-label={showPassword ? resolvedHidePasswordLabel : resolvedShowPasswordLabel}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff className="size-3.5" aria-hidden="true" />
            ) : (
              <Eye className="size-3.5" aria-hidden="true" />
            )}
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
});
