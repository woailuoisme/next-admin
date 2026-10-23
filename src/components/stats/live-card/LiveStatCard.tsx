import { useTranslations } from "next-intl";
import { Activity, Clock } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";

import type { LiveStatCardProps } from "./types";

import { StatCardHeadline, StatCardIcon, StatCardRoot, StatCardSkeleton, StatCardValue } from "../primitives";
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
  const t = useTranslations("stats");
  const themeConfig = getStatTheme(theme);
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.online;

  if (isLoading) {
    return <StatCardSkeleton variant="live" className={className} />;
  }

  const hasSparkline = Boolean(sparklineData && sparklineData.length > 1);
  const shouldPulse = pulse && status !== "offline";

  const resolveStatusText = () => {
    if (statusText) return statusText;
    switch (status) {
      case "online":
        return t("status_online");
      case "warning":
        return t("status_warning");
      case "error":
        return t("status_error");
      case "offline":
        return t("status_offline");
      default:
        return statusCfg.defaultText;
    }
  };

  return (
    <StatCardRoot theme={theme} to={to} onClick={onClick} className={className}>
      <StatCardHeadline
        title={title}
        description={description}
        badge={badge}
        trailing={
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
            <span>{resolveStatusText()}</span>
          </span>
        }
      />

      {/* Middle Row: Numeric Value + Icon Badge */}
      <div className="flex items-baseline justify-between gap-3">
        <StatCardValue value={value} prefix={prefix} suffix={suffix} />
        {Icon ? <StatCardIcon icon={Icon} theme={theme} /> : null}
      </div>

      {/* Bottom Row: Last updated + Live Sparkline */}
      <div className="border-border/40 text-muted-foreground flex items-center justify-between gap-3 border-t pt-1 text-xs">
        <div className="flex min-w-0 items-center gap-1">
          <Clock className="h-3 w-3 shrink-0" />
          <span className="truncate">{lastUpdated || t("live_updating")}</span>
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
