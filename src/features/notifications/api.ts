import type { ApiResponse } from "@/types";

import { apiClient } from "@/lib/api-client";

import type { NotificationFilters, NotificationItem, NotificationListResponse } from "./types";

export async function fetchNotifications(
  filters?: NotificationFilters,
): Promise<NotificationListResponse> {
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
  const res = await apiClient
    .patch(`notifications/${id}/read`)
    .json<ApiResponse<NotificationItem>>();
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
