import { isNil } from "es-toolkit";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { useFormatter } from "next-intl";
import { memo } from "react";

import { cn } from "@/lib/utils";

import type { NumberCellProps } from "./types";

import { AVATAR_ALIGN_CLASSES, TEXT_ALIGN_CLASSES } from "../base";

type NumberFormatter = ReturnType<typeof useFormatter>;

function formatValue(
  format: NumberFormatter,
  value: number,
  mode: "number" | "currency" | "percent",
  precision: number,
  compact: boolean,
  accounting: boolean,
  currencyCode?: string,
): string {
  const isNegative = value < 0;
  const absValue = accounting && isNegative ? Math.abs(value) : value;
  const notation = compact ? "compact" : "standard";

  let formatted: string;
  if (currencyCode) {
    formatted = format.number(absValue, {
      style: "currency",
      currency: currencyCode,
      notation,
      minimumFractionDigits: compact ? 0 : precision,
      maximumFractionDigits: precision,
    });
  } else if (compact) {
    formatted = format.number(absValue, { notation, maximumFractionDigits: precision });
  } else if (mode === "currency" || mode === "percent") {
    const numStr = format.number(absValue, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
    formatted = mode === "percent" ? `${numStr}%` : numStr;
  } else {
    formatted = format.number(absValue, { maximumFractionDigits: precision });
  }

  return accounting && isNegative ? `(${formatted})` : formatted;
}

type TrendDirection = "increase" | "decrease" | "neutral";

/** 趋势方向 → 文本配色（业务状态色统一收敛于此表） */
const TREND_TEXT_CLASSES: Record<TrendDirection, string> = {
  increase: "text-emerald-600 dark:text-emerald-400",
  decrease: "text-rose-600 dark:text-rose-400",
  neutral: "text-muted-foreground",
};

/** 趋势箭头 → 图标配色 */
const TREND_ICON_CLASSES: Record<"up" | "down", string> = {
  up: "text-emerald-500",
  down: "text-rose-500",
};

function getTrendColor(trend: boolean, isPositive: boolean, isNegative: boolean): string {
  if (!trend) return "text-foreground";
  if (isPositive) return TREND_TEXT_CLASSES.increase;
  if (isNegative) return TREND_TEXT_CLASSES.decrease;
  return TREND_TEXT_CLASSES.neutral;
}

function resolveDeltaType(
  delta: number | string | undefined | null,
  deltaType: "auto" | "increase" | "decrease" | "neutral",
): TrendDirection {
  if (delta === undefined || delta === null) return "neutral";
  if (deltaType !== "auto") return deltaType;
  if (typeof delta === "number") {
    return delta > 0 ? "increase" : delta < 0 ? "decrease" : "neutral";
  }
  const str = String(delta).trim();
  if (str.startsWith("+")) return "increase";
  if (str.startsWith("-")) return "decrease";
  return "neutral";
}

export const NumberCell = memo(function NumberCell({
  value,
  mode = "number",
  currency = "$",
  currencyCode,
  precision = 2,
  compact = false,
  accounting = false,
  prefix,
  suffix,
  trend = false,
  delta,
  deltaType = "auto",
  deltaDescription,
  deltaPrefix,
  align = "right",
  className,
}: NumberCellProps) {
  const format = useFormatter();

  if (isNil(value) || Number.isNaN(value)) {
    return <span className="text-muted-foreground/40 text-xs italic">-</span>;
  }

  const isPositive = value > 0;
  const isNegative = value < 0;
  const formattedNumber = formatValue(format, value, mode, precision, compact, accounting, currencyCode);
  const trendColor = getTrendColor(trend, isPositive, isNegative);
  const resolvedDeltaType = resolveDeltaType(delta, deltaType);

  const numberRow = (
    <div
      className={cn(
        "flex items-center gap-1 font-mono text-xs tracking-tight tabular-nums",
        TEXT_ALIGN_CLASSES[align],
        trendColor,
      )}
    >
      {trend && isPositive && <ArrowUpRight className={`size-3.5 shrink-0 stroke-[2.5] ${TREND_ICON_CLASSES.up}`} />}
      {trend && isNegative && (
        <ArrowDownRight className={`size-3.5 shrink-0 stroke-[2.5] ${TREND_ICON_CLASSES.down}`} />
      )}

      {!currencyCode && mode === "currency" && (
        <span className="text-muted-foreground/70 shrink-0 font-sans text-[11px]">{currency}</span>
      )}

      {prefix && <span className="text-muted-foreground/80 shrink-0">{prefix}</span>}

      <span>{formattedNumber}</span>

      {suffix && <span className="text-muted-foreground/80 shrink-0 font-sans text-[11px]">{suffix}</span>}
    </div>
  );

  if (delta !== undefined && delta !== null) {
    const resolvedDeltaPrefix =
      deltaPrefix !== undefined ? deltaPrefix : typeof delta === "number" && delta > 0 ? "+" : "";
    const deltaText = typeof delta === "number" ? `${resolvedDeltaPrefix}${delta}%` : `${resolvedDeltaPrefix}${delta}`;

    return (
      <div className={cn("flex flex-col", AVATAR_ALIGN_CLASSES[align], className)}>
        {numberRow}
        <div
          className={cn(
            "mt-0.5 flex items-center gap-0.5 font-mono text-[10px] leading-none font-medium tracking-tight",
            TREND_TEXT_CLASSES[resolvedDeltaType],
          )}
        >
          {resolvedDeltaType === "increase" && <ArrowUpRight className="size-3 shrink-0 stroke-[2.5]" />}
          {resolvedDeltaType === "decrease" && <ArrowDownRight className="size-3 shrink-0 stroke-[2.5]" />}
          {resolvedDeltaType === "neutral" && <Minus className="size-2.5 shrink-0 stroke-[2]" />}
          <span>{deltaText}</span>
          {deltaDescription && (
            <span className="text-muted-foreground/70 ml-0.5 font-sans font-normal">{deltaDescription}</span>
          )}
        </div>
      </div>
    );
  }

  return <div className={className}>{numberRow}</div>;
});
