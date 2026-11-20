"use client";

import dynamic from "next/dynamic";

import { FormFieldEngine } from "../../core";
import { RichEditorSkeleton } from "./RichEditorSkeleton";
import type { RichEditorInputProps } from "./types";

const DynamicPlateEditorCore = dynamic(() => import("./PlateEditorCore").then((mod) => mod.PlateEditorCore), {
  ssr: false,
  loading: () => <RichEditorSkeleton />,
});

export function RichEditorInput({
  placeholder,
  defaultValue = "",
  minHeight = 160,
  maxHeight,
  editorClassName,
  ...fieldProps
}: RichEditorInputProps) {
  return (
    <FormFieldEngine<string> defaultValue={defaultValue} {...fieldProps}>
      {({ id, value = "", onChange, onBlur, disabled, readOnly, hasError, describedBy }) => (
        <DynamicPlateEditorCore
          id={id}
          value={value ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          minHeight={minHeight}
          maxHeight={maxHeight}
          disabled={disabled}
          readOnly={readOnly}
          hasError={hasError}
          describedBy={describedBy}
          className={editorClassName}
        />
      )}
    </FormFieldEngine>
  );
}
