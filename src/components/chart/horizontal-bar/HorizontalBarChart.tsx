import { memo } from "react";

import { cn } from "@/lib/utils";

import type { HorizontalBarChartProps } from "./types";

import { ChartEmptyState } from "../shared/ChartEmptyState";
import { useHorizontalBar } from "./useHorizontalBar";

export const HorizontalBarChart = memo(function HorizontalBarChart(props: HorizontalBarChartProps) {
  const { showPercentage = true, height, className } = props;

  const { items, hasData, valueFormatter, percentageFormatter } = useHorizontalBar(props);

  if (!hasData) {
    return <ChartEmptyState message="暂无排行数据" height={height ?? 200} className={className} />;
  }

  return (
    <div className={cn("w-full space-y-3", className)} style={{ minHeight: height }}>
      {items.map((item, idx) => {
        const Icon = item.icon;
        const rank = idx + 1;

        return (
          <div
            key={item.id ?? item.label}
            className="hover:bg-muted/30 space-y-1.5 rounded-lg p-1.5 transition-colors"
          >
            {/* Top text line: Rank, Label, Value, Percentage */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex min-w-0 items-center gap-2">
                {/* Rank number badge */}
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold",
                    rank === 1 &&
                      "border border-amber-500/30 bg-amber-500/20 text-amber-600 dark:text-amber-400",
                    rank === 2 &&
                      "border border-slate-400/30 bg-slate-400/20 text-slate-600 dark:text-slate-300",
                    rank === 3 &&
                      "border border-amber-700/30 bg-amber-700/20 text-amber-700 dark:text-amber-500",
                    rank > 3 && "border border-border/40 bg-muted text-muted-foreground",
                  )}
                >
                  {rank}
                </span>

                {Icon && <Icon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />}

                <span className="text-foreground truncate font-medium">{item.label}</span>

                {item.secondaryLabel && (
                  <span className="text-muted-foreground/70 hidden truncate text-[11px] sm:inline">
                    ({item.secondaryLabel})
                  </span>
                )}
              </div>

              <div className="ml-2 flex shrink-0 items-center gap-2.5">
                <span className="text-foreground font-mono font-semibold">
                  {valueFormatter(item.value)}
                </span>
                {showPercentage && (
                  <span className="text-muted-foreground w-12 text-right font-mono text-[11px]">
                    {percentageFormatter(item.pct)}
                  </span>
                )}
              </div>
            </div>

            {/* Progress Track */}
            <div className="bg-muted/60 h-2 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(2, item.barPct))}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
});
