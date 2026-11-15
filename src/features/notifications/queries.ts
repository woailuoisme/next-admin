import { queryOptions } from "@tanstack/react-query";

import type { NotificationFilters, NotificationListResponse } from "./types";

import { fetchNotifications } from "./api";

export const EMPTY_NOTIFICATION_FILTERS: NotificationFilters = Object.freeze({});

/**
 * 归一化通知列表查询条件：
 * 将 `{ category: undefined, unreadOnly: false }` 折叠为共享的 `EMPTY_NOTIFICATION_FILTERS`，
 * 确保顶部铃铛未读数查询与 "all" 页签复用同一份 TanStack Query 缓存。
 */
export function normalizeNotificationFilters(filters?: NotificationFilters): NotificationFilters {
  if (!filters) return EMPTY_NOTIFICATION_FILTERS;
  const rawCategory = filters.category as string | undefined;
  const category = rawCategory && rawCategory !== "all" ? (rawCategory as NotificationFilters["category"]) : undefined;
  const unreadOnly = filters.unreadOnly ? true : undefined;
  if (!category && !unreadOnly) return EMPTY_NOTIFICATION_FILTERS;
  return {
    ...(category ? { category } : {}),
    ...(unreadOnly ? { unreadOnly } : {}),
  };
}

/**
 * 从 TanStack Query notification list queryKey 中提取归一化过滤条件，消除调用方对 key 元组索引的耦合
 */
export function extractNotificationFiltersFromKey(queryKey: readonly unknown[]): NotificationFilters | undefined {
  if (!Array.isArray(queryKey) || queryKey.length < 3) return undefined;
  const candidate = queryKey[2];
  if (!candidate || typeof candidate !== "object") return undefined;
  return candidate as NotificationFilters;
}

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (filters: NotificationFilters = EMPTY_NOTIFICATION_FILTERS) =>
    [...notificationKeys.lists(), normalizeNotificationFilters(filters)] as const,
};

export const selectUnreadCount = (data: NotificationListResponse): number => data.unreadCount;

export const notificationQueries = {
  all: () => notificationKeys.all,
  list: (filters: NotificationFilters = EMPTY_NOTIFICATION_FILTERS) => {
    const normalized = normalizeNotificationFilters(filters);
    return queryOptions({
      queryKey: notificationKeys.list(normalized),
      queryFn: () => fetchNotifications(normalized),
    });
  },
  unreadCount: () =>
    queryOptions({
      queryKey: notificationKeys.list(),
      queryFn: () => fetchNotifications(),
      select: selectUnreadCount,
      staleTime: 10 * 1000,
      refetchInterval: 30000,
      refetchIntervalInBackground: false,
    }),
};
