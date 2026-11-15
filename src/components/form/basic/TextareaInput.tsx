"use client";

import { useMemoizedFn } from "ahooks";
import { type ChangeEvent, memo } from "react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "cn";

import { type BaseInputProps, FormFieldEngine, useDebouncedFieldValue } from "../core";

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
  describedBy?: string;
  debounceMs?: number;
  textareaClassName?: string;
}

const TextareaInputInner = memo(function TextareaInputInner({
  id,
  value = "",
  onChange,
  onBlur,
  rows = 3,
  maxLength,
  placeholder,
  disabled,
  readOnly,
  hasError,
  describedBy,
  debounceMs = 0,
  textareaClassName,
}: TextareaInputInnerProps) {
  const { displayValue, handleChange, handleBlur } = useDebouncedFieldValue<string>({
    value,
    debounceMs,
    onChange,
    onBlur,
  });

  const handleTextareaChange = useMemoizedFn((e: ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e.target.value);
  });

  return (
    <Textarea
      id={id}
      rows={rows}
      maxLength={maxLength}
      value={displayValue}
      onChange={handleTextareaChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      aria-invalid={hasError}
      aria-describedby={describedBy}
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
  placeholder,
  defaultValue = "",
  rows = 3,
  maxLength,
  showCount = false,
  debounceMs,
  textareaClassName,
  ...fieldProps
}: TextareaInputProps) {
  return (
    <FormFieldEngine<string> defaultValue={defaultValue} {...fieldProps}>
      {({ id, value, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy }) => {
        const currentLength = (value ?? "").length;

        return (
          <div className="w-full space-y-1">
            <TextareaInputInner
              id={id}
              rows={rows}
              maxLength={maxLength}
              value={typeof value === "string" ? value : ""}
              onChange={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={isDisabled}
              readOnly={isReadOnly}
              hasError={hasError}
              describedBy={describedBy}
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
                {maxLength ? ` / ${maxLength}` : ""}
              </div>
            )}
          </div>
        );
      }}
    </FormFieldEngine>
  );
});
