import { useDebounceFn, useMemoizedFn } from "ahooks";
import { type ChangeEvent, memo, useId, useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { type BaseInputProps, FieldConnector, FieldWrapper } from "../core";

export interface TextareaInputProps extends BaseInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  debounceMs?: number;
  textareaClassName?: string;
}

interface TextareaInputInnerProps {
  id: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  hasError?: boolean;
  debounceMs?: number;
  textareaClassName?: string;
}

const TextareaInputInner = memo(function TextareaInputInner({
  id,
  value,
  onChange,
  onBlur,
  rows = 3,
  maxLength,
  placeholder,
  disabled,
  readOnly,
  hasError,
  debounceMs,
  textareaClassName,
}: TextareaInputInnerProps) {
  const [localValue, setLocalValue] = useState(value ?? "");
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setLocalValue(value ?? "");
  }

  const debouncedOnChange = useDebounceFn(
    (val: string) => {
      onChange(val);
    },
    { wait: debounceMs ?? 0 },
  );

  const handleTextareaChange = useMemoizedFn((e: ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setLocalValue(nextVal);
    if (debounceMs && debounceMs > 0) {
      debouncedOnChange.run(nextVal);
    } else {
      onChange(nextVal);
    }
  });

  const handleBlur = useMemoizedFn(() => {
    if (debounceMs && debounceMs > 0) {
      debouncedOnChange.flush();
    }
    onBlur?.();
  });

  return (
    <Textarea
      id={id}
      rows={rows}
      maxLength={maxLength}
      value={localValue}
      onChange={handleTextareaChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      aria-invalid={hasError}
      className={cn(
        "min-h-[80px] resize-y rounded-md",
        hasError && "border-destructive ring-destructive/20",
        disabled && "pointer-events-none opacity-50",
        textareaClassName,
      )}
    />
  );
});

export const TextareaInput = memo(function TextareaInput({
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
  rows = 3,
  maxLength,
  showCount = false,
  debounceMs,
  textareaClassName,
}: TextareaInputProps) {
  const autoId = useId();
  const id = explicitId || (name ? `field-${name}` : autoId);

  return (
    <FieldConnector<string>
      name={name}
      form={form}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
      error={error}
    >
      {({ value = "", onChange, onBlur, error: computedError }) => {
        const currentLength = (value ?? "").length;

        const effectiveHint =
          hint ||
          (showCount ? (
            <span
              className={cn(
                "text-[10px] tabular-nums",
                maxLength && currentLength > maxLength
                  ? "font-semibold text-destructive"
                  : "text-muted-foreground",
              )}
            >
              {currentLength}
              {maxLength ? ` / ${maxLength}` : " 字"}
            </span>
          ) : null);

        return (
          <FieldWrapper
            label={label}
            id={id}
            required={required}
            hint={effectiveHint}
            helperText={helperText}
            tooltip={tooltip}
            error={computedError}
            colSpan={colSpan}
            className={className}
            hidden={hidden}
          >
            <TextareaInputInner
              id={id}
              rows={rows}
              maxLength={maxLength}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readOnly}
              hasError={Boolean(computedError)}
              debounceMs={debounceMs}
              textareaClassName={textareaClassName}
            />
          </FieldWrapper>
        );
      }}
    </FieldConnector>
  );
});
