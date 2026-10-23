import { clamp, isNil } from "es-toolkit";
import { memo } from "react";

import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { ProgressCellProps } from "./types";

import { JUSTIFY_ALIGN_CLASSES } from "../base";

const heightClasses = {
  sm: "h-1.5",
  md: "h-2",
};

function TargetMarker({ percentage }: { percentage?: number }) {
  if (typeof percentage !== "number") return null;
  return (
    <div
      style={{ left: `${percentage}%` }}
      className="bg-foreground absolute -top-0.5 -bottom-0.5 z-10 w-0.5 -translate-x-1/2 rounded-full shadow-xs"
      aria-hidden="true"
    />
  );
}

function getIndicatorColorClass(colorByValue: boolean, percentage: number): string | undefined {
  if (!colorByValue) return undefined;
  if (percentage >= 80) return "[&>[data-slot=progress-indicator]]:bg-emerald-500";
  if (percentage >= 40) return "[&>[data-slot=progress-indicator]]:bg-amber-500";
  return "[&>[data-slot=progress-indicator]]:bg-rose-500";
}

export const ProgressCell = memo(function ProgressCell({
  value,
  max = 100,
  showLabel = true,
  showPercentage,
  size = "sm",
  colorByValue = false,
  segments,
  target,
  targetLabel,
  align = "left",
  className,
}: ProgressCellProps) {
  const shouldShowLabel = showPercentage !== undefined ? showPercentage : showLabel;

  // 1. 多段堆叠进度条模式
  if (segments && segments.length > 0) {
    const totalVal = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
    const effectiveMax = max || totalVal || 100;
    const totalPercentage = Math.min(100, Math.round((totalVal / effectiveMax) * 100));

    const targetPct =
      typeof target === "number" ? Math.min(100, Math.max(0, (target / effectiveMax) * 100)) : undefined;

    const stackedContent = (
      <div
        className={cn(
          "flex w-full max-w-[200px] min-w-[90px] items-center gap-2",
          JUSTIFY_ALIGN_CLASSES[align],
          className,
        )}
      >
        <div className="relative min-w-[50px] flex-1">
          <div className={cn("relative flex w-full overflow-hidden rounded-full bg-muted/80", heightClasses[size])}>
            {segments.map((seg, idx) => {
              const segPct = effectiveMax > 0 ? (Math.max(0, seg.value) / effectiveMax) * 100 : 0;
              if (segPct <= 0) return null;

              return (
                <div
                  key={idx}
                  style={{ width: `${segPct}%` }}
                  className={cn("h-full transition-all", seg.color || seg.className || "bg-primary")}
                />
              );
            })}
          </div>

          <TargetMarker percentage={targetPct} />
        </div>

        {shouldShowLabel && (
          <span className="text-muted-foreground w-8 shrink-0 text-right font-mono text-[11px] tabular-nums">
            {totalPercentage}%
          </span>
        )}
      </div>
    );

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex w-full cursor-default">{stackedContent}</div>
        </TooltipTrigger>
        <TooltipContent side="top" className="space-y-1 text-xs">
          <div className="font-mono text-[11px] font-medium">
            总量: {totalVal} / {effectiveMax} ({totalPercentage}%)
          </div>
          <div className="space-y-0.5 pt-0.5">
            {segments.map((seg, idx) => {
              const pct = Math.round((seg.value / (effectiveMax || 1)) * 100);
              return (
                <div key={idx} className="text-muted-foreground flex items-center gap-1.5 text-[10px]">
                  <span className={cn("size-1.5 shrink-0 rounded-full", seg.color || seg.className || "bg-primary")} />
                  <span>{seg.label || `分段 ${idx + 1}`}:</span>
                  <span className="text-foreground font-mono font-medium">
                    {seg.value} ({pct}%)
                  </span>
                </div>
              );
            })}
            {typeof target === "number" && (
              <div className="border-border/50 text-primary border-t pt-0.5 text-[10px]">
                {targetLabel || `目标线: ${target}%`}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // 2. 单一进度条模式
  if (isNil(value) || Number.isNaN(value)) {
    return <span className="text-muted-foreground/40 text-xs italic">-</span>;
  }

  const safeValue = clamp(value, 0, max);
  const percentage = Math.round((safeValue / max) * 100);

  const indicatorColorClass = getIndicatorColorClass(colorByValue, percentage);

  const targetPct = typeof target === "number" ? Math.min(100, Math.max(0, (target / max) * 100)) : undefined;

  const content = (
    <div
      className={cn(
        "flex w-full max-w-[180px] min-w-[80px] items-center gap-2.5",
        JUSTIFY_ALIGN_CLASSES[align],
        className,
      )}
    >
      <div className="relative min-w-[50px] flex-1">
        <Progress
          value={percentage}
          className={cn(heightClasses[size], "overflow-hidden rounded-full bg-muted/80", indicatorColorClass)}
        />
        <TargetMarker percentage={targetPct} />
      </div>

      {shouldShowLabel && (
        <span className="text-muted-foreground w-8 shrink-0 text-right font-mono text-[11px] tabular-nums">
          {percentage}%
        </span>
      )}
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex w-full cursor-default">{content}</div>
      </TooltipTrigger>
      <TooltipContent side="top" className="font-mono text-xs">
        <p>
          {safeValue} / {max} ({percentage}%)
        </p>
        {typeof target === "number" && (
          <p className="text-muted-foreground mt-0.5 text-[10px]">{targetLabel || `目标线: ${target}%`}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
});
