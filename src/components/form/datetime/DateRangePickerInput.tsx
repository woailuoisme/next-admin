import type { DateRange } from "react-day-picker";

import { useMemoizedFn } from "ahooks";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { memo, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { type BaseInputProps, type DateRangeValue, FieldConnector, FieldWrapper } from "../core";
import { parseDate } from "./date-utils";

export interface DateRangePickerInputProps extends BaseInputProps {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onChange?: (value: DateRangeValue | undefined) => void;
  onBlur?: () => void;
  dateFormat?: string;
  clearable?: boolean;
}

interface DateRangePickerInputInnerProps {
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
  value?: DateRangeValue;
  onChange: (value: DateRangeValue | undefined) => void;
}

const DateRangePickerInputInner = memo(function DateRangePickerInputInner({
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
  value,
  onChange,
}: DateRangePickerInputInnerProps) {
  const [open, setOpen] = useState(false);

  const fromDate = parseDate(value?.from);
  const toDate = parseDate(value?.to);
  const rangeSelected: DateRange | undefined =
    fromDate || toDate ? { from: fromDate, to: toDate } : undefined;

  const handleSelect = useMemoizedFn((range: DateRange | undefined) => {
    if (!range) {
      onChange(undefined);
    } else {
      onChange({
        from: range.from,
        to: range.to,
      });
    }
  });

  const handleClear = useMemoizedFn((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  });

  let displayLabel = placeholder;
  if (fromDate && toDate) {
    displayLabel = `${format(fromDate, dateFormat)} ~ ${format(toDate, dateFormat)}`;
  } else if (fromDate) {
    displayLabel = `${format(fromDate, dateFormat)} ~ ...`;
  }

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
                !fromDate && "text-muted-foreground",
                computedError && "border-destructive focus-visible:ring-destructive/20",
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <CalendarIcon className="text-muted-foreground size-3.5 shrink-0" />
                <span className="truncate">{displayLabel}</span>
              </div>
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto rounded-xl p-0" align="start">
            <Calendar mode="range" numberOfMonths={2} selected={rangeSelected} onSelect={handleSelect} />
          </PopoverContent>
        </Popover>

        {clearable && (fromDate || toDate) && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground/70 hover:text-destructive absolute right-2 cursor-pointer rounded-sm p-0.5 transition-colors"
            aria-label="清除日期范围"
          >
            <X className="size-3" />
          </button>
        )}
      </div>
    </FieldWrapper>
  );
});

export const DateRangePickerInput = memo(function DateRangePickerInput({
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
  placeholder = "请选择日期范围...",
  disabled,
  value: controlledValue,
  defaultValue,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  dateFormat = "yyyy-MM-dd",
  clearable = true,
}: DateRangePickerInputProps) {
  const autoId = useId();
  const id = explicitId || (name ? `field-${name}` : autoId);

  return (
    <FieldConnector<DateRangeValue | undefined>
      name={name}
      form={form}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
      error={error}
    >
      {({ value, onChange, error: computedError }) => (
        <DateRangePickerInputInner
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
          value={value}
          onChange={onChange}
        />
      )}
    </FieldConnector>
  );
});
