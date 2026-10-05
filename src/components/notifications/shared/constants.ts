import { AlertTriangle, Info, Package, ShieldAlert, UserCheck } from "lucide-react";

import type { NotificationCategory, NotificationSeverity } from "@/features/notifications";

import type { CategoryIconResult, NotificationTabKey } from "./types";

export const NOTIFICATION_TABS: readonly {
  key: NotificationTabKey;
  category?: NotificationCategory;
  unreadOnly?: boolean;
}[] = [
  { key: "all" },
  { key: "unread", unreadOnly: true },
  { key: "order", category: "order" },
  { key: "system", category: "system" },
] as const;

/** 通知严重级别徽章配色：业务状态色统一收敛于此常量表 */
export const SEVERITY_BADGE_CLASSES: Record<NotificationSeverity, string> = {
  error: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/20",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400 dark:bg-sky-500/20",
};

/** 通知图标前景色：业务状态色统一收敛于此常量表 */
const NOTIFICATION_ICON_CLASSES = {
  order: "size-3.5 text-emerald-600 dark:text-emerald-400",
  customer: "size-3.5 text-sky-600 dark:text-sky-400",
  error: "size-3.5 text-destructive",
  warning: "size-3.5 text-amber-600 dark:text-amber-400",
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
