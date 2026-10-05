import { queryOptions } from "@tanstack/react-query";

import type { NotificationFilters, NotificationListResponse } from "./types";

import { fetchNotifications } from "./api";

export const EMPTY_NOTIFICATION_FILTERS: NotificationFilters = Object.freeze({});

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (filters: NotificationFilters = EMPTY_NOTIFICATION_FILTERS) =>
    [...notificationKeys.lists(), filters] as const,
};

export const selectUnreadCount = (data: NotificationListResponse): number => data.unreadCount;

export const notificationQueries = {
  all: () => notificationKeys.all,
  list: (filters: NotificationFilters = EMPTY_NOTIFICATION_FILTERS) =>
    queryOptions({
      queryKey: notificationKeys.list(filters),
      queryFn: () => fetchNotifications(filters),
    }),
  unreadCount: () =>
    queryOptions({
      queryKey: notificationKeys.list(),
      queryFn: () => fetchNotifications(),
      select: selectUnreadCount,
      refetchInterval: 30000,
    }),
};
