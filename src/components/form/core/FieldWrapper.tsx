import { AlertCircle } from "lucide-react";
import { memo } from "react";

import { COL_SPAN_CLASSES } from "@/components/shared/grid";
import { LabelHelpTooltip } from "@/components/shared/LabelHelpTooltip";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

import type { FieldWrapperProps } from "./types";

export const FieldWrapper = memo(function FieldWrapper({
  label,
  id,
  required,
  hint,
  helperText,
  tooltip,
  error,
  meta,
  colSpan,
  className,
  hidden,
  children,
  align,
}: FieldWrapperProps) {
  if (hidden) return null;

  const isTouched = meta?.isTouched ?? true;
  const metaError = isTouched && meta?.errors?.length ? String(meta.errors[0]) : undefined;
  const resolvedError = error ?? metaError;
  const hasError = Boolean(resolvedError);

  return (
    <Field
      data-invalid={hasError}
      orientation="vertical"
      className={cn(
        "w-full gap-1.5 text-left",
        align === "center" && "items-center text-center",
        align === "right" && "items-end text-right",
        colSpan ? COL_SPAN_CLASSES[colSpan] : "col-span-1",
        className,
      )}
    >
      {(label || hint) && (
        <div
          className={cn(
            "flex items-center gap-2",
            align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-between",
          )}
        >
          <div className="flex items-center gap-1.5">
            {label && (
              <FieldLabel
                htmlFor={id}
                className={cn(
                  "text-xs leading-none font-semibold tracking-tight select-none",
                  hasError ? "text-destructive" : "text-foreground",
                )}
              >
                {label}
                {required && <span className="text-destructive ml-0.5 font-bold">*</span>}
              </FieldLabel>
            )}

            {tooltip && <LabelHelpTooltip content={tooltip} />}
          </div>

          {hint && <div className="text-muted-foreground text-[11px] font-normal">{hint}</div>}
        </div>
      )}

      <div
        className={cn("w-full", align === "center" && "flex justify-center", align === "right" && "flex justify-end")}
      >
        {children}
      </div>

      {/* 底部错误提示或辅助文字 */}
      {hasError ? (
        <FieldError
          id={id ? `${id}-error` : undefined}
          className={cn(
            "animate-in text-destructive fade-in-50 flex items-center gap-1 text-[11px] font-medium duration-150",
            align === "center" && "justify-center",
            align === "right" && "justify-end",
          )}
        >
          <AlertCircle className="size-3 shrink-0" />
          <span>{resolvedError}</span>
        </FieldError>
      ) : helperText ? (
        <FieldDescription
          id={id ? `${id}-desc` : undefined}
          className={cn(
            "text-muted-foreground text-[11px] leading-relaxed",
            align === "center" && "text-center",
            align === "right" && "text-right",
          )}
        >
          {helperText}
        </FieldDescription>
      ) : null}
    </Field>
  );
});
