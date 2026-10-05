import type { NotificationItem } from "@/features/notifications";

export interface NotificationItemRowProps {
  item: NotificationItem;
  onItemClick: (item: NotificationItem) => void;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}
