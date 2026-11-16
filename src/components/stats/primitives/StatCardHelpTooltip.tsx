"use client";

import { HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

import type { StatCardHelpTooltipProps } from "./types";

export function StatCardHelpTooltip({ description, className }: StatCardHelpTooltipProps) {
  if (!description) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className={cn(
            "relative z-10 shrink-0 cursor-help text-muted-foreground/60 hover:text-muted-foreground",
            className,
          )}
          aria-label={description}
        >
          <HelpCircle className="size-3.5" aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        {description}
      </TooltipContent>
    </Tooltip>
  );
}
