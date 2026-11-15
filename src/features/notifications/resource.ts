import { apiClient } from "@/lib/apiClient";
import { defineEndpoint } from "@/lib/resource";
import type { ApiResponse } from "@/types";

import type { NotificationFilters, NotificationItem, NotificationListResponse } from "./types";

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

export async function fetchNotifications(filters?: NotificationFilters): Promise<NotificationListResponse> {
  const searchParams = new URLSearchParams();
  if (filters?.category && filters.category !== "all") {
    searchParams.set("category", filters.category);
  }
  if (filters?.unreadOnly) {
    searchParams.set("unreadOnly", "true");
  }

  return apiClient.get("notifications", { searchParams }).json<NotificationListResponse>();
}

export async function markNotificationAsRead(id: string): Promise<NotificationItem> {
  const res = await apiClient.patch(`notifications/${id}/read`).json<ApiResponse<NotificationItem>>();
  return res.data;
}

export async function markAllNotificationsAsRead(): Promise<{
  success: boolean;
  count: number;
}> {
  return apiClient.post("notifications/read-all").json<{ success: boolean; count: number }>();
}

export async function deleteNotification(id: string): Promise<void> {
  await apiClient.delete(`notifications/${id}`);
}

export const selectUnreadCount = (data: NotificationListResponse): number => data.unreadCount;

export const notificationsEndpoint = defineEndpoint({
  name: "notifications",
  queries: {
    list: {
      key: (filters: NotificationFilters = EMPTY_NOTIFICATION_FILTERS) =>
        ["list", normalizeNotificationFilters(filters)] as const,
      queryFn: (filters?: NotificationFilters) => fetchNotifications(normalizeNotificationFilters(filters)),
    },
    unreadCount: {
      key: ["list", EMPTY_NOTIFICATION_FILTERS] as const,
      queryFn: () => fetchNotifications(),
      select: selectUnreadCount,
      staleTime: 10 * 1000,
      refetchInterval: 30000,
      refetchIntervalInBackground: false,
    },
  },
});

export const notificationKeys = {
  all: notificationsEndpoint.keys.all,
  lists: () => [...notificationsEndpoint.keys.all, "list"] as const,
  list: (filters: NotificationFilters = EMPTY_NOTIFICATION_FILTERS) =>
    [...notificationsEndpoint.keys.all, "list", normalizeNotificationFilters(filters)] as const,
};

export const notificationQueries = notificationsEndpoint.queries;
