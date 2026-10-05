import type { LiveStatus, LiveStatusConfigItem } from "./types";

export const STATUS_CONFIG: Record<LiveStatus, LiveStatusConfigItem> = {
  online: {
    dotClass: "bg-chart-2",
    pingClass: "bg-chart-2/70",
    badgeClass: "text-chart-2 bg-chart-2/10 border-chart-2/20",
    defaultText: "运行正常",
  },
  warning: {
    dotClass: "bg-chart-3",
    pingClass: "bg-chart-3/70",
    badgeClass: "text-chart-3 bg-chart-3/10 border-chart-3/20",
    defaultText: "负载告警",
  },
  error: {
    dotClass: "bg-destructive",
    pingClass: "bg-destructive/70",
    badgeClass: "text-destructive bg-destructive/10 border-destructive/20",
    defaultText: "服务异常",
  },
  offline: {
    dotClass: "bg-muted-foreground/60",
    pingClass: "bg-muted-foreground/40",
    badgeClass: "text-muted-foreground bg-muted border-border",
    defaultText: "离线挂起",
  },
};
