import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useCentrifuge, useSubscription } from "@/integrations/centrifuge";
import { getApiErrorMessage } from "@/lib/apiClient";
import { toastMessages } from "@/lib/toastMessages";
import { useAuthAdmin } from "@/stores/auth";

import type { NotificationFilters, NotificationItem, NotificationListResponse } from "./types";

import {
  deleteNotification,
  extractNotificationFiltersFromKey,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  normalizeNotificationFilters,
  notificationKeys,
  notificationQueries,
} from "./resource";

export { extractNotificationFiltersFromKey, normalizeNotificationFilters, notificationKeys, notificationQueries };
export const NOTIFICATIONS_QUERY_KEY = notificationKeys.all;

/**
 * 校验单条通知是否匹配目标缓存槽位的过滤条件，防止跨分类或已读状态缓存污染
 */
export function doesNotificationMatchFilters(item: NotificationItem, filters?: NotificationFilters): boolean {
  if (!filters) return true;
  if (filters.category && item.category !== filters.category) return false;
  if (filters.unreadOnly && item.read) return false;
  return true;
}

export function useNotifications(filters?: NotificationFilters, options?: { enabled?: boolean }) {
  return useQuery({
    ...notificationQueries.list(filters),
    enabled: options?.enabled,
  });
}

export function useUnreadNotificationCount() {
  return useQuery(notificationQueries.unreadCount());
}

export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

      // Snapshot previous cache across notification list queries
      const previousQueries = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: notificationKeys.lists(),
      });

      const targetWasUnread = previousQueries.some(([, data]) =>
        data?.items.some((item) => item.id === id && !item.read),
      );

      // Optimistically set read = true and keep unreadCount consistent across all cached filter tabs
      for (const [key, old] of previousQueries) {
        if (!old) continue;
        const filters = extractNotificationFiltersFromKey(key);
        const nextUnreadCount = targetWasUnread ? Math.max(0, old.unreadCount - 1) : old.unreadCount;

        if (filters?.unreadOnly) {
          const hadTarget = old.items.some((item) => item.id === id);
          const nextItems = old.items.filter((item) => item.id !== id);
          queryClient.setQueryData<NotificationListResponse>(key, {
            ...old,
            total: hadTarget ? Math.max(0, old.total - 1) : old.total,
            unreadCount: nextUnreadCount,
            items: nextItems,
          });
        } else {
          queryClient.setQueryData<NotificationListResponse>(key, {
            ...old,
            unreadCount: nextUnreadCount,
            items: old.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
          });
        }
      }

      return { previousQueries };
    },
    onError: async (err, _id, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
      const msg = await getApiErrorMessage(err, toastMessages.statusError());
      toast.error(msg);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

      const previousQueries = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: notificationKeys.lists(),
      });

      queryClient.setQueriesData<NotificationListResponse>({ queryKey: notificationKeys.lists() }, (old) => {
        if (!old) return old;
        return {
          ...old,
          unreadCount: 0,
          items: old.items.map((item) => ({ ...item, read: true })),
        };
      });

      return { previousQueries };
    },
    onError: async (err, _vars, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
      const msg = await getApiErrorMessage(err, toastMessages.allNotificationsReadError());
      toast.error(msg);
    },
    onSuccess: () => {
      toast.success(toastMessages.allNotificationsRead());
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      toast.success(toastMessages.deleted());
    },
    onError: async (err) => {
      const msg = await getApiErrorMessage(err, toastMessages.deleteError());
      toast.error(msg);
    },
  });
}

export interface RealtimeNotificationsOptions {
  channel?: string;
  enableToast?: boolean;
  onNotificationReceived?: (notification: NotificationItem) => void;
}

/**
 * Subscribes to Centrifuge real-time notification stream for current authenticated user.
 * - Injects new notifications directly into TanStack Query caches without full refetch
 * - Increments unreadCount atomically
 * - Displays toast notification
 */
export function useRealtimeNotifications(options: RealtimeNotificationsOptions = {}) {
  const queryClient = useQueryClient();
  const admin = useAuthAdmin();
  const userId = admin?.id;
  const { isConnected } = useCentrifuge();

  const targetChannel = options.channel ?? (userId ? `user:${userId}:notifications` : "notifications");

  useSubscription<NotificationItem | { notification: NotificationItem }>(
    targetChannel,
    (publication: { data: unknown }) => {
      const rawData = publication.data;
      const item: NotificationItem =
        typeof rawData === "object" && rawData && "notification" in rawData
          ? (rawData as { notification: NotificationItem }).notification
          : (rawData as NotificationItem);

      if (!item || !item.id) return;

      // Optimistically prepend only to matching notification query lists in TanStack Query cache
      const cachedQueries = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: notificationKeys.lists(),
      });

      const alreadyKnown = cachedQueries.some(([, old]) => old?.items.some((existing) => existing.id === item.id));
      if (!alreadyKnown) {
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

      if (options.enableToast !== false) {
        const toastOptions = {
          description: item.description,
        };
        if (item.severity === "error") {
          toast.error(item.title, toastOptions);
        } else if (item.severity === "warning") {
          toast.warning(item.title, toastOptions);
        } else if (item.severity === "success") {
          toast.success(item.title, toastOptions);
        } else {
          toast.info(item.title, toastOptions);
        }
      }

      options.onNotificationReceived?.(item);
    },
  );

  return {
    channel: targetChannel,
    isConnected,
  };
}

function useBatchNotificationMutation(action: (id: string) => Promise<unknown>, fallbackError: () => string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => action(id)));
      return ids.length;
    },
    onError: async (err) => {
      const msg = await getApiErrorMessage(err, fallbackError());
      toast.error(msg);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

export function useBatchMarkNotificationsReadMutation() {
  return useBatchNotificationMutation(markNotificationAsRead, toastMessages.statusError);
}

export function useBatchDeleteNotificationsMutation() {
  return useBatchNotificationMutation(deleteNotification, toastMessages.deleteError);
}
