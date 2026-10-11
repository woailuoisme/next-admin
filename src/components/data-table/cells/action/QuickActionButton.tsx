import { useMemoizedFn } from "ahooks";
import { memo } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { ActionItem } from "./types";

interface QuickActionButtonProps<TData> {
  action: ActionItem<TData>;
  row: TData;
  index?: number;
}

function QuickActionButtonInner<TData>({ action, row }: QuickActionButtonProps<TData>) {
  const Icon = action.icon;
  const isDisabled = typeof action.disabled === "function" ? action.disabled(row) : !!action.disabled;

  const labelText = typeof action.label === "string" ? action.label : undefined;
  const tooltipContent = action.tooltip || labelText;
  const srText = action.ariaLabel || labelText || "操作";

  const handleClick = useMemoizedFn((e: React.MouseEvent) => {
    e.stopPropagation();
    action.onClick(row);
  });

  const button = (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={isDisabled}
      onClick={handleClick}
      className={cn(
        "min-h-8 min-w-8 cursor-pointer text-muted-foreground transition-colors hover:text-foreground",
        action.destructive && "hover:bg-destructive/10 hover:text-destructive",
      )}
    >
      {Icon && <Icon className="size-3.5" />}
      <span className="sr-only">{srText}</span>
    </Button>
  );

  if (tooltipContent) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {isDisabled ? (
            <span className="inline-flex cursor-not-allowed focus-visible:outline-none" tabIndex={0}>
              {button}
            </span>
          ) : (
            button
          )}
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

export const QuickActionButton = memo(QuickActionButtonInner) as typeof QuickActionButtonInner;
