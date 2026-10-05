import { memo, useId } from "react";

import { FieldConnector, FieldWrapper } from "../../core";
import { TipTapCore } from "./TipTapCore";
import { DEFAULT_TOOLBAR, type RichEditorInputProps } from "./types";

interface RichEditorInputInnerProps extends RichEditorInputProps {
  id: string;
  value: string | undefined;
  onChange: (value: string) => void;
  onBlur?: () => void;
  computedError?: React.ReactNode;
}

const RichEditorInputInner = memo(function RichEditorInputInner({
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
  placeholder,
  disabled,
  readOnly,
  value,
  onChange,
  onBlur,
  format = "html",
  toolbarButtons = DEFAULT_TOOLBAR,
  minHeight = 160,
  maxHeight,
  editorClassName,
}: RichEditorInputInnerProps) {
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
      colSpan={colSpan}
      className={className}
      hidden={hidden}
    >
      <TipTapCore
        id={id}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        format={format}
        placeholder={placeholder}
        toolbarButtons={toolbarButtons}
        minHeight={minHeight}
        maxHeight={maxHeight}
        disabled={disabled}
        readOnly={readOnly}
        hasError={hasError}
        className={editorClassName}
      />
    </FieldWrapper>
  );
});

export const RichEditorInput = memo(function RichEditorInput({
  name,
  form,
  id: explicitId,
  value: controlledValue,
  defaultValue,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  error,
  ...restProps
}: RichEditorInputProps) {
  const autoId = useId();
  const id = explicitId || (name ? `field-${name}` : autoId);

  return (
    <FieldConnector<string>
      name={name}
      form={form}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
      error={error}
    >
      {({ value = "", onChange, onBlur, error: computedError }) => (
        <RichEditorInputInner
          {...restProps}
          id={id}
          name={name}
          form={form}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          computedError={computedError}
        />
      )}
    </FieldConnector>
  );
});
