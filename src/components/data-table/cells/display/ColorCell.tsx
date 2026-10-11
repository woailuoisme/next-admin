import { useMemoizedFn } from "ahooks";
import { isNil } from "es-toolkit";
import { Check, Copy } from "lucide-react";
import { memo, useEffect, useState } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { ColorCellProps } from "./types";

import { JUSTIFY_ALIGN_CLASSES } from "../base";

const shapeClasses = {
  circle: "rounded-full",
  rounded: "rounded-sm",
  square: "rounded-none",
};

export const ColorCell = memo(function ColorCell({
  value,
  copyable = true,
  showHex = true,
  shape = "rounded",
  checkerboard = true,
  align = "left",
  className,
}: ColorCellProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = useMemoizedFn((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value || copied) return;
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(true);
  });

  if (isNil(value) || value === "") {
    return <span className="text-muted-foreground/40 text-xs italic">-</span>;
  }

  const isAlpha =
    value.includes("rgba") ||
    value.includes("hsla") ||
    (value.startsWith("#") && (value.length === 5 || value.length === 9));

  const showChecker = checkerboard && isAlpha;

  return (
    <div className={cn("flex items-center gap-2 select-none", JUSTIFY_ALIGN_CLASSES[align], className)}>
      <span
        className={cn(
          "relative size-4 shrink-0 overflow-hidden border border-border/80 shadow-2xs",
          shapeClasses[shape],
        )}
        aria-label={`Color swatch: ${value}`}
      >
        {showChecker && (
          <span
            className="absolute inset-0 bg-[linear-gradient(45deg,#cbd5e1_25%,transparent_25%),linear-gradient(-45deg,#cbd5e1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#cbd5e1_75%),linear-gradient(-45deg,transparent_75%,#cbd5e1_75%)] bg-[size:6px_6px] bg-[position:0_0,0_3px,3px_-3px,-3px_0] opacity-40 dark:bg-[linear-gradient(45deg,#475569_25%,transparent_25%),linear-gradient(-45deg,#475569_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#475569_75%),linear-gradient(-45deg,transparent_75%,#475569_75%)]"
            aria-hidden="true"
          />
        )}
        <span className="absolute inset-0" style={{ backgroundColor: value }} />
      </span>
      {showHex && (
        <span className="text-foreground/90 font-mono text-xs uppercase tabular-nums">{value}</span>
      )}
      {copyable && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground cursor-pointer rounded p-0.5 transition-colors"
              aria-label="Copy color hex code"
            >
              {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {copied ? "已复制" : "复制颜色代码"}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
});
