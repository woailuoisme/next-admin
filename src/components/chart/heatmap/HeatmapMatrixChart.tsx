import { memo, useState } from "react";

import { cn } from "@/lib/utils";

import type { HeatmapMatrixChartProps } from "./types";

import { formatNumber } from "../shared/formatters";
import { type ComputedHeatmapCell, useHeatmapMatrix } from "./useHeatmapMatrix";

export const HeatmapMatrixChart = memo(function HeatmapMatrixChart({
  data,
  xKey,
  yKey,
  valueKey,
  xLabels,
  yLabels,
  height = 260,
  valueFormatter = (val: number) => formatNumber(val),
  colorTheme = "primary",
  legendTitle = "活跃度",
  showTooltip = true,
  showLegend = true,
  className,
}: HeatmapMatrixChartProps) {
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
    colorTheme === "chart-1"
      ? "var(--chart-1)"
      : colorTheme === "chart-2"
        ? "var(--chart-2)"
        : "var(--primary)";

  // SVG layout geometry
  const labelLeftWidth = 48;
  const labelTopHeight = 24;
  const gap = 3;
  const cellRadius = 3;

  const numCols = computedXLabels.length || 1;
  const numRows = computedYLabels.length || 1;

  // ViewBox dimensions
  const viewBoxWidth = 800;
  const availableWidth = viewBoxWidth - labelLeftWidth - 10;
  const availableHeight = height - labelTopHeight - (showLegend ? 36 : 10);

  const cellWidth = Math.max(12, (availableWidth - (numCols - 1) * gap) / numCols);
  const cellHeight = Math.max(12, (availableHeight - (numRows - 1) * gap) / numRows);

  const actualSvgWidth = labelLeftWidth + numCols * cellWidth + (numCols - 1) * gap + 10;
  const actualSvgHeight =
    labelTopHeight + numRows * cellHeight + (numRows - 1) * gap + (showLegend ? 36 : 10);

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
          const shouldShow =
            numCols <= 12 || colIndex % Math.ceil(numCols / 12) === 0 || colIndex === numCols - 1;

          if (!shouldShow) return null;

          const xPos = labelLeftWidth + colIndex * (cellWidth + gap) + cellWidth / 2;
          return (
            <text
              key={`x-label-${xVal}-${colIndex}`}
              x={xPos}
              y={labelTopHeight - 8}
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[11px] tracking-tight"
            >
              {String(xVal)}
            </text>
          );
        })}

        {/* Y Axis Labels (Left) */}
        {rows.map((row, rowIndex) => {
          const yPos = labelTopHeight + rowIndex * (cellHeight + gap) + cellHeight / 2 + 4;
          return (
            <text
              key={`y-label-${row.y}-${rowIndex}`}
              x={labelLeftWidth - 8}
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
            const xPos = labelLeftWidth + colIndex * (cellWidth + gap);
            const yPos = labelTopHeight + rowIndex * (cellHeight + gap);

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
                  rx={cellRadius}
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
          <g transform={`translate(${labelLeftWidth}, ${actualSvgHeight - 20})`}>
            <text x={0} y={9} className="fill-muted-foreground text-[10px] font-medium">
              {legendTitle}: 低 ({formatNumber(min)})
            </text>
            {[0.1, 0.3, 0.55, 0.8, 1].map((stepRatio, idx) => (
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
            <text
              x={95 + 5 * 16 + 8}
              y={9}
              className="fill-muted-foreground text-[10px] font-medium"
            >
              高 ({formatNumber(max)})
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
            <span className="text-foreground font-semibold tabular-nums">
              {valueFormatter(hoveredCell.cell.value)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});
