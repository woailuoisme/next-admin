import type { NotificationItem } from "@/features/notifications";

import type { NotificationTabKey } from "../shared";

export interface NotificationListProps {
  items: NotificationItem[];
  isLoading: boolean;
  activeTab: NotificationTabKey;
  onItemClick: (item: NotificationItem) => void;
  className?: string;
}

export interface NotificationEmptyStateProps {
  activeTab: NotificationTabKey;
  className?: string;
}

export interface NotificationSkeletonProps {
  count?: number;
  className?: string;
}
