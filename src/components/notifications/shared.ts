import { AlertTriangle, Info, Package, ShieldAlert, UserCheck } from "lucide-react";

import { createScopedTranslator } from "@/i18n/scoped";
import { common as enCommon, notification as enNotification } from "@/messages/en.json";
import { common as zhCommon, notification as zhNotification } from "@/messages/zh.json";

export type NotificationCategory = "order" | "system" | "customer";

export type NotificationSeverity = "info" | "success" | "warning" | "error";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  read: boolean;
  isRead?: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface NotificationFilters {
  category?: NotificationCategory | "all";
  unreadOnly?: boolean;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
  unreadCount: number;
}

export type NotificationTabKey = "all" | "unread" | "order" | "system";

export interface CategoryIconResult {
  Icon: React.ComponentType<{ className?: string }>;
  className: string;
}

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

const getNotificationTranslator = createScopedTranslator("notification", {
  zh: zhNotification,
  en: enNotification,
});
const getCommonTranslator = createScopedTranslator("common", { zh: zhCommon, en: enCommon });

export type NotificationTimeTranslator = (key: string, values?: Record<string, string | number | Date>) => string;

export function formatRelativeTime(dateStr: string, t?: NotificationTimeTranslator, locale?: string): string {
  const translator: NotificationTimeTranslator = t ?? (getNotificationTranslator() as NotificationTimeTranslator);

  const parsedDate = new Date(dateStr);
  const timestamp = parsedDate.getTime();
  if (Number.isNaN(timestamp)) {
    return getCommonTranslator()("invalid_date");
  }

  const now = Date.now();
  const diffSeconds = Math.floor((now - timestamp) / 1000);

  if (diffSeconds < 60) return translator("time_just_now");
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return translator("time_minutes_ago", { minutes: diffMinutes });
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return translator("time_hours_ago", { hours: diffHours });
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return translator("time_days_ago", { days: diffDays });
  return parsedDate.toLocaleDateString(locale, {
    month: "numeric",
    day: "numeric",
  });
}
