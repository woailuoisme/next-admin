import { memo } from "react";

import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "cn";

import { type BaseInputProps, FormFieldEngine, type SelectOption } from "../core";

const EMPTY_OPTIONS: SelectOption<any>[] = [];

export interface RadioGroupInputProps<TValue extends string | number = string> extends BaseInputProps {
  options: SelectOption<TValue>[];
  value?: TValue;
  defaultValue?: TValue;
  onChange?: (value: TValue) => void;
  onBlur?: () => void;
  direction?: "horizontal" | "vertical";
  card?: boolean;
}

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
  return (
    <FormFieldEngine<TValue>
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
      {({ id, value, onChange, disabled: isDisabled, onBlur }) => {
        const stringValue = value !== undefined && value !== null ? String(value) : "";

        const handleValueChange = (val: string) => {
          const matched = options.find((o) => String(o.value) === val);
          onChange(matched ? matched.value : (val as unknown as TValue));
        };

        return (
          <RadioGroup
            id={id}
            value={stringValue}
            onValueChange={handleValueChange}
            onBlur={onBlur}
            disabled={isDisabled}
            className={cn("pt-1", direction === "horizontal" ? "flex-row flex-wrap items-center gap-4" : "space-y-2")}
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
                      onClick={() => !isDisabled && !option.disabled && handleValueChange(String(option.value))}
                      className={cn(
                        "cursor-pointer items-start gap-3 rounded-lg border border-input bg-card/30 p-3 transition-colors select-none",
                        isSelected && "border-primary/60 bg-primary/5 ring-1 ring-primary/20",
                        (isDisabled || option.disabled) && "pointer-events-none cursor-not-allowed opacity-50",
                      )}
                    >
                      <RadioGroupItem
                        id={optionId}
                        value={String(option.value)}
                        disabled={isDisabled || option.disabled}
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
                  <Field key={String(option.value)} orientation="horizontal" className="items-center gap-2">
                    <RadioGroupItem
                      id={optionId}
                      value={String(option.value)}
                      disabled={isDisabled || option.disabled}
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
        );
      }}
    </FormFieldEngine>
  );
}

export const RadioGroupInput = memo(RadioGroupInputComponent) as <TValue extends string | number = string>(
  props: RadioGroupInputProps<TValue>,
) => React.ReactElement;
