import { memo } from "react";

import { FormFieldEngine } from "../../core";
import { TipTapCore } from "./TipTapCore";
import { DEFAULT_TOOLBAR, type RichEditorInputProps } from "./types";

export const RichEditorInput = memo(function RichEditorInput({
  name,
  form,
  id: explicitId,
  label,
  required,
  hint,
  helperText,
  tooltip,
  error,
  colSpan,
  className,
  hidden,
  placeholder,
  disabled,
  readOnly,
  value: controlledValue,
  defaultValue = "",
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  format = "html",
  toolbarButtons = DEFAULT_TOOLBAR,
  minHeight = 160,
  maxHeight,
  editorClassName,
}: RichEditorInputProps) {
  return (
    <FormFieldEngine<string>
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
      readOnly={readOnly}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
    >
      {({ id, value = "", onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError }) => (
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
          disabled={isDisabled}
          readOnly={isReadOnly}
          hasError={hasError}
          className={editorClassName}
        />
      )}
    </FormFieldEngine>
  );
});
RichEditorInput.displayName = "RichEditorInput";
