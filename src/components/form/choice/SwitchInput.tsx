import { memo } from "react";

import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

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
  inline = true,
  onLabel,
  offLabel,
}: SwitchInputProps) {
  return (
    <FormFieldEngine<boolean>
      name={name}
      form={form}
      label={inline ? undefined : label}
      id={explicitId}
      required={inline ? undefined : required}
      hint={inline ? undefined : hint}
      helperText={inline ? undefined : helperText}
      tooltip={inline ? undefined : tooltip}
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
      {({ id, value = false, onChange, onBlur, disabled: isDisabled }) => {
        const isChecked = Boolean(value);
        const stateLabel = isChecked ? onLabel : offLabel;

        if (inline) {
          return (
            <Field
              orientation="horizontal"
              className="border-input bg-card/20 flex items-center justify-between gap-4 rounded-lg border p-3 select-none"
            >
              <FieldContent className="min-w-0 flex-1 space-y-0.5">
                <FieldLabel htmlFor={id} className="text-foreground cursor-pointer text-xs font-semibold">
                  {label}
                  {required && <span className="text-destructive ml-0.5 font-bold">*</span>}
                  {hint && <span className="text-muted-foreground ml-2 text-[10px] font-normal">{hint}</span>}
                </FieldLabel>
                {(helperText || tooltip) && (
                  <FieldDescription className="text-muted-foreground text-[11px] leading-relaxed">
                    {helperText || tooltip}
                  </FieldDescription>
                )}
              </FieldContent>

              <div className="flex shrink-0 items-center gap-2">
                {stateLabel && <span className="text-muted-foreground text-xs">{stateLabel}</span>}
                <Switch id={id} checked={isChecked} onCheckedChange={onChange} onBlur={onBlur} disabled={isDisabled} />
              </div>
            </Field>
          );
        }

        return (
          <div className="flex items-center gap-2 pt-1">
            <Switch id={id} checked={isChecked} onCheckedChange={onChange} onBlur={onBlur} disabled={isDisabled} />
            {stateLabel && <span className="text-muted-foreground text-xs">{stateLabel}</span>}
          </div>
        );
      }}
    </FormFieldEngine>
  );
});
SwitchInput.displayName = "SwitchInput";
