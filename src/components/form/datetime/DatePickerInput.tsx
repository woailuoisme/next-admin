import { useMemoizedFn } from "ahooks";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

import { type BaseInputProps, FormFieldEngine } from "../core";
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

interface DatePickerControlProps {
  id: string;
  placeholder: string;
  disabled?: boolean;
  dateFormat: string;
  clearable: boolean;
  outputFormat: "date" | "iso" | "string";
  value: any;
  onChange: (value: any) => void;
  hasError: boolean;
}

const DatePickerControl = memo(function DatePickerControl({
  id,
  placeholder,
  disabled,
  dateFormat,
  clearable,
  outputFormat,
  value,
  onChange,
  hasError,
}: DatePickerControlProps) {
  const [open, setOpen] = useState(false);
  const closePopover = useMemoizedFn(() => setOpen(false));
  const selectedDate = parseDate(value);

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
  );
});

export const DatePickerInput = memo(function DatePickerInput({
  dateFormat = "yyyy-MM-dd",
  clearable = true,
  outputFormat = "iso",
  placeholder = "选择日期...",
  ...fieldProps
}: DatePickerInputProps) {
  return (
    <FormFieldEngine {...fieldProps}>
      {({ id, value, onChange, disabled, hasError }) => (
        <DatePickerControl
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          hasError={hasError}
          dateFormat={dateFormat}
          clearable={clearable}
          outputFormat={outputFormat}
          placeholder={placeholder}
        />
      )}
    </FormFieldEngine>
  );
});
