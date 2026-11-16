import { createScopedTranslator } from "@/i18n/scoped";
import { common as enCommon, notification as enNotification } from "@/messages/en.json";
import { common as zhCommon, notification as zhNotification } from "@/messages/zh.json";

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
