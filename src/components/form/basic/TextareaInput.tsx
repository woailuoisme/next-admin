import { useDebounceFn, useMemoizedFn } from "ahooks";
import { type ChangeEvent, memo, useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "cn";

import { type BaseInputProps, FormFieldEngine } from "../core";

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

const StandardTextareaInner = memo(function StandardTextareaInner({
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
  textareaClassName,
}: TextareaInputInnerProps) {
  const handleTextareaChange = useMemoizedFn((e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  });

  return (
    <Textarea
      id={id}
      rows={rows}
      maxLength={maxLength}
      value={value ?? ""}
      onChange={handleTextareaChange}
      onBlur={onBlur}
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

const DebouncedTextareaInner = memo(function DebouncedTextareaInner({
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
  debounceMs = 300,
  textareaClassName,
}: TextareaInputInnerProps) {
  const [localValue, setLocalValue] = useState(value ?? "");

  const debouncedOnChange = useDebounceFn(
    (val: string) => {
      onChange(val);
    },
    { wait: debounceMs },
  );

  const handleTextareaChange = useMemoizedFn((e: ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setLocalValue(nextVal);
    debouncedOnChange.run(nextVal);
  });

  const handleBlur = useMemoizedFn(() => {
    debouncedOnChange.flush();
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

const TextareaInputInner = memo(function TextareaInputInner(props: TextareaInputInnerProps) {
  if ((props.debounceMs ?? 0) > 0) {
    return <DebouncedTextareaInner {...props} />;
  }
  return <StandardTextareaInner {...props} />;
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
  defaultValue = "",
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  rows = 3,
  maxLength,
  showCount = false,
  debounceMs,
  textareaClassName,
}: TextareaInputProps) {
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
      {({ id, value, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError }) => {
        const currentLength = (value ?? "").length;

        return (
          <div className="w-full space-y-1">
            <TextareaInputInner
              id={id}
              rows={rows}
              maxLength={maxLength}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={isDisabled}
              readOnly={isReadOnly}
              hasError={hasError}
              debounceMs={debounceMs}
              textareaClassName={textareaClassName}
            />

            {showCount && (
              <div
                className={cn(
                  "text-right text-[10px] tabular-nums",
                  maxLength && currentLength > maxLength ? "font-semibold text-destructive" : "text-muted-foreground",
                )}
              >
                {currentLength}
                {maxLength ? ` / ${maxLength}` : " 字"}
              </div>
            )}
          </div>
        );
      }}
    </FormFieldEngine>
  );
});
