// Public API seam for notifications feature
export { ConnectedNotificationBell, type ConnectedNotificationBellProps } from "./components/ConnectedNotificationBell";
export {
  NOTIFICATIONS_QUERY_KEY,
  notificationKeys,
  notificationQueries,
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
