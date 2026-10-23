import { useMemoizedFn } from "ahooks";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { type BaseInputProps, FieldConnector, FieldWrapper, useFieldId } from "../core";
import { parseDate } from "./dateUtils";

export interface DatePickerInputProps extends BaseInputProps {
  value?: Date | string;
  defaultValue?: Date | string;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  dateFormat?: string;
  clearable?: boolean;
  prefix?: React.ReactNode;
  outputFormat?: "date" | "iso" | "string";
}

interface DatePickerInputInnerProps {
  id: string;
  label?: React.ReactNode;
  required?: boolean;
  hint?: React.ReactNode;
  helperText?: React.ReactNode;
  tooltip?: React.ReactNode;
  computedError?: React.ReactNode;
  colSpan?: BaseInputProps["colSpan"];
  className?: string;
  hidden?: boolean;
  placeholder: string;
  disabled?: boolean;
  dateFormat: string;
  clearable: boolean;
  outputFormat: "date" | "iso" | "string";
  value: any;
  onChange: (value: any) => void;
}

const DatePickerInputInner = memo(function DatePickerInputInner({
  id,
  label,
  required,
  hint,
  helperText,
  tooltip,
  computedError,
  colSpan,
  className,
  hidden,
  placeholder,
  disabled,
  dateFormat,
  clearable,
  outputFormat,
  value,
  onChange,
}: DatePickerInputInnerProps) {
  const [open, setOpen] = useState(false);
  const closePopover = useMemoizedFn(() => setOpen(false));
  const selectedDate = parseDate(value);
  const hasError = Boolean(computedError);

  const handleSelect = useMemoizedFn((date: Date | undefined) => {
    if (!date) {
      onChange(undefined);
    } else if (outputFormat === "date") {
      onChange(date);
    } else if (outputFormat === "string") {
      onChange(format(date, dateFormat));
    } else {
      onChange(date.toISOString());
    }
    closePopover();
  });

  const handleClear = useMemoizedFn((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  });

  return (
    <FieldWrapper
      label={label}
      id={id}
      required={required}
      hint={hint}
      helperText={helperText}
      tooltip={tooltip}
      error={computedError}
      colSpan={colSpan}
      className={className}
      hidden={hidden}
    >
      <div className="relative flex w-full items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                "h-8 w-full justify-start rounded-md bg-transparent px-2.5 pr-8 text-left text-xs font-normal",
                !selectedDate && "text-muted-foreground",
                hasError && "border-destructive focus-visible:ring-destructive/20",
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <CalendarIcon className="text-muted-foreground size-3.5 shrink-0" />
                <span className="truncate">{selectedDate ? format(selectedDate, dateFormat) : placeholder}</span>
              </div>
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto rounded-xl p-0" align="start">
            <Calendar mode="single" selected={selectedDate} onSelect={handleSelect} />
          </PopoverContent>
        </Popover>

        {clearable && selectedDate && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground/70 hover:text-destructive absolute right-2 cursor-pointer rounded-sm p-0.5 transition-colors"
            aria-label="清除日期"
          >
            <X className="size-3" />
          </button>
        )}
      </div>
    </FieldWrapper>
  );
});

export const DatePickerInput = memo(function DatePickerInput({
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
  placeholder = "请选择日期...",
  disabled,
  value: controlledValue,
  defaultValue,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  dateFormat = "yyyy-MM-dd",
  clearable = true,
  outputFormat = "iso",
}: DatePickerInputProps) {
  const id = useFieldId(name, explicitId);

  return (
    <FieldConnector<any>
      name={name}
      form={form}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
      error={error}
    >
      {({ value, onChange, error: computedError }) => (
        <DatePickerInputInner
          id={id}
          label={label}
          required={required}
          hint={hint}
          helperText={helperText}
          tooltip={tooltip}
          computedError={computedError}
          colSpan={colSpan}
          className={className}
          hidden={hidden}
          placeholder={placeholder}
          disabled={disabled}
          dateFormat={dateFormat}
          clearable={clearable}
          outputFormat={outputFormat}
          value={value}
          onChange={onChange}
        />
      )}
    </FieldConnector>
  );
});
