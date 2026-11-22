"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuthAdmin } from "@/features/auth";
import { useBatchMutation } from "@/hooks/useBatchMutation";
import { useCentrifuge, useSubscription } from "@/integrations/centrifuge";
import { getApiErrorMessage } from "@/lib/apiClient";
import { toastMessages } from "@/lib/toastMessages";

import {
  applyOptimisticMarkAllRead,
  applyOptimisticMarkRead,
  doesNotificationMatchFilters,
  injectRealtimeNotification,
  restoreNotificationSnapshots,
} from "./cacheSync";
import {
  deleteNotification,
  extractNotificationFiltersFromKey,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  normalizeNotificationFilters,
  notificationsEndpoint,
} from "./resource";
import type { NotificationFilters, NotificationItem } from "./types";

export { doesNotificationMatchFilters, extractNotificationFiltersFromKey, normalizeNotificationFilters };

export function useNotifications(filters?: NotificationFilters, options?: { enabled?: boolean }) {
  return useQuery({
    ...notificationsEndpoint.queries.list(filters),
    enabled: options?.enabled,
  });
}

export function useUnreadNotificationCount() {
  return useQuery(notificationsEndpoint.queries.unreadCount());
}

export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: (id: string) => applyOptimisticMarkRead(queryClient, id),
    onError: async (err, _id, previousQueries) => {
      restoreNotificationSnapshots(queryClient, previousQueries);
      toast.error(await getApiErrorMessage(err, toastMessages.statusError()));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsEndpoint.keys.all });
    },
  });
}

export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: () => applyOptimisticMarkAllRead(queryClient),
    onError: async (err, _vars, previousQueries) => {
      restoreNotificationSnapshots(queryClient, previousQueries);
      toast.error(await getApiErrorMessage(err, toastMessages.allNotificationsReadError()));
    },
    onSuccess: () => {
      toast.success(toastMessages.allNotificationsRead());
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsEndpoint.keys.all });
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsEndpoint.keys.all });
      toast.success(toastMessages.deleted());
    },
    onError: async (err) => {
      toast.error(await getApiErrorMessage(err, toastMessages.deleteError()));
    },
  });
}

export interface RealtimeNotificationsOptions {
  channel?: string;
  enableToast?: boolean;
  onNotificationReceived?: (notification: NotificationItem) => void;
}

const TOAST_BY_SEVERITY = {
  error: toast.error,
  warning: toast.warning,
  success: toast.success,
  info: toast.info,
} as const;

/**
 * 订阅 Centrifuge 实时通知流：直接写入匹配缓存并按严重级别弹出轻提示
 */
export function useRealtimeNotifications(options: RealtimeNotificationsOptions = {}) {
  const queryClient = useQueryClient();
  const admin = useAuthAdmin();
  const { isConnected } = useCentrifuge();
  const targetChannel = options.channel ?? (admin?.id ? `user:${admin.id}:notifications` : "notifications");

  useSubscription<NotificationItem | { notification: NotificationItem }>(
    targetChannel,
    (publication: { data: unknown }) => {
      const rawData = publication.data;
      const item: NotificationItem =
        typeof rawData === "object" && rawData && "notification" in rawData
          ? (rawData as { notification: NotificationItem }).notification
          : (rawData as NotificationItem);

      if (!item?.id) return;
      injectRealtimeNotification(queryClient, item);

      if (options.enableToast !== false) {
        const showToast = TOAST_BY_SEVERITY[item.severity] ?? toast.info;
        showToast(item.title, { description: item.description });
      }
      options.onNotificationReceived?.(item);
    },
  );

  return { channel: targetChannel, isConnected };
}

export interface BatchNotificationOptions {
  successMessage?: (count: number) => string;
  errorMessage?: (failed: number, total: number) => string;
}

function useBatchNotificationAction(action: (id: string) => Promise<unknown>, options?: BatchNotificationOptions) {
  const queryClient = useQueryClient();
  const batch = useBatchMutation({
    mutationFn: action,
    entityName: "Notification",
    successMessage: options?.successMessage,
    errorMessage: options?.errorMessage,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsEndpoint.keys.all });
    },
  });

  return {
    ...batch,
    mutateAsync: async (ids: string[]) => {
      const results = await batch.mutateBatchAsync(ids);
      return results.length;
    },
  };
}

export function useBatchMarkNotificationsReadMutation(options?: BatchNotificationOptions) {
  return useBatchNotificationAction(markNotificationAsRead, options);
}

export function useBatchDeleteNotificationsMutation(options?: BatchNotificationOptions) {
  return useBatchNotificationAction(deleteNotification, options);
}
