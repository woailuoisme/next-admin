import { lazy, memo, Suspense, useId } from "react";

import type { RichEditorInputProps } from "./types";

import { FieldWrapper } from "../../core";
import { RichEditorSkeleton } from "./RichEditorSkeleton";

const AsyncRichEditorInput = lazy(() =>
  import("./RichEditorInput").then((mod) => ({ default: mod.RichEditorInput })),
);

export const LazyRichEditorInput = memo(function LazyRichEditorInput({
  label,
  id,
  name,
  required,
  hint,
  helperText,
  tooltip,
  error,
  colSpan,
  className,
  hidden,
  ...props
}: RichEditorInputProps) {
  const autoId = useId();
  const fieldId = id || (name ? `field-${name}` : autoId);

  return (
    <Suspense
      fallback={
        <FieldWrapper
          label={label}
          id={fieldId}
          required={required}
          hint={hint}
          helperText={helperText}
          tooltip={tooltip}
          error={error}
          colSpan={colSpan}
          className={className}
          hidden={hidden}
        >
          <RichEditorSkeleton minHeight={props.minHeight} className={props.editorClassName} />
        </FieldWrapper>
      }
    >
      <AsyncRichEditorInput
        label={label}
        id={fieldId}
        name={name}
        required={required}
        hint={hint}
        helperText={helperText}
        tooltip={tooltip}
        error={error}
        colSpan={colSpan}
        className={className}
        hidden={hidden}
        {...props}
      />
    </Suspense>
  );
});
