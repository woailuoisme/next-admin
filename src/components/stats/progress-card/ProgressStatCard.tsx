import { memo } from "react";

import type { ProgressStatCardProps } from "./types";

import {
  StatCardHeader,
  StatCardHelpTooltip,
  StatCardIcon,
  StatCardProgress,
  StatCardRoot,
  StatCardSkeleton,
  StatCardTitle,
  StatCardValue,
} from "../primitives";
import { useProgressStat } from "./useProgressStat";

export const ProgressStatCard = memo(function ProgressStatCard({
  title,
  value,
  targetValue,
  progress,
  prefix,
  suffix,
  description,
  icon: Icon,
  theme = "primary",
  pacingLabel,
  pacingStatus,
  trend,
  badge,
  to,
  onClick,
  isLoading = false,
  className,
}: ProgressStatCardProps) {
  const { displayProgress } = useProgressStat({
    value,
    targetValue,
    progress,
    pacingStatus,
    pacingLabel,
  });

  if (isLoading) {
    return <StatCardSkeleton variant="progress" className={className} />;
  }

  return (
    <StatCardRoot theme={theme} to={to} onClick={onClick} className={className}>
      {/* Top row: Title + Tooltip & Icon Badge */}
      <StatCardHeader>
        <div className="flex min-w-0 items-center gap-1.5">
          <StatCardTitle>{title}</StatCardTitle>
          {description ? <StatCardHelpTooltip description={description} /> : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {badge}
          {Icon ? <StatCardIcon icon={Icon} theme={theme} /> : null}
        </div>
      </StatCardHeader>

      {/* Middle row: Metric Value + Progress Percentage */}
      <div className="flex items-baseline justify-between gap-2">
        <StatCardValue value={value} prefix={prefix} suffix={suffix} />

        <div className="text-right">
          <span className="text-foreground font-mono text-sm font-bold tabular-nums">
            {displayProgress}%
          </span>
        </div>
      </div>

      {/* Progress track and status details */}
      <StatCardProgress
        value={value}
        targetValue={targetValue}
        progress={progress}
        pacingStatus={pacingStatus}
        pacingLabel={pacingLabel}
        prefix={prefix}
        suffix={suffix}
        trend={trend}
        theme={theme}
      />
    </StatCardRoot>
  );
});
