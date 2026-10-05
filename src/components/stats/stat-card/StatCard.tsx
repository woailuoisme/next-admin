import { memo } from "react";

import { cn } from "@/lib/utils";

import type { StatCardProps } from "./types";

import { useStatsGridContext } from "../grid/StatsGridContext";
import {
  DENSITY_STYLES,
  StatCardActions,
  StatCardHeader,
  StatCardHelpTooltip,
  StatCardIcon,
  StatCardProgress,
  StatCardRoot,
  StatCardSkeleton,
  StatCardSparkline,
  StatCardTitle,
  StatCardTrend,
  StatCardValue,
} from "../primitives";

const StatCardFacade = memo(function StatCard({
  title,
  value,
  prefix,
  suffix,
  description,
  icon,
  theme = "primary",
  trend,
  sparklineData,
  sparklineType = "area",
  sparklineLayout,
  density,
  badge,
  actions,
  copyable,
  isCopyable,
  copyText,
  animated,
  isAnimated,
  formatter,
  to,
  onClick,
  isLoading = false,
  className,
}: StatCardProps) {
  const gridContext = useStatsGridContext();
  const resolvedDensity = density ?? gridContext.density ?? "compact";
  const resolvedSparklineLayout = sparklineLayout ?? gridContext.sparklineLayout ?? "inline";
  const dStyles = DENSITY_STYLES[resolvedDensity];

  if (isLoading) {
    return (
      <StatCardSkeleton
        density={resolvedDensity}
        sparklineLayout={resolvedSparklineLayout}
        hasSparkline={Boolean(sparklineData && sparklineData.length > 1)}
        className={className}
      />
    );
  }

  const hasTrend = Boolean(trend);
  const hasSparkline = Boolean(sparklineData && sparklineData.length > 1);

  return (
    <StatCardRoot
      density={resolvedDensity}
      sparklineLayout={resolvedSparklineLayout}
      theme={theme}
      to={to}
      onClick={onClick}
      className={className}
    >
      {/* Top row: Title + Tooltip & Icon + Actions + Badge */}
      <StatCardHeader>
        <div className="flex min-w-0 items-center gap-1.5">
          <StatCardTitle density={resolvedDensity}>{title}</StatCardTitle>
          {description ? <StatCardHelpTooltip description={description} /> : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {badge}
          {actions ? <StatCardActions>{actions}</StatCardActions> : null}
          {icon ? <StatCardIcon icon={icon} theme={theme} density={resolvedDensity} /> : null}
        </div>
      </StatCardHeader>

      {/* Middle row: Metric Value */}
      <StatCardValue
        value={value}
        prefix={prefix}
        suffix={suffix}
        formatter={formatter}
        copyable={isCopyable ?? copyable}
        copyText={copyText}
        animated={isAnimated ?? animated}
        density={resolvedDensity}
      />

      {/* Bottom row / Sparkline */}
      {hasTrend || hasSparkline ? (
        resolvedSparklineLayout === "bottom" ? (
          <div className={cn("space-y-2", dStyles.trendSpacing)}>
            {hasTrend ? <StatCardTrend trend={trend} /> : null}
            {hasSparkline ? (
              <StatCardSparkline
                data={sparklineData}
                type={sparklineType}
                layout="bottom"
                theme={theme}
                density={resolvedDensity}
              />
            ) : null}
          </div>
        ) : (
          <div className={cn("flex items-center justify-between gap-2.5", dStyles.trendSpacing)}>
            {hasTrend ? <StatCardTrend trend={trend} /> : null}
            {hasSparkline ? (
              <StatCardSparkline
                data={sparklineData}
                type={sparklineType}
                layout="inline"
                theme={theme}
                density={resolvedDensity}
              />
            ) : null}
          </div>
        )
      ) : null}
    </StatCardRoot>
  );
});

export const StatCard = Object.assign(StatCardFacade, {
  Root: StatCardRoot,
  Header: StatCardHeader,
  Title: StatCardTitle,
  Description: StatCardHelpTooltip,
  HelpTooltip: StatCardHelpTooltip,
  Actions: StatCardActions,
  Icon: StatCardIcon,
  Value: StatCardValue,
  Trend: StatCardTrend,
  Sparkline: StatCardSparkline,
  Progress: StatCardProgress,
  Skeleton: StatCardSkeleton,
});
