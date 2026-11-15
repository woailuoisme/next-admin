"use client";

import { useFormatter } from "next-intl";
import { memo } from "react";

import type { ProgressStatCardProps } from "./types";

import { StatCardHeadline, StatCardProgress, StatCardRoot, StatCardSkeleton, StatCardValue } from "../primitives";
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
  linkLabel,
  onClick,
  isLoading = false,
  className,
}: ProgressStatCardProps) {
  const format = useFormatter();
  const progressResult = useProgressStat({
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
    <StatCardRoot theme={theme} to={to} linkLabel={linkLabel ?? title} onClick={onClick} className={className}>
      <StatCardHeadline title={title} description={description} badge={badge} icon={Icon} theme={theme} />

      {/* Middle row: Metric Value + Progress Percentage */}
      <div className="flex items-baseline justify-between gap-2">
        <StatCardValue value={value} prefix={prefix} suffix={suffix} />

        <div className="text-right">
          <span className="text-foreground font-mono text-sm font-bold tabular-nums">
            {format.number(progressResult.displayProgress)}%
          </span>
        </div>
      </div>

      {/* Progress track and status details (single precomputed progress result) */}
      <StatCardProgress
        ariaLabel={title}
        targetValue={targetValue}
        pacingLabel={pacingLabel}
        progressResult={progressResult}
        prefix={prefix}
        suffix={suffix}
        trend={trend}
        theme={theme}
      />
    </StatCardRoot>
  );
});
