import type { ReactElement, ReactNode } from "react";

import { noop } from "es-toolkit";

import { useFormContext } from "./FormContext";

export interface ConnectedFieldRenderProps<TValue = unknown> {
  value: TValue;
  onChange: (value: TValue) => void;
  onBlur?: () => void;
  error?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  meta?: {
    isTouched?: boolean;
    errors?: unknown[];
  };
}

export interface FieldConnectorProps<TValue = unknown> {
  name?: string;
  form?: any;
  value?: TValue;
  defaultValue?: TValue;
  onChange?: (value: TValue) => void;
  onBlur?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  error?: ReactNode;
  render?: (props: ConnectedFieldRenderProps<TValue>) => ReactElement;
  children?: (props: ConnectedFieldRenderProps<TValue>) => ReactElement;
}

export function extractErrorMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  if (typeof error === "string") return error;
  if (Array.isArray(error) && error.length > 0) {
    return extractErrorMessage(error[0]);
  }
  if (typeof error === "object" && error !== null) {
    if ("message" in error && typeof (error as { message: unknown }).message === "string") {
      return (error as { message: string }).message;
    }
  }
  return String(error);
}

export function FieldConnector<TValue = unknown>({
  name,
  form: explicitForm,
  value: controlledValue,
  defaultValue,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  disabled: controlledDisabled,
  readOnly: controlledReadOnly,
  error: explicitError,
  render,
  children,
}: FieldConnectorProps<TValue>) {
  const context = useFormContext();
  const form = explicitForm || context.form;
  const renderFn = render || children;

  if (!renderFn) {
    return null;
  }

  // Case 1: Bound to TanStack Form
  if (form?.Field && name) {
    const FieldComponent = form.Field;
    return (
      <FieldComponent name={name} defaultValue={defaultValue}>
        {(field: any) => {
          const isTouched = field.state.meta.isTouched;
          const errors = field.state.meta.errors;
          const computedError =
            explicitError ?? (isTouched && errors?.length ? extractErrorMessage(errors[0]) : undefined);

          return renderFn({
            value: field.state.value,
            onChange: (val) => {
              field.handleChange(val);
              controlledOnChange?.(val);
            },
            onBlur: () => {
              field.handleBlur();
              controlledOnBlur?.();
            },
            error: computedError,
            disabled: controlledDisabled,
            readOnly: controlledReadOnly,
            meta: {
              isTouched,
              errors,
            },
          });
        }}
      </FieldComponent>
    );
  }

  // Case 2: Standalone Controlled / Uncontrolled
  return renderFn({
    value: controlledValue as TValue,
    onChange: controlledOnChange ?? noop,
    onBlur: controlledOnBlur,
    error: explicitError,
    disabled: controlledDisabled,
    readOnly: controlledReadOnly,
  });
}
