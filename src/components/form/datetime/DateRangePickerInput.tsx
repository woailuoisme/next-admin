import type { DateRange } from "react-day-picker";

import { useMemoizedFn } from "ahooks";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

import { type BaseInputProps, type DateRangeValue, FormFieldEngine } from "../core";
import { parseDate } from "./dateUtils";

export interface DateRangePickerInputProps extends BaseInputProps {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onChange?: (value: DateRangeValue | undefined) => void;
  onBlur?: () => void;
  dateFormat?: string;
  clearable?: boolean;
}

interface DateRangePickerControlProps {
  id: string;
  placeholder: string;
  disabled?: boolean;
  dateFormat: string;
  clearable: boolean;
  value?: DateRangeValue;
  onChange: (value: DateRangeValue | undefined) => void;
  onBlur?: () => void;
  hasError?: boolean;
}

const DateRangePickerControl = memo(function DateRangePickerControl({
  id,
  placeholder,
  disabled,
  dateFormat,
  clearable,
  value,
  onChange,
  onBlur,
  hasError,
}: DateRangePickerControlProps) {
  const [open, setOpen] = useState(false);

  const fromDate = parseDate(value?.from);
  const toDate = parseDate(value?.to);
  const rangeSelected: DateRange | undefined = fromDate || toDate ? { from: fromDate, to: toDate } : undefined;

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
    <div className="relative flex w-full items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            onBlur={onBlur}
            className={cn(
              "h-8 w-full justify-start rounded-md bg-transparent px-2.5 pr-8 text-left text-xs font-normal",
              !fromDate && "text-muted-foreground",
              hasError && "border-destructive focus-visible:ring-destructive/20",
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
  return (
    <FormFieldEngine<DateRangeValue | undefined>
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
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
    >
      {({ id, value, onChange, onBlur, disabled: isDisabled, hasError }) => (
        <DateRangePickerControl
          id={id}
          placeholder={placeholder}
          disabled={isDisabled}
          dateFormat={dateFormat}
          clearable={clearable}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          hasError={hasError}
        />
      )}
    </FormFieldEngine>
  );
});
