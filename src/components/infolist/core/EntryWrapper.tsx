import * as React from "react";

import { COL_SPAN_CLASSES } from "@/components/shared/grid";
import { LabelHelpTooltip } from "@/components/shared/LabelHelpTooltip";
import { cn } from "@/lib/utils";

import type { EntryWrapperProps } from "./types";

import { useInfolistContext } from "./InfolistContext";

/**
 * 条目空值统一占位符
 */
export function EntryPlaceholder({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground/60 select-none">{children}</span>;
}

export const EntryWrapper = React.memo(function EntryWrapper({
  label,
  hint,
  tooltip,
  helperText,
  hidden,
  colSpan,
  inline,
  className,
  labelClassName,
  contentClassName,
  children,
}: EntryWrapperProps) {
  const context = useInfolistContext();

  if (hidden) return null;

  const isInline = inline ?? context.orientation === "horizontal";
  const isDense = context.dense ?? false;

  return (
    <div
      className={cn(
        "w-full text-left",
        colSpan ? COL_SPAN_CLASSES[colSpan] : "col-span-1",
        isInline
          ? "flex flex-col gap-2 py-1.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
          : "flex flex-col",
        !isInline && (isDense ? "gap-1" : "gap-1.5"),
        className,
      )}
    >
      {(label || hint) && (
        <div className={cn("flex items-center justify-between gap-2", isInline && "sm:w-1/3 sm:shrink-0")}>
          <div className="flex items-center gap-1.5">
            {label && (
              <span
                className={cn(
                  "font-medium tracking-tight text-muted-foreground select-none",
                  isDense ? "text-[11px]" : "text-xs",
                  labelClassName,
                )}
              >
                {label}
              </span>
            )}

            {tooltip && <LabelHelpTooltip content={tooltip} />}
          </div>

          {hint && <div className="text-muted-foreground/80 text-[11px] font-normal">{hint}</div>}
        </div>
      )}

      <div
        className={cn(
          "min-w-0",
          isInline
            ? "flex flex-1 flex-col items-start text-left sm:w-2/3 sm:items-end sm:text-right"
            : "w-full",
          contentClassName,
        )}
      >
        <div className="text-foreground w-full text-sm font-normal break-words">{children}</div>

        {helperText && (
          <div
            className={cn(
              "mt-1 text-[11px] leading-relaxed text-muted-foreground/80",
              isInline && "sm:text-right",
            )}
          >
            {helperText}
          </div>
        )}
      </div>
    </div>
  );
});
