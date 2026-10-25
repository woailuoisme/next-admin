import { useTranslations } from "next-intl";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { memo, type ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "cn";

import type { PacingStatus } from "../progress-card/types";
import type { StatCardTheme } from "../shared/types";
import type { StatCardTrendData, TrendDirection } from "../stat-card/types";

import { useProgressStat } from "../progress-card/useProgressStat";
import { getStatTheme } from "../shared/theme";
import { calculateTrendInfo } from "../stat-card/useTrendInfo";
import { useStatCardContext } from "./StatCardContext";

/** 进度节奏状态的默认文案 */
const PACING_LABELS: Record<PacingStatus, string> = {
  ahead: "超额达成",
  on_track: "稳步推进",
  behind: "进度滞后",
};

/** 趋势方向 → 图标 */
const TREND_DIR_ICONS: Record<TrendDirection, ComponentType<{ className?: string }>> = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus,
};

export interface StatCardProgressProps {
  value?: number | string;
  targetValue?: number | string;
  progress?: number;
  pacingStatus?: PacingStatus;
  pacingLabel?: string;
  prefix?: string;
  suffix?: string;
  trend?: StatCardTrendData;
  theme?: StatCardTheme;

  className?: string;
}

export const StatCardProgress = memo(function StatCardProgress({
  value = 0,
  targetValue,
  progress,
  pacingStatus,
  pacingLabel,
  prefix,
  suffix,
  trend,
  theme,
  className,
}: StatCardProgressProps) {
  const context = useStatCardContext();
  const t = useTranslations("stats");
  const resolvedTheme = theme ?? context.theme ?? "primary";
  const themeConfig = getStatTheme(resolvedTheme);

  const { calculatedProgress, pacingInfo } = useProgressStat({
    value,
    targetValue,
    progress,
    pacingStatus,
    pacingLabel,
  });

  const trendInfo = calculateTrendInfo(trend);

  const targetDisplay = typeof targetValue === "number" ? targetValue.toLocaleString() : targetValue;
  const DirIcon = trendInfo ? TREND_DIR_ICONS[trendInfo.dir] : null;

  const resolvePacingLabel = (status: PacingStatus) => {
    switch (status) {
      case "ahead":
        return t("pacing_ahead");
      case "on_track":
        return t("pacing_on_track");
      case "behind":
        return t("pacing_behind");
      default:
        return PACING_LABELS[status];
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Track & Filled Bar via Shadcn Progress primitive */}
      <Progress
        value={calculatedProgress}
        className={cn(
          "h-2 w-full",
          themeConfig.accentBar && `[&>[data-slot=progress-indicator]]:${themeConfig.accentBar}`,
        )}
      />

      {/* Status row: Target Value + Pacing / Trend Info */}
      <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
        <div>
          {targetValue !== undefined ? (
            <span>
              {t("target_label")}
              {prefix || ""}
              {targetDisplay}
              {suffix || ""}
            </span>
          ) : null}
        </div>

        {pacingInfo && (pacingLabel || pacingStatus) ? (
          <Badge
            variant="outline"
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
              pacingInfo.colorClass,
            )}
          >
            <pacingInfo.PacingIcon className="h-3 w-3" />
            <span>{pacingLabel || resolvePacingLabel(pacingInfo.status)}</span>
          </Badge>
        ) : trend && trendInfo ? (
          <Badge
            variant="outline"
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
              trendInfo.colorClass,
            )}
          >
            {DirIcon ? <DirIcon className="h-3 w-3" /> : null}
            <span>{trendInfo.displayValue}</span>
          </Badge>
        ) : null}
      </div>
    </div>
  );
});
