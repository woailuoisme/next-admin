import { useMemoizedFn } from "ahooks";
import { memo, useId } from "react";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

import { type BaseInputProps, FieldConnector, FieldWrapper, type SelectOption } from "../core";

const EMPTY_OPTIONS: SelectOption<any>[] = [];

export interface RadioGroupInputProps<
  TValue extends string | number = string,
> extends BaseInputProps {
  options: SelectOption<TValue>[];
  value?: TValue;
  defaultValue?: TValue;
  onChange?: (value: TValue) => void;
  onBlur?: () => void;
  direction?: "horizontal" | "vertical";
  card?: boolean;
}

interface RadioGroupInputInnerProps<TValue extends string | number = string> {
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
  direction: "horizontal" | "vertical";
  card: boolean;
  options: SelectOption<TValue>[];
  value: TValue | undefined;
  onChange: (value: TValue) => void;
}

function RadioGroupInputInnerComponent<TValue extends string | number = string>({
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
  direction,
  card,
  options,
  value,
  onChange,
}: RadioGroupInputInnerProps<TValue>) {
  const stringValue = value !== undefined && value !== null ? String(value) : "";

  const handleValueChange = useMemoizedFn((val: string) => {
    const matched = options.find((o) => String(o.value) === val);
    onChange(matched ? matched.value : (val as unknown as TValue));
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
      <RadioGroup
        id={id}
        value={stringValue}
        onValueChange={handleValueChange}
        disabled={disabled}
        className={cn(
          "pt-1",
          direction === "horizontal" ? "flex-row flex-wrap items-center gap-4" : "space-y-2",
        )}
      >
        <FieldGroup data-slot="radio-group" className="w-full gap-2">
          {options.map((option) => {
            const optionId = `${id}-${String(option.value)}`;
            const isSelected = String(option.value) === stringValue;

            if (card) {
              return (
                <Field
                  key={String(option.value)}
                  orientation="horizontal"
                  onClick={() =>
                    !disabled && !option.disabled && handleValueChange(String(option.value))
                  }
                  className={cn(
                    "cursor-pointer items-start gap-3 rounded-lg border border-input bg-card/30 p-3 transition-colors select-none",
                    isSelected && "border-primary/60 bg-primary/5 ring-1 ring-primary/20",
                    (disabled || option.disabled) &&
                      "pointer-events-none cursor-not-allowed opacity-50",
                  )}
                >
                  <RadioGroupItem
                    id={optionId}
                    value={String(option.value)}
                    disabled={disabled || option.disabled}
                    className="mt-0.5"
                  />
                  <FieldContent className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      {"icon" in option && option.icon}
                      <FieldLabel
                        htmlFor={optionId}
                        className="text-foreground cursor-pointer text-xs font-semibold"
                      >
                        {option.label}
                      </FieldLabel>
                    </div>
                    {option.description && (
                      <FieldDescription className="text-muted-foreground text-[11px] leading-relaxed">
                        {option.description}
                      </FieldDescription>
                    )}
                  </FieldContent>
                </Field>
              );
            }

            return (
              <Field
                key={String(option.value)}
                orientation="horizontal"
                className="items-center gap-2"
              >
                <RadioGroupItem
                  id={optionId}
                  value={String(option.value)}
                  disabled={disabled || option.disabled}
                />
                <FieldLabel
                  htmlFor={optionId}
                  className="text-foreground flex cursor-pointer items-center gap-1.5 text-xs font-medium select-none"
                >
                  {"icon" in option && option.icon}
                  <span>{option.label}</span>
                </FieldLabel>
              </Field>
            );
          })}
        </FieldGroup>
      </RadioGroup>
    </FieldWrapper>
  );
}

const RadioGroupInputInner = memo(RadioGroupInputInnerComponent) as <
  TValue extends string | number = string,
>(
  props: RadioGroupInputInnerProps<TValue>,
) => React.ReactElement;

function RadioGroupInputComponent<TValue extends string | number = string>({
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
  options = EMPTY_OPTIONS as SelectOption<TValue>[],
  value: controlledValue,
  defaultValue,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  direction = "vertical",
  card = false,
}: RadioGroupInputProps<TValue>) {
  const autoId = useId();
  const id = explicitId || (name ? `field-${name}` : autoId);

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
        <RadioGroupInputInner<TValue>
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
          direction={direction}
          card={card}
          options={options}
          value={value}
          onChange={onChange}
        />
      )}
    </FieldConnector>
  );
}

export const RadioGroupInput = memo(RadioGroupInputComponent) as <
  TValue extends string | number = string,
>(
  props: RadioGroupInputProps<TValue>,
) => React.ReactElement;
