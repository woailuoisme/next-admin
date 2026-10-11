import { memo } from "react";

import { cn } from "@/lib/utils";

import type { RadialGaugeChartProps } from "./types";

import { useRadialGauge } from "./useRadialGauge";

export const RadialGaugeChart = memo(function RadialGaugeChart(props: RadialGaugeChartProps) {
  const {
    min = 0,
    max = 100,
    label = "达成率",
    unit = "%",
    formattedValue,
    subtext,
    height = 240,
    className,
  } = props;

  const {
    clampedValue,
    activeColor,
    size,
    isCompact,
    strokeWidth,
    radius,
    circumference,
    arcLength,
    strokeDashoffset,
  } = useRadialGauge(props);

  return (
    <div
      className={cn("relative flex flex-col items-center justify-center select-none", className)}
      style={{ width: "100%", height }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-[210deg] transform overflow-visible"
        aria-hidden="true"
      >
        {/* Background track arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="color-mix(in oklab, var(--muted) 70%, transparent)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />

        {/* Foreground colored value arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={activeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center text overlay positioned at the optical center of the open arc */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
        style={{
          transform: `translateY(-${Math.max(2, Math.round(radius * 0.1))}px)`,
        }}
      >
        <span
          className={cn(
            "max-w-[85%] truncate font-medium text-muted-foreground",
            isCompact ? "text-[11px]" : "text-xs",
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "my-0.5 font-mono font-extrabold tracking-tight text-foreground",
            isCompact ? "text-2xl" : "text-3xl",
          )}
        >
          {formattedValue ? (
            formattedValue
          ) : (
            <>
              <span>{clampedValue}</span>
              {unit && (
                <span className={cn("ml-0.5 font-normal", isCompact ? "text-sm" : "text-xl")}>{unit}</span>
              )}
            </>
          )}
        </span>
        {subtext && (
          <span
            className={cn(
              "truncate text-muted-foreground/80",
              isCompact ? "max-w-[110px] text-[10px]" : "max-w-[140px] text-[11px]",
            )}
          >
            {subtext}
          </span>
        )}
      </div>

      {/* Scale boundary labels positioned snugly right beneath the arc endpoints */}
      <div
        className="text-muted-foreground pointer-events-none absolute flex items-center justify-between font-mono text-[10px]"
        style={{
          width: `${Math.round(radius * 1.75)}px`,
          top: `${Math.round(size / 2 + radius * 0.5 + strokeWidth / 2 + 2)}px`,
        }}
        aria-hidden="true"
      >
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
});
