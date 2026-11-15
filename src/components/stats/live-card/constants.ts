import type { LiveStatus, LiveStatusConfigItem } from "./types";

export const STATUS_CONFIG: Record<LiveStatus, LiveStatusConfigItem> = {
  online: {
    dotClass: "bg-chart-2",
    pingClass: "bg-chart-2/70",
    badgeClass: "text-chart-2 bg-chart-2/10 border-chart-2/20",
    labelKey: "status_online",
  },
  warning: {
    dotClass: "bg-chart-3",
    pingClass: "bg-chart-3/70",
    badgeClass: "text-chart-3 bg-chart-3/10 border-chart-3/20",
    labelKey: "status_warning",
  },
  error: {
    dotClass: "bg-destructive",
    pingClass: "bg-destructive/70",
    badgeClass: "text-destructive bg-destructive/10 border-destructive/20",
    labelKey: "status_error",
  },
  stale: {
    dotClass: "bg-chart-3",
    pingClass: "bg-chart-3/60",
    badgeClass: "text-chart-3 bg-chart-3/10 border-chart-3/20",
    labelKey: "status_stale",
  },
  offline: {
    dotClass: "bg-muted-foreground/60",
    pingClass: "bg-muted-foreground/40",
    badgeClass: "text-muted-foreground bg-muted border-border",
    labelKey: "status_offline",
  },
};
