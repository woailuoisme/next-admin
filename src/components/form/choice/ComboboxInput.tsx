"use client";

import { useMemoizedFn } from "ahooks";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

import { type BaseInputProps, FieldClearButton, FormFieldEngine, type SelectOption } from "../core";

const EMPTY_OPTIONS: SelectOption<any>[] = [];

interface ComboboxMenuProps {
  options: SelectOption<any>[];
  value: unknown;
  searchPlaceholder: string;
  emptyText: string;
  onSelectValue: (val: any) => void;
}

const LazyComboboxMenu = dynamic(
  () =>
    import("@/components/ui/command").then((mod) => {
      const { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } = mod;
      return function ComboboxMenu({ options, value, searchPlaceholder, emptyText, onSelectValue }: ComboboxMenuProps) {
        return (
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = String(option.value) === String(value);
                  return (
                    <CommandItem
                      key={String(option.value)}
                      value={option.label}
                      disabled={option.disabled}
                      onSelect={() => onSelectValue(option.value)}
                      className="cursor-pointer"
                    >
                      <Check className={cn("mr-2 size-4 shrink-0", isSelected ? "opacity-100" : "opacity-0")} />
                      {option.icon && <span className="mr-2 shrink-0">{option.icon}</span>}
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate">{option.label}</span>
                        {option.description && (
                          <span className="text-muted-foreground truncate text-[11px]">{option.description}</span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        );
      };
    }),
  {
    ssr: false,
    loading: () => <div className="text-muted-foreground flex h-32 items-center justify-center text-xs">...</div>,
  },
);

export interface ComboboxInputProps<TValue extends string | number = string> extends BaseInputProps {
  options: SelectOption<TValue>[];
  value?: TValue;
  defaultValue?: TValue;
  onChange?: (value: TValue) => void;
  onBlur?: () => void;
  searchPlaceholder?: string;
  emptyText?: string;
  clearable?: boolean;
}

interface ComboboxControlProps<TValue extends string | number = string> {
  id: string;
  value?: TValue;
  onChange: (value: TValue) => void;
  onBlur?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  hasError?: boolean;
  describedBy?: string;
  clearable: boolean;
  options: SelectOption<TValue>[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  clearAriaLabel: string;
}

function ComboboxControl<TValue extends string | number = string>({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  readOnly,
  hasError,
  describedBy,
  clearable,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  clearAriaLabel,
}: ComboboxControlProps<TValue>) {
  const [open, setOpen] = useState(false);
  const locked = Boolean(disabled || readOnly);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
    if (locked && nextOpen) return;
    setOpen(nextOpen);
    if (!nextOpen) onBlur?.();
  });

  const handleClear = useMemoizedFn((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!locked) onChange("" as unknown as TValue);
  });

  const handleSelect = useMemoizedFn((optValue: TValue) => {
    if (locked) return;
    onChange(optValue);
    setOpen(false);
  });

  return (
    <div className="relative flex w-full items-center">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-readonly={readOnly}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            disabled={disabled}
            className={cn(
              "h-9 w-full justify-between px-3 text-left font-normal",
              clearable && value && !locked && "pr-8",
              !value && "text-muted-foreground",
              hasError && "border-destructive focus-visible:ring-destructive",
            )}
          >
            <span className="flex items-center gap-2 truncate">
              {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          {open ? (
            <LazyComboboxMenu
              options={options}
              value={value}
              searchPlaceholder={searchPlaceholder}
              emptyText={emptyText}
              onSelectValue={handleSelect}
            />
          ) : null}
        </PopoverContent>
      </Popover>

      {clearable && value && !locked && (
        <FieldClearButton
          onClick={handleClear}
          ariaLabel={clearAriaLabel}
          className="hover:bg-muted absolute right-7 z-10"
        />
      )}
    </div>
  );
}

function ComboboxInputComponent<TValue extends string | number = string>({
  placeholder,
  searchPlaceholder,
  emptyText,
  clearable = true,
  options = EMPTY_OPTIONS as SelectOption<TValue>[],
  defaultValue = "" as unknown as TValue,
  ...fieldProps
}: ComboboxInputProps<TValue>) {
  const t = useTranslations("form");
  const resolvedPlaceholder = placeholder ?? t("select_placeholder");
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("combobox_search_placeholder");
  const resolvedEmptyText = emptyText ?? t("combobox_empty");

  return (
    <FormFieldEngine<TValue> defaultValue={defaultValue} {...fieldProps}>
      {({ id, value, onChange, onBlur, disabled, readOnly, hasError, describedBy }) => (
        <ComboboxControl<TValue>
          id={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          hasError={hasError}
          describedBy={describedBy}
          clearable={clearable}
          options={options}
          placeholder={resolvedPlaceholder}
          searchPlaceholder={resolvedSearchPlaceholder}
          emptyText={resolvedEmptyText}
          clearAriaLabel={t("combobox_clear")}
        />
      )}
    </FormFieldEngine>
  );
}

export const ComboboxInput = memo(ComboboxInputComponent) as <TValue extends string | number = string>(
  props: ComboboxInputProps<TValue>,
) => React.ReactElement;
