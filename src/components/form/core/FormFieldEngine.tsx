"use client";

import { type ReactElement, type ReactNode, useId } from "react";

import { noop } from "es-toolkit";

import { extractErrorMessage, FieldWrapper } from "./FieldWrapper";
import { useFormContext } from "./FormContext";
import type { BaseInputProps, FormInstanceLike } from "./types";

export interface FormFieldRenderProps<TValue = any> {
  id: string;
  value: TValue;
  onChange: (value: TValue) => void;
  onBlur?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  hasError: boolean;
  describedBy?: string;
}

export interface FormFieldEngineProps<TValue = any> extends BaseInputProps {
  form?: FormInstanceLike;
  value?: TValue;
  defaultValue?: TValue;
  onChange?: (value: TValue) => void;
  onBlur?: () => void;
  children: (props: FormFieldRenderProps<TValue>) => ReactNode;
}

interface TanStackFieldState<TValue> {
  state: {
    value: TValue;
    meta: {
      isTouched?: boolean;
      errors?: unknown[];
    };
  };
  handleChange: (value: TValue) => void;
  handleBlur: () => void;
}

export { extractErrorMessage };

export function useFieldId(name?: string, explicitId?: string): string {
  const autoId = useId();
  return explicitId || (name ? `field-${name}` : autoId);
}

export function resolveFieldError(
  explicitError: ReactNode,
  meta?: { isTouched?: boolean; errors?: unknown[] },
): ReactNode | undefined {
  if (explicitError) return explicitError;
  if (meta?.isTouched && meta.errors?.length) {
    return extractErrorMessage(meta.errors[0]);
  }
  return undefined;
}

/**
 * FormFieldEngine - Deep architectural seam uniting headless TanStack Form reactive
 * state, single error resolution, accessibility IDs, and shadcn Field presentation.
 */
export function FormFieldEngine<TValue = any>({
  name,
  form: explicitForm,
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
}: FormFieldEngineProps<TValue>): ReactElement | null {
  const id = useFieldId(name, explicitId);
  const context = useFormContext();
  const form = explicitForm ?? context.form;

  const renderField = (
    value: TValue,
    onChange: (val: TValue) => void,
    onBlur: (() => void) | undefined,
    meta?: { isTouched?: boolean; errors?: unknown[] },
  ) => {
    const resolvedError = resolveFieldError(error, meta);
    const hasError = Boolean(resolvedError);
    const describedBy = hasError ? `${id}-error` : helperText ? `${id}-desc` : undefined;

    return (
      <FieldWrapper
        label={label}
        id={id}
        required={required}
        hint={hint}
        helperText={helperText}
        tooltip={tooltip}
        error={resolvedError}
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
          disabled,
          readOnly,
          hasError,
          describedBy,
        })}
      </FieldWrapper>
    );
  };

  if (form?.Field && name) {
    const FieldComponent = form.Field;
    return (
      <FieldComponent name={name} defaultValue={defaultValue}>
        {(field: TanStackFieldState<TValue>) =>
          renderField(
            field.state.value,
            (val) => {
              field.handleChange(val);
              controlledOnChange?.(val);
            },
            () => {
              field.handleBlur();
              controlledOnBlur?.();
            },
            field.state.meta,
          )
        }
      </FieldComponent>
    );
  }

  return renderField((controlledValue ?? defaultValue) as TValue, controlledOnChange ?? noop, controlledOnBlur);
}
