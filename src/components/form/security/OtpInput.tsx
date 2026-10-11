import { useMemoizedFn } from "ahooks";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Fragment, memo, useId, useMemo } from "react";

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

import { type BaseInputProps, FieldConnector, FieldWrapper, resolveFieldHasError } from "../core";

export interface OtpInputProps extends BaseInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  length?: number;
  groupSize?: number;
  mask?: boolean;
  numericOnly?: boolean;
  autoFocus?: boolean;
  onComplete?: (code: string) => void;
  containerClassName?: string;
  slotClassName?: string;
}

interface OtpInputInnerProps {
  id: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  length?: number;
  groupSize?: number;
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

const OtpInputInner = memo(function OtpInputInner({
  id,
  value = "",
  onChange,
  onBlur,
  length = 6,
  groupSize = 3,
  mask = false,
  numericOnly = true,
  autoFocus = false,
  disabled = false,
  readOnly = false,
  onComplete,
  containerClassName,
  slotClassName,
  hasError,
}: OtpInputInnerProps) {
  const handleValueChange = useMemoizedFn((nextValue: string) => {
    onChange(nextValue);
    if (nextValue.length === length) {
      onComplete?.(nextValue);
    }
  });

  // Split slot indices into groups
  const groups = useMemo(() => {
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
  }, [length, groupSize]);

  const pattern = numericOnly ? REGEXP_ONLY_DIGITS : undefined;

  return (
    <div className={cn("flex flex-col items-start py-0.5", containerClassName)}>
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
      >
        {groups.map((group, groupIdx) => (
          <Fragment key={groupIdx}>
            {groupIdx > 0 && <InputOTPSeparator />}
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
  defaultValue,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  length = 6,
  groupSize = 3,
  mask = false,
  numericOnly = true,
  autoFocus = false,
  onComplete,
  containerClassName,
  slotClassName,
}: OtpInputProps) {
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
            <OtpInputInner
              id={id}
              value={typeof value === "string" ? value : ""}
              onChange={onChange}
              onBlur={onBlur}
              length={length}
              groupSize={groupSize}
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
          </FieldWrapper>
        );
      }}
    />
  );
}
