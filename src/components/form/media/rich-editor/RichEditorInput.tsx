"use client";

import dynamic from "next/dynamic";
import { memo } from "react";

import { FormFieldEngine } from "../../core";
import { RichEditorSkeleton } from "./RichEditorSkeleton";
import { DEFAULT_TOOLBAR, type RichEditorInputProps } from "./types";

const DynamicTipTapCore = dynamic(() => import("./TipTapCore").then((mod) => mod.TipTapCore), {
  ssr: false,
  loading: () => <RichEditorSkeleton />,
});

export const RichEditorInput = memo(function RichEditorInput({
  placeholder,
  defaultValue = "",
  format = "html",
  codec,
  toolbarButtons = DEFAULT_TOOLBAR,
  minHeight = 160,
  maxHeight,
  editorClassName,
  ...fieldProps
}: RichEditorInputProps) {
  return (
    <FormFieldEngine<string> defaultValue={defaultValue} {...fieldProps}>
      {({ id, value = "", onChange, onBlur, disabled: isDisabled, readOnly: isReadOnly, hasError, describedBy }) => (
        <DynamicTipTapCore
          id={id}
          value={value ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          format={format}
          codec={codec}
          placeholder={placeholder}
          toolbarButtons={toolbarButtons}
          minHeight={minHeight}
          maxHeight={maxHeight}
          disabled={isDisabled}
          readOnly={isReadOnly}
          hasError={hasError}
          describedBy={describedBy}
          className={editorClassName}
        />
      )}
    </FormFieldEngine>
  );
});
RichEditorInput.displayName = "RichEditorInput";
