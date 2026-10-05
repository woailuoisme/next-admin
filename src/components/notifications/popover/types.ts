import type { NotificationItem } from "@/features/notifications";

import type { NotificationTabKey } from "../shared";

export interface NotificationHeaderProps {
  unreadCount: number;
  isMarkingAllAsRead: boolean;
  onMarkAllAsRead: (e: React.MouseEvent) => void;
  className?: string;
}

export interface NotificationTabsProps {
  activeTab: NotificationTabKey;
  unreadCount?: number;
  onTabChange: (tab: NotificationTabKey) => void;
  className?: string;
}

export interface NotificationFooterProps {
  total: number;
  onGotoOverview: () => void;
  className?: string;
}

export interface NotificationPopoverProps {
  unreadCount: number;
  totalCount: number;
  activeTab: NotificationTabKey;
  items: NotificationItem[];
  isLoading: boolean;
  isMarkingAllAsRead: boolean;
  onTabChange: (tab: NotificationTabKey) => void;
  onMarkAllAsRead: (e: React.MouseEvent) => void;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onItemClick: (item: NotificationItem) => void;
  onGotoOverview: () => void;
  className?: string;
}
