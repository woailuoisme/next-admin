"use client";

import { memo } from "react";

import { LabelHelpTooltip } from "@/components/shared/LabelHelpTooltip";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { cn } from "cn";

import { type BaseInputProps, FormFieldEngine } from "../core";

export interface SwitchInputProps extends BaseInputProps {
  value?: boolean;
  defaultValue?: boolean;
  onChange?: (checked: boolean) => void;
  onBlur?: () => void;
  /** 是否以内联卡片形式排版 (Switch 居右，Label 和辅助文本居左) */
  inline?: boolean;
  /** 开关右侧伴随文本 */
  onLabel?: string;
  offLabel?: string;
}

export const SwitchInput = memo(function SwitchInput({
  label,
  required,
  hint,
  helperText,
  tooltip,
  defaultValue = false,
  inline = true,
  onLabel,
  offLabel,
  ...fieldProps
}: SwitchInputProps) {
  return (
    <FormFieldEngine<boolean>
      defaultValue={defaultValue}
      label={inline ? undefined : label}
      required={inline ? undefined : required}
      hint={inline ? undefined : hint}
      helperText={inline ? undefined : helperText}
      tooltip={inline ? undefined : tooltip}
      {...fieldProps}
    >
      {({ id, value = false, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy }) => {
        const isChecked = Boolean(value);
        const stateLabel = isChecked ? onLabel : offLabel;
        const locked = Boolean(isDisabled || isReadOnly);

        if (inline) {
          const inlineDescId = helperText ? `${id}-desc` : undefined;
          const inlineDescribedBy = [describedBy, inlineDescId].filter(Boolean).join(" ") || undefined;

          return (
            <Field
              orientation="horizontal"
              className={cn(
                "border-input bg-card/20 flex items-center justify-between gap-4 rounded-lg border p-3 select-none",
                hasError && "border-destructive/60",
              )}
            >
              <FieldContent className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <FieldLabel
                    htmlFor={id}
                    className={cn(
                      "cursor-pointer text-xs leading-none font-semibold tracking-tight",
                      hasError ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {label}
                    {required && <span className="text-destructive ml-0.5 font-bold">*</span>}
                  </FieldLabel>
                  {tooltip && <LabelHelpTooltip content={tooltip} />}
                  {hint && <span className="text-muted-foreground ml-1 text-[11px] font-normal">{hint}</span>}
                </div>
                {helperText && (
                  <FieldDescription id={inlineDescId} className="text-muted-foreground text-[11px] leading-relaxed">
                    {helperText}
                  </FieldDescription>
                )}
              </FieldContent>

              <div className="flex shrink-0 items-center gap-2">
                {stateLabel && <span className="text-muted-foreground text-xs">{stateLabel}</span>}
                <Switch
                  id={id}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    if (!isReadOnly) onChange(checked);
                  }}
                  onBlur={onBlur}
                  disabled={locked}
                  aria-invalid={hasError}
                  aria-describedby={inlineDescribedBy}
                />
              </div>
            </Field>
          );
        }

        return (
          <div className="flex items-center gap-2 pt-1">
            <Switch
              id={id}
              checked={isChecked}
              onCheckedChange={(checked) => {
                if (!isReadOnly) onChange(checked);
              }}
              onBlur={onBlur}
              disabled={locked}
              aria-invalid={hasError}
              aria-describedby={describedBy}
            />
            {stateLabel && <span className="text-muted-foreground text-xs">{stateLabel}</span>}
          </div>
        );
      }}
    </FormFieldEngine>
  );
});
SwitchInput.displayName = "SwitchInput";
