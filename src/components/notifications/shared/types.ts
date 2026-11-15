export type NotificationCategory = "order" | "system" | "customer";

export type NotificationSeverity = "info" | "success" | "warning" | "error";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  read: boolean;
  isRead?: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface NotificationFilters {
  category?: NotificationCategory | "all";
  unreadOnly?: boolean;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
  unreadCount: number;
}

export type NotificationTabKey = "all" | "unread" | "order" | "system";

export interface CategoryIconResult {
  Icon: React.ComponentType<{ className?: string }>;
  className: string;
}
