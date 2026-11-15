"use client";

import { useMemoizedFn } from "ahooks";
import { HelpCircle } from "lucide-react";
import { memo } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

import type { StatCardHelpTooltipProps } from "./types";

export const StatCardHelpTooltip = memo(function StatCardHelpTooltip({
  description,
  className,
}: StatCardHelpTooltipProps) {
  const handleClick = useMemoizedFn((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  });

  if (!description) return null;

  return (
    <Tooltip delayDuration={200}>
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
          onClick={handleClick}
        >
          <HelpCircle className="size-3.5" aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        {description}
      </TooltipContent>
    </Tooltip>
  );
});
