"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { memo } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

import type { StatCardTrendProps } from "./types";

import { resolveTrendInfo } from "../shared/trendEngine";

export const StatCardTrend = memo(function StatCardTrend({
  trend,
  value,
  direction,
  tone,
  label,
  isPositiveGood,
  variant = "badge",
  showLabel = true,
  className,
  ...props
}: StatCardTrendProps) {
  const t = useTranslations("stats");
  const format = useFormatter();

  const trendConfig = trend ?? (value !== undefined ? { value, direction, tone, label, isPositiveGood } : null);
  const trendInfo = resolveTrendInfo(trendConfig);

  if (!trendInfo) return null;

  const normalizedNumericValue =
    typeof trendInfo.displayValue === "number" && Number.isFinite(trendInfo.displayValue)
      ? trendInfo.dir === "down" && trendInfo.displayValue > 0
        ? -trendInfo.displayValue
        : trendInfo.displayValue
      : null;

  const formattedDisplay =
    typeof trendInfo.displayValue === "number"
      ? normalizedNumericValue !== null
        ? format.number(normalizedNumericValue, { signDisplay: "exceptZero" })
        : "--"
      : trendInfo.displayValue;

  const srDescription =
    trendInfo.dir === "neutral" ? t("trend_neutral") : t(trendInfo.srKey, { value: String(formattedDisplay) });

  const dirIcon =
    trendInfo.dir === "up" ? (
      <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
    ) : trendInfo.dir === "down" ? (
      <ArrowDownRight className="size-3.5 shrink-0" aria-hidden="true" />
    ) : (
      <Minus className="size-3.5 shrink-0" aria-hidden="true" />
    );

  if (variant === "inline") {
    return (
      <div className={cn("inline-flex min-w-0 items-center gap-1", className)} {...props}>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-0.5 font-mono text-[10px] font-medium tabular-nums",
            trendInfo.inlineColorClass,
          )}
        >
          {dirIcon}
          <span>{formattedDisplay}</span>
          <span className="sr-only">{srDescription}</span>
        </span>
        {showLabel && trendInfo.label ? (
          <span className="text-muted-foreground truncate text-[10px]" title={trendInfo.label}>
            {trendInfo.label}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-1.5", className)} {...props}>
      <Badge
        variant="outline"
        className={cn(
          "inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] leading-tight font-medium tabular-nums",
          trendInfo.colorClass,
        )}
      >
        {dirIcon}
        <span>{formattedDisplay}</span>
        <span className="sr-only">{srDescription}</span>
      </Badge>
      {showLabel && trendInfo.label ? (
        <span className="text-muted-foreground truncate text-[11px]" title={trendInfo.label}>
          {trendInfo.label}
        </span>
      ) : null}
    </div>
  );
});
