import { memo } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "cn";

import { FormFieldEngine, type BaseInputProps, type SelectOption } from "../core";

export interface SelectInputProps<TValue extends string | number = string> extends BaseInputProps {
  options: SelectOption<TValue>[] | readonly SelectOption<TValue>[];
  value?: TValue;
  defaultValue?: TValue;
  onChange?: (value: TValue) => void;
  onBlur?: () => void;
  triggerClassName?: string;
}

const EMPTY_OPTIONS: readonly SelectOption<any>[] = [];

function SelectInputInner<TValue extends string | number = string>({
  placeholder = "请选择...",
  options = EMPTY_OPTIONS as readonly SelectOption<TValue>[],
  triggerClassName,
  ...fieldProps
}: SelectInputProps<TValue>) {
  return (
    <FormFieldEngine<TValue> {...fieldProps}>
      {({ id, value, onChange, disabled, hasError }) => {
        const stringValue = value != null ? String(value) : "";

        return (
          <Select
            value={stringValue}
            onValueChange={(val) => {
              const matched = options.find((o) => String(o.value) === val);
              onChange(matched ? matched.value : (val as unknown as TValue));
            }}
            disabled={disabled}
          >
            <SelectTrigger
              id={id}
              aria-invalid={hasError}
              className={cn(
                "w-full rounded-md",
                hasError && "border-destructive focus-visible:ring-destructive/20",
                triggerClassName,
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={String(option.value)}
                  value={String(option.value)}
                  disabled={option.disabled}
                  className="text-xs"
                >
                  {"icon" in option && option.icon && (
                    <span className="mr-1.5 inline-flex size-3.5 items-center justify-center">{option.icon}</span>
                  )}
                  <span>{option.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }}
    </FormFieldEngine>
  );
}

export const SelectInput = memo(SelectInputInner) as <TValue extends string | number = string>(
  props: SelectInputProps<TValue>,
) => React.ReactElement;
