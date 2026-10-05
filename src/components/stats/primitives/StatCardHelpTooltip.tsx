import { HelpCircle } from "lucide-react";
import { memo } from "react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { StatCardHelpTooltipProps } from "./types";

export const StatCardHelpTooltip = memo(function StatCardHelpTooltip({
  description,
  className,
}: StatCardHelpTooltipProps) {
  if (!description) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            role="button"
            tabIndex={0}
            className={cn(
              "inline-flex cursor-help items-center text-muted-foreground/60 transition-colors hover:text-muted-foreground",
              className,
            )}
            aria-label={description}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="sr-only">{description}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          {description}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
