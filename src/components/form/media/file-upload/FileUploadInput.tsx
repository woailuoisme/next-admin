"use client";

import { memo } from "react";

import type { FileUploadInputProps, FileUploadValue } from "./types";

import { FormFieldEngine } from "../../core";
import { FileUploadCore } from "./FileUploadCore";
import { DEFAULT_MAX_FILES, DEFAULT_MAX_SIZE } from "./pipeline";

export const FileUploadInput = memo(function FileUploadInput({
  mode = "grid",
  accept,
  multiple = true,
  maxFiles = DEFAULT_MAX_FILES,
  maxSize = DEFAULT_MAX_SIZE,
  showDownload = true,
  showRemove = true,
  onUpload,
  transport,
  valueCodec,
  dropzoneClassName,
  ...fieldProps
}: FileUploadInputProps) {
  return (
    <FormFieldEngine<FileUploadValue | null> {...fieldProps}>
      {({ id, value, onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy }) => (
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
          transport={transport}
          valueCodec={valueCodec}
          disabled={isDisabled}
          readOnly={isReadOnly}
          hasError={hasError}
          describedBy={describedBy}
          className={dropzoneClassName}
        />
      )}
    </FormFieldEngine>
  );
});
FileUploadInput.displayName = "FileUploadInput";
