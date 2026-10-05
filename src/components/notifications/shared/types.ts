export type NotificationTabKey = "all" | "unread" | "order" | "system";

export interface CategoryIconResult {
  Icon: React.ComponentType<{ className?: string }>;
  className: string;
}
