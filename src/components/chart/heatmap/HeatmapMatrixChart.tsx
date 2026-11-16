"use client";

import { type KeyboardEvent, memo, useCallback, useRef, useState } from "react";

import { cn } from "cn";

import type { HeatmapMatrixChartProps } from "./types";

import { useTranslations } from "next-intl";
import { useChartFormatters } from "../hooks/useChartFormatters";
import { useChartHeight } from "../shared/ChartContext";
import { ChartTooltipSurface } from "../shared/ChartTooltip";
import { resolveNumericChartHeight } from "../shared/formatters";
import { getChartTheme } from "../shared/theme";
import { type ComputedHeatmapCell, useHeatmapMatrix } from "./useHeatmapMatrix";

// SVG layout geometry constants
const LABEL_LEFT_WIDTH = 48;
const Y_AXIS_TITLE_OFFSET = 18;
const LABEL_TOP_HEIGHT = 24;
const X_AXIS_TITLE_OFFSET = 16;
const CELL_GAP = 3;
const CELL_RADIUS = 3;
const VIEW_BOX_WIDTH = 800;
const LEGEND_STEP_RATIOS = [0.1, 0.3, 0.55, 0.8, 1] as const;

interface HeatmapCellNodeProps {
  cell: ComputedHeatmapCell;
  rowIndex: number;
  colIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
  isHovered: boolean;
  isFocusable: boolean;
  ariaLabel: string;
  onHover: (cell: ComputedHeatmapCell, target: SVGRectElement) => void;
  onFocusCell: (cell: ComputedHeatmapCell, rowIndex: number, colIndex: number, target: SVGRectElement) => void;
  onDeactivate: () => void;
  onKeyNavigate: (e: KeyboardEvent<SVGRectElement>, rowIndex: number, colIndex: number) => void;
}

const HeatmapCellNode = memo(function HeatmapCellNode({
  cell,
  rowIndex,
  colIndex,
  x,
  y,
  width,
  height,
  fill,
  opacity,
  isHovered,
  isFocusable,
  ariaLabel,
  onHover,
  onFocusCell,
  onDeactivate,
  onKeyNavigate,
}: HeatmapCellNodeProps) {
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={CELL_RADIUS}
      fill={fill}
      opacity={opacity}
      stroke={isHovered ? "var(--foreground)" : "transparent"}
      strokeWidth={isHovered ? 1.5 : 0}
      tabIndex={isFocusable ? 0 : -1}
      role="gridcell"
      aria-label={ariaLabel}
      data-row={rowIndex}
      data-col={colIndex}
      className="focus-visible:stroke-foreground cursor-pointer transition-all duration-150 outline-none hover:brightness-110"
      onMouseEnter={(e) => onHover(cell, e.currentTarget)}
      onMouseLeave={onDeactivate}
      onFocus={(e) => onFocusCell(cell, rowIndex, colIndex, e.currentTarget)}
      onBlur={onDeactivate}
      onKeyDown={(e) => onKeyNavigate(e, rowIndex, colIndex)}
    />
  );
});

export const HeatmapMatrixChart = memo(function HeatmapMatrixChart({
  data,
  xKey,
  yKey,
  valueKey,
  xLabels,
  yLabels,
  xLabel,
  yLabel,
  height,
  valueFormatter: customValueFormatter,
  colorTheme = "primary",
  legendTitle,
  showTooltip = true,
  showLegend = true,
  className,
}: HeatmapMatrixChartProps) {
  const t = useTranslations("chart");
  const resolvedHeight = useChartHeight(height, 260);
  const numericHeight = resolveNumericChartHeight(resolvedHeight, 260);
  const { valueFormatter } = useChartFormatters({ valueFormatter: customValueFormatter });
  const resolvedLegendTitle = legendTitle ?? t("heatmap_legend_title");

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [activeCoord, setActiveCoord] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [hoveredCell, setHoveredCell] = useState<{
    cell: ComputedHeatmapCell;
    x: number;
    y: number;
  } | null>(null);

  const handleCellActivate = useCallback(
    (cell: ComputedHeatmapCell, target: SVGRectElement) => {
      if (!showTooltip) return;
      const containerRect = containerRef.current?.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      setHoveredCell({
        cell,
        x: rect.left - (containerRect?.left ?? 0) + rect.width / 2,
        y: rect.top - (containerRect?.top ?? 0),
      });
    },
    [showTooltip],
  );

  const handleCellFocus = useCallback(
    (cell: ComputedHeatmapCell, rowIndex: number, colIndex: number, target: SVGRectElement) => {
      setActiveCoord({ row: rowIndex, col: colIndex });
      handleCellActivate(cell, target);
    },
    [handleCellActivate],
  );

  const handleCellDeactivate = useCallback(() => {
    setHoveredCell(null);
  }, []);

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

  const themeColor = getChartTheme(colorTheme).fillColor;

  const maxYLabelLen = computedYLabels.reduce((acc, label) => Math.max(acc, String(label).length), 0);
  const computedLabelLeftWidth = Math.min(120, Math.max(LABEL_LEFT_WIDTH, maxYLabelLen * 7 + 12));
  const leftInset = computedLabelLeftWidth + (yLabel ? Y_AXIS_TITLE_OFFSET : 0);
  const topInset = LABEL_TOP_HEIGHT + (xLabel ? X_AXIS_TITLE_OFFSET : 0);

  const numCols = computedXLabels.length || 1;
  const numRows = computedYLabels.length || 1;
  const clampedActiveRow = rows.length > 0 ? Math.min(activeCoord.row, rows.length - 1) : 0;
  const clampedActiveCol = numCols > 0 ? Math.min(activeCoord.col, numCols - 1) : 0;

  const handleCellKeyDown = useCallback(
    (e: KeyboardEvent<SVGRectElement>, rowIndex: number, colIndex: number) => {
      if (e.key === "Escape") {
        setHoveredCell(null);
        return;
      }

      let nextRow = rowIndex;
      let nextCol = colIndex;

      switch (e.key) {
        case "ArrowRight":
          nextCol = Math.min(numCols - 1, colIndex + 1);
          break;
        case "ArrowLeft":
          nextCol = Math.max(0, colIndex - 1);
          break;
        case "ArrowDown":
          nextRow = Math.min(rows.length - 1, rowIndex + 1);
          break;
        case "ArrowUp":
          nextRow = Math.max(0, rowIndex - 1);
          break;
        case "Home":
          nextCol = 0;
          break;
        case "End":
          nextCol = Math.max(0, numCols - 1);
          break;
        default:
          return;
      }

      e.preventDefault();
      if (nextRow !== rowIndex || nextCol !== colIndex) {
        setActiveCoord({ row: nextRow, col: nextCol });
        const nextTarget = svgRef.current?.querySelector<SVGRectElement>(
          `[data-row="${nextRow}"][data-col="${nextCol}"]`,
        );
        nextTarget?.focus();
      }
    },
    [numCols, rows.length],
  );

  // ViewBox dimensions
  const availableWidth = VIEW_BOX_WIDTH - leftInset - 10;
  const availableHeight = numericHeight - topInset - 10;

  const cellWidth = Math.max(12, (availableWidth - (numCols - 1) * CELL_GAP) / numCols);
  const cellHeight = Math.max(12, (availableHeight - (numRows - 1) * CELL_GAP) / numRows);

  const actualSvgWidth = leftInset + numCols * cellWidth + (numCols - 1) * CELL_GAP + 10;
  const actualSvgHeight = topInset + numRows * cellHeight + (numRows - 1) * CELL_GAP + 10;

  return (
    <div ref={containerRef} className={cn("relative w-full select-none", className)}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${actualSvgWidth} ${actualSvgHeight}`}
        className="h-auto w-full overflow-visible"
        style={{ maxHeight: resolvedHeight }}
        role="grid"
        aria-label={t("heatmap_aria_label", { title: resolvedLegendTitle })}
      >
        {xLabel ? (
          <text
            x={leftInset + (numCols * cellWidth + (numCols - 1) * CELL_GAP) / 2}
            y={12}
            textAnchor="middle"
            aria-hidden="true"
            className="fill-muted-foreground text-[11px] font-medium"
          >
            {xLabel}
          </text>
        ) : null}

        {yLabel ? (
          <text
            x={12}
            y={topInset + (numRows * cellHeight + (numRows - 1) * CELL_GAP) / 2}
            textAnchor="middle"
            transform={`rotate(-90 12 ${topInset + (numRows * cellHeight + (numRows - 1) * CELL_GAP) / 2})`}
            aria-hidden="true"
            className="fill-muted-foreground text-[11px] font-medium"
          >
            {yLabel}
          </text>
        ) : null}

        {/* X Axis Labels (Top) */}
        {computedXLabels.map((xVal, colIndex) => {
          // If many columns (e.g. 24 hours or 31 days), show every 2nd or 3rd label
          const shouldShow = numCols <= 12 || colIndex % Math.ceil(numCols / 12) === 0 || colIndex === numCols - 1;

          if (!shouldShow) return null;

          const xPos = leftInset + colIndex * (cellWidth + CELL_GAP) + cellWidth / 2;
          return (
            <text
              key={`x-label-${xVal}-${colIndex}`}
              x={xPos}
              y={topInset - 8}
              textAnchor="middle"
              aria-hidden="true"
              className="fill-muted-foreground font-mono text-[11px] tracking-tight"
            >
              {String(xVal)}
            </text>
          );
        })}

        {/* Y Axis Labels (Left) */}
        {rows.map((row, rowIndex) => {
          const yPos = topInset + rowIndex * (cellHeight + CELL_GAP) + cellHeight / 2 + 4;
          return (
            <text
              key={`y-label-${row.y}-${rowIndex}`}
              x={leftInset - 8}
              y={yPos}
              textAnchor="end"
              aria-hidden="true"
              className="fill-muted-foreground text-[11px] font-medium"
            >
              {row.y}
            </text>
          );
        })}

        {/* Matrix Cells */}
        {rows.map((row, rowIndex) => (
          <g key={`row-${row.y}-${rowIndex}`} role="row">
            {row.cells.map((cell, colIndex) => {
              const xPos = leftInset + colIndex * (cellWidth + CELL_GAP);
              const yPos = topInset + rowIndex * (cellHeight + CELL_GAP);

              const isZero = cell.value === 0;
              const opacity = isZero ? 0.08 : 0.2 + cell.ratio * 0.8;
              const isHovered = hoveredCell?.cell.x === cell.x && hoveredCell?.cell.y === cell.y;
              const isFocusable = rowIndex === clampedActiveRow && colIndex === clampedActiveCol;

              return (
                <HeatmapCellNode
                  key={`cell-${cell.x}-${cell.y}`}
                  cell={cell}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  x={xPos}
                  y={yPos}
                  width={cellWidth}
                  height={cellHeight}
                  fill={themeColor}
                  opacity={opacity}
                  isHovered={isHovered}
                  isFocusable={isFocusable}
                  ariaLabel={`${cell.y} ${String(cell.x)}: ${valueFormatter(cell.value)}`}
                  onHover={handleCellActivate}
                  onFocusCell={handleCellFocus}
                  onDeactivate={handleCellDeactivate}
                  onKeyNavigate={handleCellKeyDown}
                />
              );
            })}
          </g>
        ))}
      </svg>

      {/* Bottom Legend (Flexbox prevents label/swatch overlap at any text length) */}
      {showLegend ? (
        <div className="text-muted-foreground mt-2 flex flex-wrap items-center justify-end gap-2 px-1 text-[11px] font-medium">
          <span>
            {resolvedLegendTitle}: {t("legend_low")} ({valueFormatter(min)})
          </span>
          <div className="flex items-center gap-1" aria-hidden="true">
            {LEGEND_STEP_RATIOS.map((stepRatio) => (
              <span
                key={`legend-step-${stepRatio}`}
                className="inline-block size-3 rounded-[2px]"
                style={{ backgroundColor: themeColor, opacity: stepRatio }}
              />
            ))}
          </div>
          <span>
            {t("legend_high")} ({valueFormatter(max)})
          </span>
        </div>
      ) : null}

      {/* Floating Tooltip */}
      {hoveredCell && showTooltip ? (
        <ChartTooltipSurface
          title={`${hoveredCell.cell.y} · ${String(hoveredCell.cell.x)}`}
          color={themeColor}
          className="pointer-events-none absolute z-50 -translate-x-1/2 -translate-y-[calc(100%+8px)]"
          style={{
            left: hoveredCell.x,
            top: hoveredCell.y,
          }}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-muted-foreground">{resolvedLegendTitle}:</span>
            <span className="text-foreground font-semibold tabular-nums">{valueFormatter(hoveredCell.cell.value)}</span>
          </div>
        </ChartTooltipSurface>
      ) : null}
    </div>
  );
});
