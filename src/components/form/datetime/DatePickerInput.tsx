"use client";

import { useMemoizedFn } from "ahooks";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

import { type BaseInputProps, FieldClearButton, FormFieldEngine } from "../core";
import { parseDate } from "./dateUtils";

const LazyCalendar = dynamic(() => import("@/components/ui/calendar").then((mod) => mod.Calendar), {
  ssr: false,
  loading: () => <div className="text-muted-foreground flex h-64 w-64 items-center justify-center text-xs">...</div>,
});

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

interface DatePickerControlProps {
  id: string;
  placeholder: string;
  disabled?: boolean;
  readOnly?: boolean;
  dateFormat: string;
  clearable: boolean;
  outputFormat: "date" | "iso" | "string";
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  hasError: boolean;
  describedBy?: string;
  clearAriaLabel: string;
}

const DatePickerControl = memo(function DatePickerControl({
  id,
  placeholder,
  disabled,
  readOnly,
  dateFormat,
  clearable,
  outputFormat,
  value,
  onChange,
  onBlur,
  hasError,
  describedBy,
  clearAriaLabel,
}: DatePickerControlProps) {
  const [open, setOpen] = useState(false);
  const closePopover = useMemoizedFn(() => setOpen(false));
  const selectedDate = parseDate(value);
  const locked = Boolean(disabled || readOnly);

  const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
    if (locked && nextOpen) return;
    setOpen(nextOpen);
    if (!nextOpen) onBlur?.();
  });

  const handleSelect = useMemoizedFn((date: Date | undefined) => {
    if (locked) return;
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
    if (!locked) onChange(undefined);
  });

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
          {open ? <LazyCalendar mode="single" selected={selectedDate} onSelect={handleSelect} /> : null}
        </PopoverContent>
      </Popover>

      {clearable && selectedDate && !locked && (
        <FieldClearButton
          onClick={handleClear}
          ariaLabel={clearAriaLabel}
          className="hover:text-destructive absolute right-2"
        />
      )}
    </div>
  );
});

export const DatePickerInput = memo(function DatePickerInput({
  dateFormat = "yyyy-MM-dd",
  clearable = true,
  outputFormat = "iso",
  placeholder,
  ...fieldProps
}: DatePickerInputProps) {
  const t = useTranslations("form");
  const resolvedPlaceholder = placeholder ?? t("date_placeholder");

  return (
    <FormFieldEngine {...fieldProps}>
      {({ id, value, onChange, onBlur, disabled, readOnly, hasError, describedBy }) => (
        <DatePickerControl
          id={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          hasError={hasError}
          describedBy={describedBy}
          dateFormat={dateFormat}
          clearable={clearable}
          outputFormat={outputFormat}
          placeholder={resolvedPlaceholder}
          clearAriaLabel={t("date_clear")}
        />
      )}
    </FormFieldEngine>
  );
});
