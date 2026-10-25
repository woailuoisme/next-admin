import { AlertTriangle, Info, Package, ShieldAlert, UserCheck } from "lucide-react";

import type { NotificationCategory, NotificationSeverity } from "@/features/notifications";

import type { CategoryIconResult, NotificationTabKey } from "./types";

export const NOTIFICATION_TABS: readonly {
  key: NotificationTabKey;
  /** 页签文案的多语言 key */
  labelKey: "tab_all" | "tab_unread" | "tab_order" | "tab_system";
  category?: NotificationCategory;
  unreadOnly?: boolean;
}[] = [
  { key: "all", labelKey: "tab_all" },
  { key: "unread", labelKey: "tab_unread", unreadOnly: true },
  { key: "order", labelKey: "tab_order", category: "order" },
  { key: "system", labelKey: "tab_system", category: "system" },
];

/** 通知严重级别徽章配色：业务状态色统一收敛于此常量表，严格使用语义化设计令牌 */
export const SEVERITY_BADGE_CLASSES: Record<NotificationSeverity, string> = {
  error: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  warning: "bg-chart-3/15 text-chart-3",
  success: "bg-chart-2/15 text-chart-2",
  info: "bg-chart-1/15 text-chart-1",
};

/** 通知图标前景色：业务状态色统一收敛于此常量表，适配暗黑模式与动态主题 */
const NOTIFICATION_ICON_CLASSES = {
  order: "size-3.5 text-chart-2",
  customer: "size-3.5 text-chart-1",
  error: "size-3.5 text-destructive",
  warning: "size-3.5 text-chart-3",
  default: "size-3.5 text-primary",
} as const;

/** 按页签 key 解析列表查询过滤条件（与 NOTIFICATION_TABS 声明保持一致） */
export function resolveNotificationTabFilters(tabKey: NotificationTabKey): {
  category?: NotificationCategory;
  unreadOnly: boolean;
} {
  const tab = NOTIFICATION_TABS.find((item) => item.key === tabKey);
  return { category: tab?.category, unreadOnly: tab?.unreadOnly ?? false };
}

export function getCategoryIconComponent(
  category: NotificationCategory,
  severity: NotificationSeverity,
): CategoryIconResult {
  if (category === "order") {
    return { Icon: Package, className: NOTIFICATION_ICON_CLASSES.order };
  }
  if (category === "customer") {
    return { Icon: UserCheck, className: NOTIFICATION_ICON_CLASSES.customer };
  }
  if (severity === "error") {
    return { Icon: ShieldAlert, className: NOTIFICATION_ICON_CLASSES.error };
  }
  if (severity === "warning") {
    return { Icon: AlertTriangle, className: NOTIFICATION_ICON_CLASSES.warning };
  }
  return { Icon: Info, className: NOTIFICATION_ICON_CLASSES.default };
}
