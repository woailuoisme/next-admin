import { memo } from "react";

import type { FileUploadInputProps, FileUploadValue } from "./types";

import { FieldConnector, FieldWrapper, useFieldId } from "../../core";
import { FileUploadCore } from "./FileUploadCore";

interface FileUploadInputInnerProps extends FileUploadInputProps {
  id: string;
  value: FileUploadValue | undefined;
  onChange: (value: FileUploadValue) => void;
  onBlur?: () => void;
  computedError?: React.ReactNode;
}

const FileUploadInputInner = memo(function FileUploadInputInner({
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
  value,
  onChange,
  onBlur,
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
}: FileUploadInputInnerProps) {
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
        disabled={disabled}
        readOnly={readOnly}
        hasError={hasError}
        className={dropzoneClassName}
      />
    </FieldWrapper>
  );
});

export const FileUploadInput = memo(function FileUploadInput({
  name,
  form,
  id: explicitId,
  value: controlledValue,
  defaultValue,
  onChange: controlledOnChange,
  onBlur: controlledOnBlur,
  error,
  ...restProps
}: FileUploadInputProps) {
  const id = useFieldId(name, explicitId);

  return (
    <FieldConnector<FileUploadValue>
      name={name}
      form={form}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={controlledOnChange}
      onBlur={controlledOnBlur}
      error={error}
    >
      {({ value, onChange, onBlur, error: computedError }) => (
        <FileUploadInputInner
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
