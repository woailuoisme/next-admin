import type { NotificationItem } from "../shared";

export interface NotificationItemRowProps {
  item: NotificationItem;
  onItemClick: (item: NotificationItem) => void;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}
