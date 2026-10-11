import { memo, useId, useState } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { SparklineCellProps } from "./types";

import { JUSTIFY_ALIGN_CLASSES } from "../base";

function renderSparklineTooltip(
  hoveredIndex: number | null,
  data: number[],
  min: number,
  max: number,
  isUp: boolean,
  customTooltip?: React.ReactNode,
) {
  if (hoveredIndex !== null) {
    return (
      <div className="font-mono text-[11px]">
        <span>点位 #{hoveredIndex + 1}: </span>
        <span className="font-semibold">{data[hoveredIndex]}</span>
      </div>
    );
  }
  if (customTooltip) return customTooltip;
  return (
    <div className="space-y-0.5 font-mono text-[11px]">
      <p>
        最新: <span className="font-semibold">{data[data.length - 1]}</span>
      </p>
      <p className="text-muted-foreground">
        区间: {min} - {max} ({isUp ? "↑ 涨" : "↓ 跌"})
      </p>
    </div>
  );
}

export const SparklineCell = memo(function SparklineCell({
  data,
  variant = "line",
  width = 96,
  height = 24,
  strokeWidth = 1.5,
  barWidth = 4,
  barGap = 2,
  color,
  showFill = true,
  showEndpoint = true,
  interactive = false,
  tooltip,
  align = "left",
  className,
}: SparklineCellProps) {
  const gradientId = useId();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length < 2) {
    return <span className="text-muted-foreground/40 text-xs italic">-</span>;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const paddingY = 3;
  const effectiveHeight = height - paddingY * 2;

  const isUp = data[data.length - 1] >= data[0];
  const autoColorClass = isUp ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400";

  const resolvedColorClass = color ? "" : autoColorClass;
  const isTooltipOpen = interactive ? hoveredIndex !== null : undefined;

  // 处理鼠标移动交互
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    if (variant === "bar") {
      const totalBarWidth = barWidth + barGap;
      const idx = Math.floor(mouseX / totalBarWidth);
      if (idx >= 0 && idx < data.length) {
        setHoveredIndex(idx);
      }
    } else {
      const ratio = Math.max(0, Math.min(1, (mouseX - 2) / (width - 4)));
      const idx = Math.round(ratio * (data.length - 1));
      if (idx >= 0 && idx < data.length) {
        setHoveredIndex(idx);
      }
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoveredIndex(null);
    }
  };

  // 1. 微型柱状图 (variant="bar")
  if (variant === "bar") {
    const totalNeededWidth = data.length * (barWidth + barGap) - barGap;
    const actualWidth = Math.max(width, totalNeededWidth);

    const barSvg = (
      <div
        className={cn("flex items-center", JUSTIFY_ALIGN_CLASSES[align], resolvedColorClass, className)}
        data-testid="sparkline-bar-cell"
      >
        <svg
          width={actualWidth}
          height={height}
          viewBox={`0 0 ${actualWidth} ${height}`}
          className="overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          aria-hidden="true"
        >
          {data.map((val, idx) => {
            const barHeight = Math.max(2, ((val - min) / range) * effectiveHeight);
            const x = idx * (barWidth + barGap);
            const y = height - paddingY - barHeight;
            const isHovered = hoveredIndex === idx;

            return (
              <rect
                key={idx}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={1}
                fill={color || "currentColor"}
                className={cn(
                  "transition-opacity",
                  interactive && hoveredIndex !== null && !isHovered
                    ? "opacity-35"
                    : isHovered
                      ? "opacity-100 ring-1 ring-foreground"
                      : "opacity-80",
                )}
              />
            );
          })}
        </svg>
      </div>
    );

    return (
      <Tooltip open={isTooltipOpen}>
        <TooltipTrigger asChild>
          <div className="inline-flex max-w-full cursor-default">{barSvg}</div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {renderSparklineTooltip(hoveredIndex, data, min, max, isUp, tooltip)}
        </TooltipContent>
      </Tooltip>
    );
  }

  // 2. 微型折线/面积图 (variant="line")
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 4) + 2;
    const y = height - paddingY - ((val - min) / range) * effectiveHeight;
    return { x, y };
  });

  const linePath = `M ${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ")}`;
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const fillPath = `${linePath} L ${lastPoint.x.toFixed(1)},${height} L ${firstPoint.x.toFixed(1)},${height} Z`;

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  const svgElement = (
    <div
      className={cn("flex items-center", JUSTIFY_ALIGN_CLASSES[align], resolvedColorClass, className)}
      data-testid="sparkline-cell"
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color || "currentColor"} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color || "currentColor"} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {showFill && <path d={fillPath} fill={`url(#${gradientId})`} />}

        <path
          d={linePath}
          fill="none"
          stroke={color || "currentColor"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {showEndpoint && hoveredIndex === null && (
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={2}
            fill={color || "currentColor"}
            className="animate-pulse"
          />
        )}

        {/* 交互模式十字十字游标与浮动点 */}
        {hoveredPoint && (
          <>
            <line
              x1={hoveredPoint.x}
              y1={0}
              x2={hoveredPoint.x}
              y2={height}
              stroke="currentColor"
              strokeWidth={1}
              strokeDasharray="2 2"
              className="opacity-50"
            />
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r={3}
              fill={color || "currentColor"}
              className="stroke-background stroke-2"
            />
          </>
        )}
      </svg>
    </div>
  );

  return (
    <Tooltip open={isTooltipOpen}>
      <TooltipTrigger asChild>
        <div className="inline-flex max-w-full cursor-default">{svgElement}</div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {renderSparklineTooltip(hoveredIndex, data, min, max, isUp, tooltip)}
      </TooltipContent>
    </Tooltip>
  );
});
