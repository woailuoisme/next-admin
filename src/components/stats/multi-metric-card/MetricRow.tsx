import { memo } from "react";

import { cn } from "@/lib/utils";

import type { SubMetricItem } from "./types";

interface MetricRowProps {
  item: SubMetricItem;
}

export const MetricRow = memo(function MetricRow({ item }: MetricRowProps) {
  const trendVal = item.trend ? String(item.trend.value) : "";
  const isNegative = trendVal.startsWith("-");

  return (
    <div className="border-border/30 bg-muted/40 flex flex-col justify-between space-y-1 rounded-lg border p-2">
      <span className="text-muted-foreground truncate text-[11px] font-medium">{item.label}</span>
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <span className="text-foreground font-mono text-sm font-bold">
          {item.prefix}
          {item.value}
          {item.suffix}
        </span>
        {item.trend ? (
          <span
            className={cn(
              "font-mono text-[10px]",
              isNegative ? "text-destructive" : "text-chart-2",
            )}
          >
            {item.trend.value}
          </span>
        ) : null}
      </div>
    </div>
  );
});
