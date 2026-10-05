import { memo } from "react";

import { defaultNumberFormatter } from "./formatters";

export interface ChartTooltipEntry {
  name?: string | number;
  value?: number | string | ReadonlyArray<number | string>;
  dataKey?: string | number | ((obj: unknown) => unknown);
  color?: string;
  stroke?: string;
  fill?: string;
  payload?: unknown;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<ChartTooltipEntry>;
  label?: string | number;
  valueFormatter?: (value: number) => string;
  titleFormatter?: (label: string | number) => string;
  hideLabel?: boolean;
}

/**
 * Shared, high-performance memoized tooltip for Recharts visualizations
 * Follows Vercel React Best Practices (rerender-memo, rerender-memo-with-default-value)
 */
export const ChartTooltip = memo(function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = defaultNumberFormatter,
  titleFormatter,
  hideLabel = false,
}: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const displayLabel = titleFormatter ? titleFormatter(label ?? "") : label;

  return (
    <div className="animate-in border-border/80 bg-background/95 fade-in-50 zoom-in-95 rounded-lg border p-3 text-xs shadow-lg backdrop-blur-md transition-all duration-150">
      {!hideLabel && displayLabel !== undefined && (
        <p className="border-border/40 text-foreground mb-1.5 border-b pb-1 font-semibold">
          {displayLabel}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry) => {
          const rawVal = Array.isArray(entry.value) ? entry.value[0] : entry.value;
          const val = typeof rawVal === "number" ? valueFormatter(rawVal) : String(rawVal ?? 0);
          const dotColor = entry.color || entry.stroke || entry.fill || "var(--primary)";
          const itemKey =
            typeof entry.dataKey === "function"
              ? String(entry.name)
              : String(entry.dataKey || entry.name);
          const itemName =
            entry.name || (typeof entry.dataKey !== "function" ? String(entry.dataKey) : "");

          return (
            <div key={itemKey} className="flex items-center justify-between gap-4 py-0.5">
              <div className="flex min-w-0 items-center gap-1.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: dotColor }}
                />
                <span className="text-muted-foreground max-w-[120px] truncate capitalize">
                  {itemName}
                </span>
              </div>
              <span className="text-foreground shrink-0 font-mono font-semibold">{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
