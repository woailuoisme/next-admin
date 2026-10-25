import { useMemoizedFn } from "ahooks";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Fragment, memo, useMemo } from "react";

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "cn";

import { type BaseInputProps, FormFieldEngine } from "../core";

export interface OtpInputProps extends BaseInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  length?: number;
  groupSize?: number;
  separator?: boolean;
  align?: "left" | "center" | "right";
  mask?: boolean;
  numericOnly?: boolean;
  autoFocus?: boolean;
  onComplete?: (code: string) => void;
  containerClassName?: string;
  slotClassName?: string;
}

interface OtpControlProps {
  id: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  length?: number;
  groupSize?: number;
  separator?: boolean;
  align?: "left" | "center" | "right";
  mask?: boolean;
  numericOnly?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  onComplete?: (code: string) => void;
  containerClassName?: string;
  slotClassName?: string;
  hasError?: boolean;
}

const OtpControl = memo(function OtpControl({
  id,
  value = "",
  onChange,
  onBlur,
  length = 6,
  groupSize = 3,
  separator = true,
  align = "left",
  mask = false,
  numericOnly = true,
  autoFocus = false,
  disabled = false,
  readOnly = false,
  onComplete,
  containerClassName,
  slotClassName,
  hasError,
}: OtpControlProps) {
  const handleValueChange = useMemoizedFn((nextValue: string) => {
    onChange(nextValue);
    if (nextValue.length === length) {
      onComplete?.(nextValue);
    }
  });

  // Split slot indices into groups
  const groups = useMemo(() => {
    if (separator === false) {
      return [Array.from({ length }, (_, i) => i)];
    }
    const result: number[][] = [];
    const effectiveGroupSize = groupSize > 0 && groupSize < length ? groupSize : length;
    for (let i = 0; i < length; i += effectiveGroupSize) {
      const group: number[] = [];
      for (let j = i; j < Math.min(i + effectiveGroupSize, length); j++) {
        group.push(j);
      }
      result.push(group);
    }
    return result;
  }, [length, groupSize, separator]);

  const pattern = numericOnly ? REGEXP_ONLY_DIGITS : undefined;

  return (
    <div
      className={cn(
        "flex flex-col py-0.5",
        align === "center" ? "items-center" : align === "right" ? "items-end" : "items-start",
        containerClassName,
      )}
    >
      <InputOTP
        id={id}
        maxLength={length}
        value={value}
        onChange={handleValueChange}
        onBlur={onBlur}
        pattern={pattern}
        autoFocus={autoFocus}
        disabled={disabled || readOnly}
        aria-invalid={hasError}
        aria-describedby={hasError && id ? `${id}-error` : undefined}
        containerClassName={cn(align === "center" && "justify-center", align === "right" && "justify-end")}
      >
        {groups.map((group, groupIdx) => (
          <Fragment key={groupIdx}>
            {groupIdx > 0 && separator && <InputOTPSeparator />}
            <InputOTPGroup>
              {group.map((slotIdx) => (
                <InputOTPSlot
                  key={slotIdx}
                  index={slotIdx}
                  className={cn(
                    hasError && "border-destructive text-destructive",
                    mask && "tracking-widest",
                    slotClassName,
                  )}
                />
              ))}
            </InputOTPGroup>
          </Fragment>
        ))}
      </InputOTP>
    </div>
  );
});

export function OtpInput({
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
  disabled,
  readOnly,
  value: controlledValue,
  defaultValue = "",
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  length = 6,
  groupSize = 3,
  separator = true,
  align = "left",
  mask = false,
  numericOnly = true,
  autoFocus = false,
  onComplete,
  containerClassName,
  slotClassName,
}: OtpInputProps) {
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
      align={align}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
    >
      {({ id, value = "", onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError }) => (
        <OtpControl
          id={id}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          onBlur={onBlur}
          length={length}
          groupSize={groupSize}
          separator={separator}
          align={align}
          mask={mask}
          numericOnly={numericOnly}
          autoFocus={autoFocus}
          disabled={isDisabled}
          readOnly={isReadOnly}
          onComplete={onComplete}
          containerClassName={containerClassName}
          slotClassName={slotClassName}
          hasError={hasError}
        />
      )}
    </FormFieldEngine>
  );
}
