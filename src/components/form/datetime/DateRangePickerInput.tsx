"use client";

import type { DateRange } from "react-day-picker";

import { useMemoizedFn } from "ahooks";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

import { type BaseInputProps, type DateRangeValue, FieldClearButton, FormFieldEngine } from "../core";
import { parseDate } from "./dateUtils";

const LazyCalendar = dynamic(() => import("@/components/ui/calendar").then((mod) => mod.Calendar), {
  ssr: false,
  loading: () => <div className="text-muted-foreground flex h-64 w-80 items-center justify-center text-xs">...</div>,
});

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
  readOnly?: boolean;
  dateFormat: string;
  clearable: boolean;
  value?: DateRangeValue;
  onChange: (value: DateRangeValue | undefined) => void;
  onBlur?: () => void;
  hasError?: boolean;
  describedBy?: string;
  clearAriaLabel: string;
}

const DateRangePickerControl = memo(function DateRangePickerControl({
  id,
  placeholder,
  disabled,
  readOnly,
  dateFormat,
  clearable,
  value,
  onChange,
  onBlur,
  hasError,
  describedBy,
  clearAriaLabel,
}: DateRangePickerControlProps) {
  const [open, setOpen] = useState(false);
  const locked = Boolean(disabled || readOnly);

  const fromDate = parseDate(value?.from);
  const toDate = parseDate(value?.to);
  const rangeSelected: DateRange | undefined = fromDate || toDate ? { from: fromDate, to: toDate } : undefined;

  const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
    if (locked && nextOpen) return;
    setOpen(nextOpen);
    if (!nextOpen) onBlur?.();
  });

  const handleSelect = useMemoizedFn((range: DateRange | undefined) => {
    if (locked) return;
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
    if (!locked) onChange(undefined);
  });

  let displayLabel = placeholder;
  if (fromDate && toDate) {
    displayLabel = `${format(fromDate, dateFormat)} ~ ${format(toDate, dateFormat)}`;
  } else if (fromDate) {
    displayLabel = `${format(fromDate, dateFormat)} ~ ...`;
  }

  return (
    <div className="relative flex w-full items-center">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-readonly={readOnly}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            className={cn(
              "h-8 w-full justify-start rounded-md bg-transparent px-2.5 pr-8 text-left text-xs font-normal",
              !fromDate && "text-muted-foreground",
              hasError && "border-destructive focus-visible:ring-destructive/20",
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <CalendarIcon aria-hidden="true" className="text-muted-foreground size-3.5 shrink-0" />
              <span className="truncate">{displayLabel}</span>
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto rounded-xl p-0" align="start">
          {open ? (
            <LazyCalendar mode="range" numberOfMonths={2} selected={rangeSelected} onSelect={handleSelect} />
          ) : null}
        </PopoverContent>
      </Popover>

      {clearable && (fromDate || toDate) && !locked && (
        <FieldClearButton
          onClick={handleClear}
          ariaLabel={clearAriaLabel}
          className="hover:text-destructive absolute right-2"
        />
      )}
    </div>
  );
});

export const DateRangePickerInput = memo(function DateRangePickerInput({
  placeholder,
  dateFormat = "yyyy-MM-dd",
  clearable = true,
  ...fieldProps
}: DateRangePickerInputProps) {
  const t = useTranslations("form");
  const resolvedPlaceholder = placeholder ?? t("daterange_placeholder");

  return (
    <FormFieldEngine<DateRangeValue | undefined> {...fieldProps}>
      {({ id, value, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy }) => (
        <DateRangePickerControl
          id={id}
          placeholder={resolvedPlaceholder}
          disabled={isDisabled}
          readOnly={isReadOnly}
          dateFormat={dateFormat}
          clearable={clearable}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          hasError={hasError}
          describedBy={describedBy}
          clearAriaLabel={t("daterange_clear")}
        />
      )}
    </FormFieldEngine>
  );
});
