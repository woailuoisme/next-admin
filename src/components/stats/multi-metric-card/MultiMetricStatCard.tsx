"use client";

import { memo } from "react";

import { cn } from "cn";

import type { MultiMetricStatCardProps, SubMetricItem } from "./types";

import { StatCardHeadline, StatCardRoot, StatCardSkeleton, StatCardTrend, StatCardValue } from "../primitives";
import { MetricRow } from "./MetricRow";

const EMPTY_METRICS: SubMetricItem[] = [];

export const MultiMetricStatCard = memo(function MultiMetricStatCard({
  title,
  primaryValue,
  primaryLabel,
  prefix,
  suffix,
  primaryTrend,
  metrics = EMPTY_METRICS,
  description,
  icon: Icon,
  theme = "primary",
  density,
  badge,
  to,
  linkLabel,
  onClick,
  isLoading = false,
  className,
}: MultiMetricStatCardProps) {
  if (isLoading) {
    return <StatCardSkeleton variant="multi-metric" density={density} className={className} />;
  }

  const hasMetrics = metrics.length > 0;

  return (
    <StatCardRoot
      density={density}
      theme={theme}
      to={to}
      linkLabel={linkLabel ?? title}
      onClick={onClick}
      className={className}
    >
      <StatCardHeadline title={title} description={description} badge={badge} icon={Icon} theme={theme} />

      {/* Primary Focus Metric */}
      <div className="space-y-1">
        {primaryLabel ? <p className="text-muted-foreground text-xs font-medium">{primaryLabel}</p> : null}
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <StatCardValue value={primaryValue} prefix={prefix} suffix={suffix} />
          {primaryTrend ? <StatCardTrend trend={primaryTrend} /> : null}
        </div>
      </div>

      {/* Secondary Sub-metrics Grid */}
      {hasMetrics ? (
        <div
          className={cn(
            "grid gap-2.5 border-t border-border/40 pt-3",
            metrics.length === 3 ? "grid-cols-1 @xs:grid-cols-3" : "grid-cols-1 @xs:grid-cols-2",
          )}
        >
          {metrics.map((sub, idx) => (
            <MetricRow key={sub.label || idx} item={sub} />
          ))}
        </div>
      ) : null}
    </StatCardRoot>
  );
});
