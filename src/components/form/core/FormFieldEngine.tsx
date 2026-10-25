import { memo, type ReactNode } from "react";

import { useFieldId } from "./fieldState";
import { FieldConnector } from "./FieldConnector";
import { FieldWrapper } from "./FieldWrapper";
import type { BaseInputProps } from "./types";

export interface FormFieldRenderProps<TValue = any> {
  id: string;
  value: TValue;
  onChange: (value: TValue) => void;
  onBlur?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  hasError: boolean;
}

export interface FormFieldEngineProps<TValue = any> extends BaseInputProps {
  form?: any;
  value?: TValue;
  defaultValue?: TValue;
  onChange?: (value: TValue) => void;
  onBlur?: () => void;
  children: (props: FormFieldRenderProps<TValue>) => ReactNode;
}

/**
 * FormFieldEngine - High-leverage architectural seam uniting headless TanStack Form reactive
 * state with shadcn UI design tokens (Field, FieldLabel, FieldError, FieldDescription).
 */
export const FormFieldEngine = memo(function FormFieldEngine<TValue = any>({
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
  readOnly,
  align,
  value: controlledValue,
  defaultValue,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  children,
}: FormFieldEngineProps<TValue>) {
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
      disabled={disabled}
      readOnly={readOnly}
    >
      {({ value, onChange, onBlur, error: computedError, disabled: isDisabled, readOnly: isReadOnly, meta }) => {
        const hasError = Boolean(computedError);
        return (
          <FieldWrapper
            label={label}
            id={id}
            required={required}
            hint={hint}
            helperText={helperText}
            tooltip={tooltip}
            error={computedError}
            meta={meta}
            colSpan={colSpan}
            className={className}
            hidden={hidden}
            align={align}
          >
            {children({
              id,
              value,
              onChange,
              onBlur,
              disabled: isDisabled,
              readOnly: isReadOnly,
              hasError,
            })}
          </FieldWrapper>
        );
      }}
    </FieldConnector>
  );
}) as <TValue = any>(props: FormFieldEngineProps<TValue>) => React.ReactElement | null;
