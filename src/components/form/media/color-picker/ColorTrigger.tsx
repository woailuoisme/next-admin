import { forwardRef, memo } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { ColorTriggerProps } from "./types";

export const ColorTrigger = memo(
  forwardRef<HTMLButtonElement, ColorTriggerProps>(function ColorTrigger(
    { id, value, placeholder = "#000000", disabled, hasError, className, ...props },
    ref,
  ) {
    const hasValue = Boolean(value);
    const displayText = (hasValue ? value : placeholder).toUpperCase();

    return (
      <Button
        ref={ref}
        id={id}
        type="button"
        variant="outline"
        disabled={disabled}
        aria-label={props["aria-label"] ?? (hasValue ? value : placeholder)}
        className={cn(
          "h-8 w-full justify-start rounded-md bg-transparent px-2.5 pr-8 text-left text-xs font-normal shadow-2xs transition-colors",
          !hasValue && "text-muted-foreground",
          hasError && "border-destructive focus-visible:ring-destructive/20",
          className,
        )}
        {...props}
      >
        <div className="flex items-center gap-2 truncate">
          <span
            className="border-border/80 size-4 shrink-0 rounded-sm border shadow-2xs transition-transform"
            style={{ backgroundColor: hasValue ? value : "transparent" }}
            aria-hidden="true"
          />
          <span className="truncate font-mono tracking-wider uppercase">{displayText}</span>
        </div>
      </Button>
    );
  }),
);
