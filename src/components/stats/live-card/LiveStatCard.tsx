import { Activity, Clock } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

import type { LiveStatCardProps } from "./types";

import {
  StatCardHeader,
  StatCardHelpTooltip,
  StatCardIcon,
  StatCardRoot,
  StatCardSkeleton,
  StatCardTitle,
  StatCardValue,
} from "../primitives";
import { getStatTheme } from "../shared/theme";
import { MiniSparkline } from "../sparkline/MiniSparkline";
import { STATUS_CONFIG } from "./constants";

export const LiveStatCard = memo(function LiveStatCard({
  title,
  value,
  prefix,
  suffix,
  status = "online",
  statusText,
  lastUpdated,
  pulse = true,
  sparklineData,
  icon: Icon = Activity,
  theme = "primary",
  description,
  badge,
  to,
  onClick,
  isLoading = false,
  className,
}: LiveStatCardProps) {
  const themeConfig = getStatTheme(theme);
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.online;

  if (isLoading) {
    return <StatCardSkeleton variant="live" className={className} />;
  }

  const hasSparkline = Boolean(sparklineData && sparklineData.length > 1);
  const shouldPulse = pulse && status !== "offline";

  return (
    <StatCardRoot theme={theme} to={to} onClick={onClick} className={className}>
      {/* Top Row: Title + Status Pill */}
      <StatCardHeader>
        <div className="flex min-w-0 items-center gap-1.5">
          <StatCardTitle>{title}</StatCardTitle>
          {description ? <StatCardHelpTooltip description={description} /> : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {badge}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
              statusCfg.badgeClass,
            )}
          >
            <span className="relative flex h-2 w-2">
              {shouldPulse ? (
                <span
                  className={cn(
                    "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                    statusCfg.pingClass,
                  )}
                />
              ) : null}
              <span className={cn("relative inline-flex h-2 w-2 rounded-full", statusCfg.dotClass)} />
            </span>
            <span>{statusText || statusCfg.defaultText}</span>
          </span>
        </div>
      </StatCardHeader>

      {/* Middle Row: Numeric Value + Icon Badge */}
      <div className="flex items-baseline justify-between gap-3">
        <StatCardValue value={value} prefix={prefix} suffix={suffix} />
        {Icon ? <StatCardIcon icon={Icon} theme={theme} /> : null}
      </div>

      {/* Bottom Row: Last updated + Live Sparkline */}
      <div className="border-border/40 text-muted-foreground flex items-center justify-between gap-3 border-t pt-1 text-xs">
        <div className="flex min-w-0 items-center gap-1">
          <Clock className="h-3 w-3 shrink-0" />
          <span className="truncate">{lastUpdated || "实时采样中"}</span>
        </div>

        {hasSparkline && sparklineData ? (
          <div className="w-24 shrink-0">
            <MiniSparkline data={sparklineData} color={themeConfig.strokeColor} height={28} className="h-7" />
          </div>
        ) : null}
      </div>
    </StatCardRoot>
  );
});
