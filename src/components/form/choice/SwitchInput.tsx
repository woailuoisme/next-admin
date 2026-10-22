import { useMemoizedFn } from "ahooks";
import { memo } from "react";

import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

import { type BaseInputProps, FieldConnector, FieldWrapper, useFieldId } from "../core";

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

interface SwitchInputInnerProps {
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
  inline: boolean;
  onLabel?: string;
  offLabel?: string;
  value: boolean;
  onChange: (checked: boolean) => void;
}

const SwitchInputInner = memo(function SwitchInputInner({
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
  inline,
  onLabel,
  offLabel,
  value,
  onChange,
}: SwitchInputInnerProps) {
  const isChecked = Boolean(value);
  const stateLabel = isChecked ? onLabel : offLabel;

  const handleCheckedChange = useMemoizedFn((checked: boolean) => {
    onChange(checked);
  });

  if (inline) {
    return (
      <FieldWrapper colSpan={colSpan} className={className} hidden={hidden} error={computedError}>
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
            <Switch id={id} checked={isChecked} onCheckedChange={handleCheckedChange} disabled={disabled} />
          </div>
        </Field>
      </FieldWrapper>
    );
  }

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
      <div className="flex items-center gap-2 pt-1">
        <Switch id={id} checked={isChecked} onCheckedChange={handleCheckedChange} disabled={disabled} />
        {stateLabel && <span className="text-muted-foreground text-xs">{stateLabel}</span>}
      </div>
    </FieldWrapper>
  );
});

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
  const id = useFieldId(name, explicitId);

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
        <SwitchInputInner
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
          inline={inline}
          onLabel={onLabel}
          offLabel={offLabel}
          value={value}
          onChange={onChange}
        />
      )}
    </FieldConnector>
  );
});
