import { memo, type ReactNode } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import type { NotificationListProps } from "./types";

import { NotificationItemRow } from "../item";
import { NotificationEmptyState } from "./NotificationEmptyState";
import { NotificationSkeleton } from "./NotificationSkeleton";

export const NotificationList = memo(function NotificationList({
  items,
  isLoading,
  activeTab,
  onItemClick,
  onMarkAsRead,
  onDelete,
  className,
}: NotificationListProps) {
  let content: ReactNode;
  if (isLoading) {
    content = <NotificationSkeleton />;
  } else if (items.length === 0) {
    content = <NotificationEmptyState activeTab={activeTab} />;
  } else {
    content = (
      <div className="space-y-0.5 py-1" data-testid="notification-items-container">
        {items.map((item) => (
          <NotificationItemRow
            key={item.id}
            item={item}
            onItemClick={onItemClick}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return <ScrollArea className={cn("h-[360px] px-1 py-1", className)}>{content}</ScrollArea>;
});
