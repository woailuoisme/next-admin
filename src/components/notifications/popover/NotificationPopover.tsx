import { memo } from "react";

import { PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import type { NotificationPopoverProps } from "./types";

import { NotificationList } from "../list";
import { NotificationFooter } from "./NotificationFooter";
import { NotificationHeader } from "./NotificationHeader";
import { NotificationTabs } from "./NotificationTabs";

export const NotificationPopover = memo(function NotificationPopover({
  unreadCount,
  totalCount,
  activeTab,
  items,
  isLoading,
  isMarkingAllAsRead,
  onTabChange,
  onMarkAllAsRead,
  onMarkAsRead,
  onDelete,
  onItemClick,
  onGotoOverview,
  className,
}: NotificationPopoverProps) {
  return (
    <PopoverContent
      align="end"
      sideOffset={8}
      className={cn(
        "w-[400px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border-border/70 bg-popover/95 p-0 shadow-2xl backdrop-blur-2xl",
        className,
      )}
    >
      <NotificationHeader
        unreadCount={unreadCount}
        isMarkingAllAsRead={isMarkingAllAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
      />
      <NotificationTabs activeTab={activeTab} unreadCount={unreadCount} onTabChange={onTabChange} />
      <NotificationList
        items={items}
        isLoading={isLoading}
        activeTab={activeTab}
        onItemClick={onItemClick}
        onMarkAsRead={onMarkAsRead}
        onDelete={onDelete}
      />
      <NotificationFooter total={totalCount} onGotoOverview={onGotoOverview} />
    </PopoverContent>
  );
});
