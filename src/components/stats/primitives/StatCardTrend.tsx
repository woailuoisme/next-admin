import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

import type { StatCardTrendProps } from "./types";

import { calculateTrendInfo } from "../stat-card/useTrendInfo";

export const StatCardTrend = memo(function StatCardTrend({
  trend,
  value,
  direction,
  label,
  isPositiveGood,
  className,
  ...props
}: StatCardTrendProps) {
  const trendConfig = trend ?? (value !== undefined ? { value, direction, label, isPositiveGood } : null);
  const trendInfo = calculateTrendInfo(trendConfig);

  if (!trendInfo) return null;

  return (
    <div className={cn("flex min-w-0 items-center gap-1.5", className)} {...props}>
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] leading-tight font-medium",
          trendInfo.colorClass,
        )}
      >
        {trendInfo.dir === "up" && <ArrowUpRight className="h-3 w-3" />}
        {trendInfo.dir === "down" && <ArrowDownRight className="h-3 w-3" />}
        {trendInfo.dir === "neutral" && <Minus className="h-3 w-3" />}
        {trendInfo.displayValue}
      </span>
      {trendInfo.label ? (
        <span className="text-muted-foreground truncate text-[11px]" title={trendInfo.label}>
          {trendInfo.label}
        </span>
      ) : null}
    </div>
  );
});
