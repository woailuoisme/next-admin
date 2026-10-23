import { useMemoizedFn } from "ahooks";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { type BaseInputProps, FieldConnector, FieldWrapper, type SelectOption, useFieldId } from "../core";

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

interface ComboboxInputInnerProps<TValue extends string | number = string> {
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
  disabled?: boolean;
  clearable: boolean;
  value?: TValue;
  onChange: (value: TValue) => void;
  options: SelectOption<TValue>[];
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
}

function ComboboxInputInnerComponent<TValue extends string | number = string>({
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
  disabled,
  clearable,
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
}: ComboboxInputInnerProps<TValue>) {
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
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn(
                "h-9 w-full justify-between px-3 text-left font-normal",
                clearable && value && !disabled && "pr-8",
                !value && "text-muted-foreground",
                computedError && "border-destructive focus-visible:ring-destructive",
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
    </FieldWrapper>
  );
}

const ComboboxInputInner = memo(ComboboxInputInnerComponent) as <TValue extends string | number = string>(
  props: ComboboxInputInnerProps<TValue>,
) => React.ReactElement;

function ComboboxInputComponent<TValue extends string | number = string>({
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
  disabled,
  placeholder = "请选择...",
  searchPlaceholder = "搜索选项...",
  emptyText = "未找到匹配选项",
  clearable = true,
  options = EMPTY_OPTIONS as SelectOption<TValue>[],
  value: controlledValue,
  defaultValue = "" as unknown as TValue,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
}: ComboboxInputProps<TValue>) {
  const id = useFieldId(name, explicitId);

  return (
    <FieldConnector<TValue>
      name={name}
      form={form}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
      error={error}
    >
      {({ value, onChange, error: computedError }) => (
        <ComboboxInputInner<TValue>
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
          disabled={disabled}
          clearable={clearable}
          value={value}
          onChange={onChange}
          options={options}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          emptyText={emptyText}
        />
      )}
    </FieldConnector>
  );
}

export const ComboboxInput = memo(ComboboxInputComponent) as <TValue extends string | number = string>(
  props: ComboboxInputProps<TValue>,
) => React.ReactElement;
