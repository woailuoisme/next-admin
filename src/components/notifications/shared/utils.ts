import { createTranslator } from "next-intl";

import { DICTIONARY, getUserLocale } from "@/i18n";

export function formatRelativeTime(
  dateStr: string,
  t?: (key: any, values?: any) => string,
): string {
  const translator =
    t ??
    (() => {
      const locale = getUserLocale();
      return createTranslator({
        locale,
        messages: DICTIONARY[locale] ?? DICTIONARY.zh,
        namespace: "notification",
      });
    })();

  const now = Date.now();
  const timestamp = new Date(dateStr).getTime();
  const diffSeconds = Math.floor((now - timestamp) / 1000);

  if (diffSeconds < 60) return translator("time_just_now");
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return translator("time_minutes_ago", { minutes: diffMinutes });
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return translator("time_hours_ago", { hours: diffHours });
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return translator("time_days_ago", { days: diffDays });
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "numeric",
    day: "numeric",
  });
}
