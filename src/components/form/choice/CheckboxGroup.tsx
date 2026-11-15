"use client";

import { type MouseEvent, memo } from "react";

import { LabelHelpTooltip } from "@/components/shared/LabelHelpTooltip";
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
  options = EMPTY_OPTIONS,
  defaultValue = EMPTY_VALUES,
  direction = "vertical",
  card = false,
  ...fieldProps
}: CheckboxGroupProps) {
  return (
    <FormFieldEngine<(string | number)[]> defaultValue={defaultValue} {...fieldProps}>
      {({ id, value, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy }) => {
        const currentValues = Array.isArray(value) ? value : EMPTY_VALUES;
        const groupLocked = Boolean(isDisabled || isReadOnly);

        const handleToggle = (optionValue: string | number, checked: boolean) => {
          if (groupLocked) return;
          if (checked) {
            if (!currentValues.some((v) => String(v) === String(optionValue))) {
              onChange([...currentValues, optionValue]);
            }
          } else {
            onChange(currentValues.filter((v) => String(v) !== String(optionValue)));
          }
        };

        return (
          <FieldGroup
            data-slot="checkbox-group"
            role="group"
            aria-describedby={describedBy}
            onBlur={onBlur}
            className={cn(
              "gap-2 pt-1",
              direction === "horizontal" ? "flex-row flex-wrap items-center gap-4" : "space-y-2",
            )}
          >
            {options.map((option) => {
              const optionId = `${id}-${String(option.value)}`;
              const isChecked = currentValues.some((v) => String(v) === String(option.value));
              const itemDisabled = groupLocked || Boolean(option.disabled);

              if (card) {
                const handleCardClick = (e: MouseEvent<HTMLDivElement>) => {
                  if (itemDisabled) return;
                  const target = e.target as HTMLElement | null;
                  if (target?.closest('[role="checkbox"], button, label')) return;
                  handleToggle(option.value, !isChecked);
                };

                return (
                  <Field
                    key={String(option.value)}
                    orientation="horizontal"
                    onClick={handleCardClick}
                    className={cn(
                      "cursor-pointer items-start gap-3 rounded-lg border border-input bg-card/30 p-3 transition-colors select-none",
                      isChecked && "border-primary/50 bg-primary/5 ring-1 ring-primary/20",
                      hasError && "border-destructive/60",
                      itemDisabled && "pointer-events-none cursor-not-allowed opacity-50",
                    )}
                  >
                    <Checkbox
                      id={optionId}
                      checked={isChecked}
                      onCheckedChange={(checked) => handleToggle(option.value, Boolean(checked))}
                      disabled={itemDisabled}
                      aria-invalid={hasError}
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
                    disabled={itemDisabled}
                    aria-invalid={hasError}
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
  label,
  required,
  hint,
  helperText,
  tooltip,
  defaultValue = false,
  description,
  ...fieldProps
}: CheckboxInputProps) {
  return (
    <FormFieldEngine<boolean> defaultValue={defaultValue} {...fieldProps}>
      {({ id, value, onChange, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy, onBlur }) => (
        <Field orientation="horizontal" className="items-start gap-2.5 pt-1">
          <Checkbox
            id={id}
            checked={Boolean(value)}
            onCheckedChange={(checked) => {
              if (!isReadOnly) onChange(Boolean(checked));
            }}
            onBlur={onBlur}
            disabled={isDisabled || isReadOnly}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            className="mt-0.5 rounded-sm"
          />
          <FieldContent className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <FieldLabel
                htmlFor={id}
                className={cn(
                  "cursor-pointer text-xs leading-none font-semibold tracking-tight select-none",
                  hasError ? "text-destructive" : "text-foreground",
                )}
              >
                {label}
                {required && <span className="text-destructive ml-0.5 font-bold">*</span>}
              </FieldLabel>
              {tooltip && <LabelHelpTooltip content={tooltip} />}
              {hint && <span className="text-muted-foreground ml-1 text-[11px] font-normal">{hint}</span>}
            </div>
            {(description || helperText) && (
              <FieldDescription className="text-muted-foreground text-[11px] leading-relaxed">
                {description || helperText}
              </FieldDescription>
            )}
          </FieldContent>
        </Field>
      )}
    </FormFieldEngine>
  );
});
