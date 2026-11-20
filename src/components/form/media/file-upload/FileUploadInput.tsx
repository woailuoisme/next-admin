"use client";

import { FormFieldEngine } from "../../core";
import { FileUploadCore } from "./FileUploadCore";
import type { FileUploadInputProps, FileUploadValue } from "./types";
import { DEFAULT_MAX_FILES, DEFAULT_MAX_SIZE } from "./utils";

export function FileUploadInput({
  mode = "grid",
  accept,
  multiple = true,
  maxFiles = DEFAULT_MAX_FILES,
  maxSize = DEFAULT_MAX_SIZE,
  adapter,
  endpoint,
  headers,
  paste = true,
  crop = true,
  showDownload = true,
  showRemove = true,
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
          adapter={adapter}
          endpoint={endpoint}
          headers={headers}
          paste={paste}
          crop={crop}
          showDownload={showDownload}
          showRemove={showRemove}
          disabled={isDisabled}
          readOnly={isReadOnly}
          hasError={hasError}
          describedBy={describedBy}
          className={dropzoneClassName}
        />
      )}
    </FormFieldEngine>
  );
}
