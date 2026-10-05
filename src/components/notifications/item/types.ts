import type { NotificationItem } from "@/features/notifications";

export interface NotificationItemRowProps {
  item: NotificationItem;
  onItemClick: (item: NotificationItem) => void;
}
