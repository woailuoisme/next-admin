import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useCentrifuge, useSubscription } from "@/integrations/centrifuge";
import { getApiErrorMessage } from "@/lib/apiClient";
import { toastMessages } from "@/lib/toastMessages";
import { useAuthAdmin } from "@/stores/auth";

import type { NotificationFilters, NotificationItem, NotificationListResponse } from "./types";

import { deleteNotification, markAllNotificationsAsRead, markNotificationAsRead } from "./api";
import { notificationKeys, notificationQueries } from "./queries";

export { notificationKeys, notificationQueries };
export const NOTIFICATIONS_QUERY_KEY = notificationKeys.all;

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

      // Snapshot previous cache across all notification queries
      const previousQueries = queryClient.getQueriesData<NotificationListResponse>({
        queryKey: NOTIFICATIONS_QUERY_KEY,
      });

      // Optimistically set read = true
      queryClient.setQueriesData<NotificationListResponse>({ queryKey: NOTIFICATIONS_QUERY_KEY }, (old) => {
        if (!old) return old;
        const wasUnread = old.items.find((item) => item.id === id && !item.read);
        return {
          ...old,
          unreadCount: wasUnread ? Math.max(0, old.unreadCount - 1) : old.unreadCount,
          items: old.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
        };
      });

      return { previousQueries };
    },
    onError: (_err, _id, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
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
        queryKey: NOTIFICATIONS_QUERY_KEY,
      });

      queryClient.setQueriesData<NotificationListResponse>({ queryKey: NOTIFICATIONS_QUERY_KEY }, (old) => {
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

      // Optimistically prepend to all notification query lists in TanStack Query cache
      queryClient.setQueriesData<NotificationListResponse>({ queryKey: NOTIFICATIONS_QUERY_KEY }, (old) => {
        if (!old) return old;
        const exists = old.items.some((existing) => existing.id === item.id);
        if (exists) return old;

        return {
          ...old,
          total: old.total + 1,
          unreadCount: item.read ? old.unreadCount : old.unreadCount + 1,
          items: [item, ...old.items],
        };
      });

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
