import { memo } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { cn } from "cn";

import { type BaseInputProps, FormFieldEngine, type SelectOption } from "../core";

const EMPTY_OPTIONS: SelectOption[] = [];
const EMPTY_VALUES: (string | number)[] = [];

export interface CheckboxGroupProps extends BaseInputProps {
  options: SelectOption[];
  value?: (string | number)[];
  defaultValue?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
  onBlur?: () => void;
  direction?: "horizontal" | "vertical";
  card?: boolean;
}

export const CheckboxGroup = memo(function CheckboxGroup({
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
  options = EMPTY_OPTIONS,
  value: controlledValue,
  defaultValue = EMPTY_VALUES,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  direction = "vertical",
  card = false,
}: CheckboxGroupProps) {
  return (
    <FormFieldEngine<(string | number)[]>
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
      {({ id, value, onChange, disabled: isDisabled }) => {
        const currentValues = Array.isArray(value) ? value : EMPTY_VALUES;

        const handleToggle = (optionValue: string | number, checked: boolean) => {
          if (checked) {
            onChange([...currentValues, optionValue]);
          } else {
            onChange(currentValues.filter((v) => v !== optionValue));
          }
        };

        return (
          <FieldGroup
            data-slot="checkbox-group"
            className={cn(
              "gap-2 pt-1",
              direction === "horizontal" ? "flex-row flex-wrap items-center gap-4" : "space-y-2",
            )}
          >
            {options.map((option) => {
              const optionId = `${id}-${String(option.value)}`;
              const isChecked = currentValues.some((v) => String(v) === String(option.value));

              if (card) {
                return (
                  <Field
                    key={String(option.value)}
                    orientation="horizontal"
                    onClick={() => !isDisabled && !option.disabled && handleToggle(option.value, !isChecked)}
                    className={cn(
                      "cursor-pointer items-start gap-3 rounded-lg border border-input bg-card/30 p-3 transition-colors select-none",
                      isChecked && "border-primary/50 bg-primary/5 ring-1 ring-primary/20",
                      (isDisabled || option.disabled) && "pointer-events-none cursor-not-allowed opacity-50",
                    )}
                  >
                    <Checkbox
                      id={optionId}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleToggle(option.value, Boolean(checked))}
                      disabled={isDisabled || option.disabled}
                      className="mt-0.5 rounded-sm"
                    />
                    <FieldContent className="min-w-0 flex-1 space-y-0.5">
                      <FieldLabel htmlFor={optionId} className="text-foreground cursor-pointer text-xs font-semibold">
                        {option.label}
                      </FieldLabel>
                      {option.description && (
                        <FieldDescription className="text-muted-foreground text-[11px]">
                          {option.description}
                        </FieldDescription>
                      )}
                    </FieldContent>
                  </Field>
                );
              }

              return (
                <Field key={String(option.value)} orientation="horizontal" className="items-center gap-2">
                  <Checkbox
                    id={optionId}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleToggle(option.value, Boolean(checked))}
                    disabled={isDisabled || option.disabled}
                    className="rounded-sm"
                  />
                  <FieldLabel
                    htmlFor={optionId}
                    className="text-foreground cursor-pointer text-xs font-medium select-none"
                  >
                    {option.label}
                  </FieldLabel>
                </Field>
              );
            })}
          </FieldGroup>
        );
      }}
    </FormFieldEngine>
  );
});

export interface CheckboxInputProps extends BaseInputProps {
  value?: boolean;
  defaultValue?: boolean;
  onChange?: (checked: boolean) => void;
  onBlur?: () => void;
  description?: string;
}

export const CheckboxInput = memo(function CheckboxInput({
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
  value: controlledValue,
  defaultValue = false,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  description,
}: CheckboxInputProps) {
  return (
    <FormFieldEngine<boolean>
      name={name}
      form={form}
      id={explicitId}
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
      {({ id, value, onChange, disabled: isDisabled, onBlur }) => (
        <Field orientation="horizontal" className="items-start gap-2.5 pt-1">
          <Checkbox
            id={id}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(Boolean(checked))}
            onBlur={onBlur}
            disabled={isDisabled}
            className="mt-0.5 rounded-sm"
          />
          <FieldContent className="space-y-0.5">
            <FieldLabel htmlFor={id} className="text-foreground cursor-pointer text-xs font-medium select-none">
              {label}
              {required && <span className="text-destructive ml-0.5 font-bold">*</span>}
              {hint && <span className="text-muted-foreground ml-2 text-[10px]">{hint}</span>}
            </FieldLabel>
            {(description || helperText || tooltip) && (
              <FieldDescription className="text-muted-foreground text-[11px] leading-relaxed">
                {description || helperText || tooltip}
              </FieldDescription>
            )}
          </FieldContent>
        </Field>
      )}
    </FormFieldEngine>
  );
});
