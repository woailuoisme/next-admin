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
  className,
}: NotificationListProps) {
  let content: ReactNode;
  if (isLoading) {
    content = <NotificationSkeleton />;
  } else if (items.length === 0) {
    content = <NotificationEmptyState activeTab={activeTab} />;
  } else {
    content = (
      <div className="space-y-1" data-testid="notification-items-container">
        {items.map((item) => (
          <NotificationItemRow key={item.id} item={item} onItemClick={onItemClick} />
        ))}
      </div>
    );
  }

  return <ScrollArea className={cn("h-[340px] px-2 py-2", className)}>{content}</ScrollArea>;
});
