import { memo } from "react";

import type { FileUploadInputProps, FileUploadValue } from "./types";

import { FormFieldEngine } from "../../core";
import { FileUploadCore } from "./FileUploadCore";

export const FileUploadInput = memo(function FileUploadInput({
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
  value: controlledValue,
  defaultValue,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  mode = "grid",
  accept,
  multiple = true,
  maxFiles = 6,
  maxSize = 10 * 1024 * 1024,
  showDownload = true,
  showRemove = true,
  onUpload,
  disabled,
  readOnly,
  dropzoneClassName,
}: FileUploadInputProps) {
  return (
    <FormFieldEngine<FileUploadValue>
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
      {({ id, value, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError }) => (
        <FileUploadCore
          id={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          mode={mode}
          accept={accept}
          multiple={multiple}
          maxFiles={maxFiles}
          maxSize={maxSize}
          showDownload={showDownload}
          showRemove={showRemove}
          onUpload={onUpload}
          disabled={isDisabled}
          readOnly={isReadOnly}
          hasError={hasError}
          className={dropzoneClassName}
        />
      )}
    </FormFieldEngine>
  );
});
FileUploadInput.displayName = "FileUploadInput";
