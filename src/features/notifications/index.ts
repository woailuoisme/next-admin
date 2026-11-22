// Public API seam for notifications feature
export { ConnectedNotificationBell, type ConnectedNotificationBellProps } from "./components/ConnectedNotificationBell";
export {
  type BatchNotificationOptions,
  doesNotificationMatchFilters,
  extractNotificationFiltersFromKey,
  normalizeNotificationFilters,
  useBatchDeleteNotificationsMutation,
  useBatchMarkNotificationsReadMutation,
  useDeleteNotificationMutation,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
  useNotifications,
  useRealtimeNotifications,
  useUnreadNotificationCount,
} from "./hooks";
export {
  deleteNotification,
  EMPTY_NOTIFICATION_FILTERS,
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NOTIFICATION_LIST_KEY_PREFIX,
  notificationsEndpoint,
  selectUnreadCount,
} from "./resource";
export type {
  NotificationCategory,
  NotificationFilters,
  NotificationItem,
  NotificationListResponse,
  NotificationSeverity,
} from "./types";
