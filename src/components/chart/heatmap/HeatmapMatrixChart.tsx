import { memo, useState } from "react";

import { cn } from "@/lib/utils";

import type { HeatmapMatrixChartProps } from "./types";

import { useFormatter, useTranslations } from "next-intl";
import { type ComputedHeatmapCell, useHeatmapMatrix } from "./useHeatmapMatrix";

// SVG layout geometry constants
const LABEL_LEFT_WIDTH = 48;
const LABEL_TOP_HEIGHT = 24;
const CELL_GAP = 3;
const CELL_RADIUS = 3;
const VIEW_BOX_WIDTH = 800;
const LEGEND_STEP_RATIOS = [0.1, 0.3, 0.55, 0.8, 1] as const;

export const HeatmapMatrixChart = memo(function HeatmapMatrixChart({
  data,
  xKey,
  yKey,
  valueKey,
  xLabels,
  yLabels,
  height = 260,
  valueFormatter: customValueFormatter,
  colorTheme = "primary",
  legendTitle,
  showTooltip = true,
  showLegend = true,
  className,
}: HeatmapMatrixChartProps) {
  const format = useFormatter();
  const t = useTranslations("chart");
  const valueFormatter = customValueFormatter ?? ((val: number) => format.number(val));
  const resolvedLegendTitle = legendTitle ?? t("heatmap_legend_title");

  const [hoveredCell, setHoveredCell] = useState<{
    cell: ComputedHeatmapCell;
    x: number;
    y: number;
  } | null>(null);

  const {
    xLabels: computedXLabels,
    yLabels: computedYLabels,
    rows,
    min,
    max,
  } = useHeatmapMatrix({
    data,
    xKey,
    yKey,
    valueKey,
    xLabels,
    yLabels,
  });

  const themeColor =
    colorTheme === "chart-1" ? "var(--chart-1)" : colorTheme === "chart-2" ? "var(--chart-2)" : "var(--primary)";

  const numCols = computedXLabels.length || 1;
  const numRows = computedYLabels.length || 1;

  // ViewBox dimensions
  const availableWidth = VIEW_BOX_WIDTH - LABEL_LEFT_WIDTH - 10;
  const availableHeight = height - LABEL_TOP_HEIGHT - (showLegend ? 36 : 10);

  const cellWidth = Math.max(12, (availableWidth - (numCols - 1) * CELL_GAP) / numCols);
  const cellHeight = Math.max(12, (availableHeight - (numRows - 1) * CELL_GAP) / numRows);

  const actualSvgWidth = LABEL_LEFT_WIDTH + numCols * cellWidth + (numCols - 1) * CELL_GAP + 10;
  const actualSvgHeight = LABEL_TOP_HEIGHT + numRows * cellHeight + (numRows - 1) * CELL_GAP + (showLegend ? 36 : 10);

  return (
    <div className={cn("relative w-full overflow-hidden select-none", className)}>
      <svg
        viewBox={`0 0 ${actualSvgWidth} ${actualSvgHeight}`}
        className="h-auto max-h-[480px] w-full overflow-visible"
        role="img"
        aria-label={`Heatmap matrix showing ${legendTitle}`}
      >
        {/* X Axis Labels (Top) */}
        {computedXLabels.map((xVal, colIndex) => {
          // If many columns (e.g. 24 hours or 31 days), show every 2nd or 3rd label
          const shouldShow = numCols <= 12 || colIndex % Math.ceil(numCols / 12) === 0 || colIndex === numCols - 1;

          if (!shouldShow) return null;

          const xPos = LABEL_LEFT_WIDTH + colIndex * (cellWidth + CELL_GAP) + cellWidth / 2;
          return (
            <text
              key={`x-label-${xVal}-${colIndex}`}
              x={xPos}
              y={LABEL_TOP_HEIGHT - 8}
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[11px] tracking-tight"
            >
              {String(xVal)}
            </text>
          );
        })}

        {/* Y Axis Labels (Left) */}
        {rows.map((row, rowIndex) => {
          const yPos = LABEL_TOP_HEIGHT + rowIndex * (cellHeight + CELL_GAP) + cellHeight / 2 + 4;
          return (
            <text
              key={`y-label-${row.y}-${rowIndex}`}
              x={LABEL_LEFT_WIDTH - 8}
              y={yPos}
              textAnchor="end"
              className="fill-muted-foreground text-[11px] font-medium"
            >
              {row.y}
            </text>
          );
        })}

        {/* Matrix Cells */}
        {rows.map((row, rowIndex) =>
          row.cells.map((cell, colIndex) => {
            const xPos = LABEL_LEFT_WIDTH + colIndex * (cellWidth + CELL_GAP);
            const yPos = LABEL_TOP_HEIGHT + rowIndex * (cellHeight + CELL_GAP);

            const isZero = cell.value === 0;
            const opacity = isZero ? 0.08 : 0.2 + cell.ratio * 0.8;
            const isHovered = hoveredCell?.cell.x === cell.x && hoveredCell?.cell.y === cell.y;

            return (
              <g key={`cell-${cell.x}-${cell.y}`}>
                <rect
                  x={xPos}
                  y={yPos}
                  width={cellWidth}
                  height={cellHeight}
                  rx={CELL_RADIUS}
                  fill={themeColor}
                  opacity={opacity}
                  stroke={isHovered ? "var(--foreground)" : "transparent"}
                  strokeWidth={isHovered ? 1.5 : 0}
                  className="cursor-pointer transition-all duration-150 hover:brightness-110"
                  onMouseEnter={(e) => {
                    if (!showTooltip) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredCell({
                      cell,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => setHoveredCell(null)}
                />
              </g>
            );
          }),
        )}

        {/* Bottom Legend */}
        {showLegend && (
          <g transform={`translate(${LABEL_LEFT_WIDTH}, ${actualSvgHeight - 20})`}>
            <text x={0} y={9} className="fill-muted-foreground text-[10px] font-medium">
              {resolvedLegendTitle}: {t("legend_low")} ({valueFormatter(min)})
            </text>
            {LEGEND_STEP_RATIOS.map((stepRatio, idx) => (
              <rect
                key={`legend-step-${idx}`}
                x={95 + idx * 16}
                y={0}
                width={12}
                height={12}
                rx={2}
                fill={themeColor}
                opacity={stepRatio === 0.1 ? 0.1 : stepRatio}
              />
            ))}
            <text x={95 + 5 * 16 + 8} y={9} className="fill-muted-foreground text-[10px] font-medium">
              {t("legend_high")} ({valueFormatter(max)})
            </text>
          </g>
        )}
      </svg>

      {/* Floating Tooltip */}
      {hoveredCell && showTooltip && (
        <div
          className="border-border/50 bg-background/95 pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-lg border px-3 py-2 text-xs shadow-xl backdrop-blur-md transition-opacity duration-150"
          style={{
            left: hoveredCell.x,
            top: hoveredCell.y,
          }}
        >
          <div className="text-foreground flex items-center gap-2 font-medium">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: themeColor }} />
            <span>
              {hoveredCell.cell.y} · {String(hoveredCell.cell.x)}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-muted-foreground">{legendTitle}:</span>
            <span className="text-foreground font-semibold tabular-nums">{valueFormatter(hoveredCell.cell.value)}</span>
          </div>
        </div>
      )}
    </div>
  );
});
