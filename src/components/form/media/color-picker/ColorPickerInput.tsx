"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { X } from "lucide-react";
import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

import { FormFieldEngine } from "../../core";
import { type ColorPickerInputProps, DEFAULT_COLOR_PRESETS } from "./types";

const DynamicColorPickerContent = dynamic(() => import("./ColorPickerContent").then((mod) => mod.ColorPickerContent), {
  ssr: false,
});

interface ColorPickerControlProps {
  id: string;
  value: string;
  onChange: (color: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  presets: readonly string[] | string[];
  clearable?: boolean;
  showEyeDropper?: boolean;
  hasError?: boolean;
  describedBy?: string;
}

const ColorPickerControl = memo(function ColorPickerControl({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  readOnly,
  placeholder = "#000000",
  presets,
  clearable = true,
  showEyeDropper = true,
  hasError,
  describedBy,
}: ColorPickerControlProps) {
  const t = useTranslations("form");
  const [open, setOpen] = useState(false);

  const handleClear = useMemoizedFn((e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || readOnly) return;
    onChange("");
    onBlur?.();
  });

  const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
    if (readOnly || disabled) return;
    setOpen(nextOpen);
  });

  const hasValue = Boolean(value);
  const displayText = (hasValue ? value : placeholder).toUpperCase();

  return (
    <div className="relative flex w-full items-center">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-readonly={readOnly || undefined}
            aria-expanded={open}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            aria-label={hasValue ? value : placeholder}
            className={cn(
              "h-8 w-full justify-start rounded-md bg-transparent px-2.5 pr-8 text-left text-xs font-normal shadow-2xs transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
              !hasValue && "text-muted-foreground",
              readOnly && "cursor-default",
              hasError && "border-destructive focus-visible:ring-destructive/20",
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className="border-border/80 size-4 shrink-0 rounded-sm border shadow-2xs transition-transform"
                style={{ backgroundColor: hasValue ? value : "transparent" }}
                aria-hidden="true"
              />
              <span className="truncate font-mono tracking-wider uppercase">{displayText}</span>
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          {open && !readOnly && (
            <DynamicColorPickerContent
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              presets={presets}
              disabled={disabled}
              showEyeDropper={showEyeDropper}
            />
          )}
        </PopoverContent>
      </Popover>

      {clearable && hasValue && !disabled && !readOnly && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={handleClear}
          className="text-muted-foreground/70 hover:bg-muted hover:text-destructive absolute right-1.5 size-5 cursor-pointer after:absolute after:-inset-1 after:content-['']"
          aria-label={t("color_clear")}
        >
          <X className="size-3" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
});

export const ColorPickerInput = memo(function ColorPickerInput({
  placeholder = "#000000",
  defaultValue = "",
  presets = DEFAULT_COLOR_PRESETS,
  clearable = true,
  showEyeDropper = true,
  ...fieldProps
}: ColorPickerInputProps) {
  return (
    <FormFieldEngine<string> defaultValue={defaultValue} {...fieldProps}>
      {({ id, value = "", onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy }) => (
        <ColorPickerControl
          id={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={isDisabled}
          readOnly={isReadOnly}
          placeholder={placeholder}
          presets={presets}
          clearable={clearable}
          showEyeDropper={showEyeDropper}
          hasError={hasError}
          describedBy={describedBy}
        />
      )}
    </FormFieldEngine>
  );
});
