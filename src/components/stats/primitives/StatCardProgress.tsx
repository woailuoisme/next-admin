"use client";

import { useFormatter, useTranslations } from "next-intl";
import { memo } from "react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "cn";

import type { PacingStatus } from "../progress-card/types";
import type { StatCardTheme } from "../shared/types";
import type { StatCardTrendData } from "../stat-card/types";

import { computeProgressStat, type ProgressStatResult } from "../progress-card/useProgressStat";
import { getStatTheme } from "../shared/theme";
import { useStatCardContext } from "./StatCardContext";
import { StatCardTrend } from "./StatCardTrend";

/** 进度节奏状态的静态国际化 Key 映射 */
const PACING_LABEL_KEYS: Record<PacingStatus, "pacing_ahead" | "pacing_on_track" | "pacing_behind"> = {
  ahead: "pacing_ahead",
  on_track: "pacing_on_track",
  behind: "pacing_behind",
};

export interface StatCardProgressProps {
  value?: number | string;
  targetValue?: number | string;
  progress?: number;
  pacingStatus?: PacingStatus;
  pacingLabel?: string;
  progressResult?: ProgressStatResult;
  prefix?: string;
  suffix?: string;
  trend?: StatCardTrendData;
  theme?: StatCardTheme;
  ariaLabel?: string;

  className?: string;
}

export const StatCardProgress = memo(function StatCardProgress({
  value = 0,
  targetValue,
  progress,
  pacingStatus,
  pacingLabel,
  progressResult,
  prefix,
  suffix,
  trend,
  theme,
  ariaLabel,
  className,
}: StatCardProgressProps) {
  const context = useStatCardContext();
  const t = useTranslations("stats");
  const format = useFormatter();
  const resolvedTheme = theme ?? context.theme ?? "primary";
  const themeConfig = getStatTheme(resolvedTheme);

  const { calculatedProgress, pacingInfo } =
    progressResult ??
    computeProgressStat({
      value,
      targetValue,
      progress,
      pacingStatus,
      pacingLabel,
    });

  const targetDisplay =
    typeof targetValue === "number" ? (Number.isFinite(targetValue) ? format.number(targetValue) : "0") : targetValue;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Track & Filled Bar via Shadcn Progress primitive */}
      <Progress
        value={calculatedProgress}
        aria-label={ariaLabel || t("target_label").replace(/:\s*$/, "")}
        aria-valuenow={calculatedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${calculatedProgress}%`}
        className={cn("h-2 w-full", themeConfig.progressIndicator)}
      />

      {/* Status row: Target Value + Pacing / Trend Info */}
      <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
        <div className="tabular-nums">
          {targetValue !== undefined ? (
            <span>
              {t("target_label")}
              {prefix || ""}
              {targetDisplay}
              {suffix || ""}
            </span>
          ) : null}
        </div>

        {pacingInfo ? (
          <Badge
            variant="outline"
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
              pacingInfo.colorClass,
            )}
          >
            <pacingInfo.PacingIcon className="size-3.5" aria-hidden="true" />
            <span>{pacingLabel || t(PACING_LABEL_KEYS[pacingInfo.status])}</span>
          </Badge>
        ) : trend ? (
          <StatCardTrend trend={trend} showLabel={false} />
        ) : null}
      </div>
    </div>
  );
});
