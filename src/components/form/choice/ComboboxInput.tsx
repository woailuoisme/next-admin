import { useMemoizedFn } from "ahooks";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "cn";

import { type BaseInputProps, FormFieldEngine, type SelectOption } from "../core";

const EMPTY_OPTIONS: SelectOption<any>[] = [];

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
  disabled?: boolean;
  hasError?: boolean;
  clearable: boolean;
  options: SelectOption<TValue>[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
}

function ComboboxControl<TValue extends string | number = string>({
  id,
  value,
  onChange,
  disabled,
  hasError,
  clearable,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
}: ComboboxControlProps<TValue>) {
  const [open, setOpen] = useState(false);
  const closePopover = useMemoizedFn(() => setOpen(false));

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const handleClear = useMemoizedFn((e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("" as unknown as TValue);
  });

  const handleSelect = useMemoizedFn((optValue: TValue) => {
    onChange(optValue);
    closePopover();
  });

  return (
    <div className="relative flex w-full items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "h-9 w-full justify-between px-3 text-left font-normal",
              clearable && value && !disabled && "pr-8",
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
                      onSelect={() => handleSelect(option.value)}
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
        </PopoverContent>
      </Popover>

      {clearable && value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="清除选项"
          className="text-muted-foreground hover:bg-muted hover:text-foreground absolute right-7 z-10 cursor-pointer rounded-full p-0.5"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

function ComboboxInputComponent<TValue extends string | number = string>({
  placeholder = "请选择...",
  searchPlaceholder = "搜索选项...",
  emptyText = "未找到匹配选项",
  clearable = true,
  options = EMPTY_OPTIONS as SelectOption<TValue>[],
  defaultValue = "" as unknown as TValue,
  ...fieldProps
}: ComboboxInputProps<TValue>) {
  return (
    <FormFieldEngine<TValue> defaultValue={defaultValue} {...fieldProps}>
      {({ id, value, onChange, disabled, hasError }) => (
        <ComboboxControl<TValue>
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          hasError={hasError}
          clearable={clearable}
          options={options}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          emptyText={emptyText}
        />
      )}
    </FormFieldEngine>
  );
}

export const ComboboxInput = memo(ComboboxInputComponent) as <TValue extends string | number = string>(
  props: ComboboxInputProps<TValue>,
) => React.ReactElement;
