"use client";

import { useMemoizedFn } from "ahooks";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "cn";

import { type BaseInputProps, FieldClearButton, FormFieldEngine } from "../core";

export interface TimePickerInputProps extends BaseInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  step?: number;
  clearable?: boolean;
}

interface TimePickerControlProps {
  id: string;
  step: number;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  clearable?: boolean;
  hasError?: boolean;
  describedBy?: string;
  clearAriaLabel: string;
}

const TimePickerControl = memo(function TimePickerControl({
  id,
  step,
  value,
  onChange,
  onBlur,
  disabled,
  readOnly,
  placeholder,
  clearable,
  hasError,
  describedBy,
  clearAriaLabel,
}: TimePickerControlProps) {
  const handleClear = useMemoizedFn((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  });

  const handleInputChange = useMemoizedFn((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  });

  return (
    <div className="relative flex w-full items-center">
      <div className="text-muted-foreground pointer-events-none absolute left-2.5">
        <Clock className="size-3.5" aria-hidden="true" />
      </div>
      <Input
        id={id}
        type="time"
        step={step}
        value={value}
        onChange={handleInputChange}
        onBlur={onBlur}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        className={cn(
          "h-8 bg-transparent pr-7 pl-8 font-mono text-xs",
          hasError && "border-destructive focus-visible:ring-destructive/20",
        )}
      />
      {clearable && value && !disabled && !readOnly && (
        <FieldClearButton onClick={handleClear} ariaLabel={clearAriaLabel} className="absolute right-1.5" />
      )}
    </div>
  );
});

export const TimePickerInput = memo(function TimePickerInput({
  placeholder = "--:--",
  defaultValue = "",
  step = 60,
  clearable = true,
  ...fieldProps
}: TimePickerInputProps) {
  const t = useTranslations("form");

  return (
    <FormFieldEngine<string> defaultValue={defaultValue} {...fieldProps}>
      {({ id, value = "", onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy }) => (
        <TimePickerControl
          id={id}
          step={step}
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          onBlur={onBlur}
          disabled={isDisabled}
          readOnly={isReadOnly}
          placeholder={placeholder}
          clearable={clearable}
          hasError={hasError}
          describedBy={describedBy}
          clearAriaLabel={t("time_clear")}
        />
      )}
    </FormFieldEngine>
  );
});
