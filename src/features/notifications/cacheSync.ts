import type { QueryClient } from "@tanstack/react-query";

import { extractNotificationFiltersFromKey, NOTIFICATION_LIST_KEY_PREFIX, notificationsEndpoint } from "./resource";
import type { NotificationFilters, NotificationItem, NotificationListResponse } from "./types";

type NotificationSnapshots = [readonly unknown[], NotificationListResponse | undefined][];

/**
 * 校验单条通知是否匹配目标缓存槽位的过滤条件，防止跨分类或已读状态缓存污染
 */
export function doesNotificationMatchFilters(item: NotificationItem, filters?: NotificationFilters): boolean {
  if (!filters) return true;
  if (filters.category && item.category !== filters.category) return false;
  if (filters.unreadOnly && item.read) return false;
  return true;
}

export function restoreNotificationSnapshots(queryClient: QueryClient, snapshots?: NotificationSnapshots): void {
  if (!snapshots) return;
  for (const [key, data] of snapshots) {
    queryClient.setQueryData(key, data);
  }
}

export async function applyOptimisticMarkRead(queryClient: QueryClient, id: string): Promise<NotificationSnapshots> {
  await queryClient.cancelQueries({ queryKey: notificationsEndpoint.keys.all });
  const previousQueries = queryClient.getQueriesData<NotificationListResponse>({
    queryKey: NOTIFICATION_LIST_KEY_PREFIX,
  });

  const targetWasUnread = previousQueries.some(([, data]) => data?.items.some((item) => item.id === id && !item.read));

  for (const [key, old] of previousQueries) {
    if (!old) continue;
    const filters = extractNotificationFiltersFromKey(key);
    const nextUnreadCount = targetWasUnread ? Math.max(0, old.unreadCount - 1) : old.unreadCount;

    if (filters?.unreadOnly) {
      const hadTarget = old.items.some((item) => item.id === id);
      queryClient.setQueryData<NotificationListResponse>(key, {
        ...old,
        total: hadTarget ? Math.max(0, old.total - 1) : old.total,
        unreadCount: nextUnreadCount,
        items: old.items.filter((item) => item.id !== id),
      });
    } else {
      queryClient.setQueryData<NotificationListResponse>(key, {
        ...old,
        unreadCount: nextUnreadCount,
        items: old.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
      });
    }
  }

  return previousQueries;
}

export async function applyOptimisticMarkAllRead(queryClient: QueryClient): Promise<NotificationSnapshots> {
  await queryClient.cancelQueries({ queryKey: notificationsEndpoint.keys.all });
  const previousQueries = queryClient.getQueriesData<NotificationListResponse>({
    queryKey: NOTIFICATION_LIST_KEY_PREFIX,
  });

  queryClient.setQueriesData<NotificationListResponse>({ queryKey: NOTIFICATION_LIST_KEY_PREFIX }, (old) => {
    if (!old) return old;
    return {
      ...old,
      unreadCount: 0,
      items: old.items.map((item) => ({ ...item, read: true })),
    };
  });

  return previousQueries;
}

export function injectRealtimeNotification(queryClient: QueryClient, item: NotificationItem): void {
  const cachedQueries = queryClient.getQueriesData<NotificationListResponse>({
    queryKey: NOTIFICATION_LIST_KEY_PREFIX,
  });

  const alreadyKnown = cachedQueries.some(([, old]) => old?.items.some((existing) => existing.id === item.id));
  if (alreadyKnown) return;

  for (const [queryKey, old] of cachedQueries) {
    if (!old) continue;
    const filters = extractNotificationFiltersFromKey(queryKey);
    const nextUnreadCount = item.read ? old.unreadCount : old.unreadCount + 1;

    if (doesNotificationMatchFilters(item, filters)) {
      queryClient.setQueryData<NotificationListResponse>(queryKey, {
        ...old,
        total: old.total + 1,
        unreadCount: nextUnreadCount,
        items: [item, ...old.items],
      });
    } else if (nextUnreadCount !== old.unreadCount) {
      queryClient.setQueryData<NotificationListResponse>(queryKey, {
        ...old,
        unreadCount: nextUnreadCount,
      });
    }
  }
}
