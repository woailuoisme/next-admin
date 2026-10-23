import { isNil } from "es-toolkit";
import { ExternalLink } from "lucide-react";
import { memo } from "react";

import { CopyButton } from "@/components/shared/CopyButton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { TextCellProps } from "./types";

import { AVATAR_ALIGN_CLASSES } from "../base";

const sizeClasses = {
  xs: "text-[11px]",
  sm: "text-xs",
  base: "text-sm",
};

const weightClasses = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const clampClasses = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
};

const tagVariantClasses = {
  outline: "border border-border text-muted-foreground bg-transparent",
  secondary: "border border-transparent bg-secondary text-secondary-foreground",
  primary: "border border-primary/20 bg-primary/10 text-primary",
  muted: "border border-border/50 bg-muted/60 text-muted-foreground",
};

/** 安全高亮匹配字符串 */
function highlightString(text: string, query?: string): React.ReactNode {
  if (!query || !query.trim()) return text;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  if (parts.length <= 1) return text;

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <mark key={i} className="bg-primary/20 text-primary dark:bg-primary/30 rounded-xs px-0.5 font-medium">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

export const TextCell = memo(function TextCell({
  title,
  value,
  description,
  prefix,
  suffix,
  highlightText,
  tag,
  tagVariant = "secondary",
  kbd,
  url,
  isExternal = false,
  lineClamp,
  copyable,
  mono = false,
  truncate = true,
  tooltip,
  size = "sm",
  weight = "normal",
  align = "left",
  onClick,
  className,
}: TextCellProps) {
  const resolvedTitle = title !== undefined ? title : value;
  if (isNil(resolvedTitle)) {
    return <span className="text-muted-foreground/40 text-xs italic">-</span>;
  }

  const copyText =
    typeof copyable === "string"
      ? copyable
      : typeof resolvedTitle === "string" || typeof resolvedTitle === "number"
        ? String(resolvedTitle)
        : "";

  const renderedTitle =
    typeof resolvedTitle === "string" && highlightText ? highlightString(resolvedTitle, highlightText) : resolvedTitle;

  const titleElement = (
    <span
      className={cn(
        "leading-tight tracking-tight text-foreground",
        sizeClasses[size],
        weightClasses[weight],
        mono && "font-mono",
        lineClamp ? clampClasses[lineClamp] : truncate && "truncate",
      )}
    >
      {renderedTitle}
    </span>
  );

  const linkedTitle = url ? (
    <a
      href={url}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="hover:text-primary inline-flex items-center gap-1 transition-colors hover:underline"
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
        }
      }}
    >
      {titleElement}
      {isExternal && <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />}
    </a>
  ) : (
    titleElement
  );

  const renderedDescription =
    typeof description === "string" && highlightText ? highlightString(description, highlightText) : description;

  const content = (
    <div
      className={cn(
        "group/text-cell flex max-w-full min-w-0 flex-col",
        AVATAR_ALIGN_CLASSES[align],
        onClick && "cursor-pointer hover:underline",
        className,
      )}
      onClick={onClick}
    >
      <div className="flex max-w-full min-w-0 items-center gap-1.5">
        {prefix && <span className="text-muted-foreground shrink-0">{prefix}</span>}

        {linkedTitle}

        {tag && (
          <span
            className={cn(
              "py-0.2 inline-flex shrink-0 items-center rounded px-1.5 text-[10px] leading-none font-medium tracking-tight",
              tagVariantClasses[tagVariant],
            )}
          >
            {tag}
          </span>
        )}

        {kbd && (
          <kbd className="py-0.2 border-border bg-muted/80 text-muted-foreground inline-flex shrink-0 items-center rounded border px-1 font-mono text-[9px] font-semibold shadow-2xs">
            {kbd}
          </kbd>
        )}

        {suffix && <span className="text-muted-foreground shrink-0">{suffix}</span>}

        {copyable && copyText && (
          <CopyButton
            text={copyText}
            className="ml-0.5 shrink-0 opacity-0 transition-opacity group-hover/text-cell:opacity-100"
            title="复制到剪贴板"
          />
        )}
      </div>

      {description && (
        <span
          className={cn(
            "mt-0.5 text-[11px] leading-normal text-muted-foreground/80",
            mono && "font-mono",
            lineClamp ? clampClasses[lineClamp] : truncate && "max-w-full truncate",
          )}
        >
          {renderedDescription}
        </span>
      )}
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex max-w-full">{content}</div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
});
