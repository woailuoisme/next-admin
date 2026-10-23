import { isNil } from "es-toolkit";
import { CheckCircle2, Minus, XCircle } from "lucide-react";
import { memo, type ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { IconCellOption, IconCellProps } from "./types";

import { JUSTIFY_ALIGN_CLASSES } from "../base";

const sizeClasses = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

export const IconCell = memo(function IconCell({
  value,
  icon: DefaultIcon,
  iconMap,
  size = "sm",
  label,
  labelPosition = "right",
  container = "none",
  tooltip,
  align = "center",
  className,
}: IconCellProps) {
  let iconNode: ReactNode = null;
  let resolvedTooltip = tooltip;
  let extractedLabel: ReactNode = label;

  // 1. Boolean value mode
  if (typeof value === "boolean") {
    if (value) {
      iconNode = <CheckCircle2 className={cn(sizeClasses[size], "shrink-0 text-emerald-500")} />;
      resolvedTooltip = resolvedTooltip || "是 / 已启用";
    } else {
      iconNode = <XCircle className={cn(sizeClasses[size], "shrink-0 text-rose-500/80")} />;
      resolvedTooltip = resolvedTooltip || "否 / 未启用";
    }
  } else if (isNil(value)) {
    if (DefaultIcon) {
      iconNode = <DefaultIcon className={cn(sizeClasses[size], "shrink-0 text-muted-foreground")} />;
    } else {
      iconNode = <Minus className={cn(sizeClasses[size], "shrink-0 text-muted-foreground/40")} />;
    }
  } else {
    // 2. Custom iconMap or default icon
    const stringKey = String(value);
    const mapped = iconMap?.[stringKey];

    if (mapped) {
      if (typeof mapped === "object" && "icon" in mapped) {
        const opt = mapped as IconCellOption;
        const IconComponent = opt.icon;
        iconNode = <IconComponent className={cn(sizeClasses[size], opt.color || "text-foreground", "shrink-0")} />;
        if (opt.label) {
          if (!extractedLabel) extractedLabel = opt.label;
          if (!resolvedTooltip) resolvedTooltip = opt.label;
        }
      } else {
        const IconComponent = mapped as React.ComponentType<{
          className?: string;
        }>;
        iconNode = <IconComponent className={cn(sizeClasses[size], "shrink-0 text-foreground")} />;
      }
    } else if (DefaultIcon) {
      iconNode = <DefaultIcon className={cn(sizeClasses[size], "shrink-0 text-muted-foreground")} />;
    } else {
      iconNode = <Minus className={cn(sizeClasses[size], "shrink-0 text-muted-foreground/40")} />;
    }
  }

  const wrappedIcon =
    container === "badge" ? (
      <span className="border-border/60 bg-muted/40 inline-flex shrink-0 items-center justify-center rounded-md border p-1">
        {iconNode}
      </span>
    ) : container === "circle" ? (
      <span className="border-border/60 bg-muted/40 inline-flex shrink-0 items-center justify-center rounded-full border p-1">
        {iconNode}
      </span>
    ) : (
      iconNode
    );

  const content = (
    <div
      className={cn(
        "flex items-center gap-1.5 select-none",
        labelPosition === "bottom" ? "flex-col" : "flex-row",
        JUSTIFY_ALIGN_CLASSES[align],
        className,
      )}
    >
      {wrappedIcon}
      {extractedLabel && <span className="text-foreground/80 text-xs font-medium">{extractedLabel}</span>}
    </div>
  );

  if (resolvedTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex max-w-full cursor-default">{content}</div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {resolvedTooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
});
