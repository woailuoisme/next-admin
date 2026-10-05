import { useMemoizedFn } from "ahooks";
import { memo, useId } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

import { type BaseInputProps, FieldConnector, FieldWrapper, type SelectOption } from "../core";

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

interface CheckboxGroupInnerProps {
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
  options: SelectOption[];
  value: (string | number)[];
  onChange: (val: (string | number)[]) => void;
}

const CheckboxGroupInner = memo(function CheckboxGroupInner({
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
}: CheckboxGroupInnerProps) {
  const currentValues = Array.isArray(value) ? value : EMPTY_VALUES;

  const handleToggle = useMemoizedFn((optionValue: string | number, checked: boolean) => {
    if (checked) {
      onChange([...currentValues, optionValue]);
    } else {
      onChange(currentValues.filter((v) => v !== optionValue));
    }
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
                onClick={() =>
                  !disabled && !option.disabled && handleToggle(option.value, !isChecked)
                }
                className={cn(
                  "cursor-pointer items-start gap-3 rounded-lg border border-input bg-card/30 p-3 transition-colors select-none",
                  isChecked && "border-primary/50 bg-primary/5 ring-1 ring-primary/20",
                  (disabled || option.disabled) &&
                    "pointer-events-none cursor-not-allowed opacity-50",
                )}
              >
                <Checkbox
                  id={optionId}
                  checked={isChecked}
                  onCheckedChange={(checked) => handleToggle(option.value, Boolean(checked))}
                  disabled={disabled || option.disabled}
                  className="mt-0.5 rounded-sm"
                />
                <FieldContent className="min-w-0 flex-1 space-y-0.5">
                  <FieldLabel
                    htmlFor={optionId}
                    className="text-foreground cursor-pointer text-xs font-semibold"
                  >
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
            <Field
              key={String(option.value)}
              orientation="horizontal"
              className="items-center gap-2"
            >
              <Checkbox
                id={optionId}
                checked={isChecked}
                onCheckedChange={(checked) => handleToggle(option.value, Boolean(checked))}
                disabled={disabled || option.disabled}
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
    </FieldWrapper>
  );
});

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
  const autoId = useId();
  const id = explicitId || (name ? `field-${name}` : autoId);

  return (
    <FieldConnector<(string | number)[]>
      name={name}
      form={form}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
      error={error}
    >
      {({ value = EMPTY_VALUES, onChange, error: computedError }) => (
        <CheckboxGroupInner
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
});

export interface CheckboxInputProps extends BaseInputProps {
  value?: boolean;
  defaultValue?: boolean;
  onChange?: (checked: boolean) => void;
  onBlur?: () => void;
  description?: string;
}

interface CheckboxInputInnerProps {
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
  description?: string;
  value: boolean;
  onChange: (checked: boolean) => void;
}

const CheckboxInputInner = memo(function CheckboxInputInner({
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
  description,
  value,
  onChange,
}: CheckboxInputInnerProps) {
  const handleCheckedChange = useMemoizedFn((checked: boolean | "indeterminate") => {
    onChange(Boolean(checked));
  });

  return (
    <FieldWrapper colSpan={colSpan} className={className} hidden={hidden} error={computedError}>
      <Field orientation="horizontal" className="items-start gap-2.5 pt-1">
        <Checkbox
          id={id}
          checked={Boolean(value)}
          onCheckedChange={handleCheckedChange}
          disabled={disabled}
          className="mt-0.5 rounded-sm"
        />
        <FieldContent className="space-y-0.5">
          <FieldLabel
            htmlFor={id}
            className="text-foreground cursor-pointer text-xs font-medium select-none"
          >
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
    </FieldWrapper>
  );
});

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
  const autoId = useId();
  const id = explicitId || (name ? `field-${name}` : autoId);

  return (
    <FieldConnector<boolean>
      name={name}
      form={form}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
      error={error}
    >
      {({ value = false, onChange, error: computedError }) => (
        <CheckboxInputInner
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
          description={description}
          value={value}
          onChange={onChange}
        />
      )}
    </FieldConnector>
  );
});
