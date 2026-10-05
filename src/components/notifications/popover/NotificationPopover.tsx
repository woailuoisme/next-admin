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
  onItemClick,
  onGotoOverview,
  className,
}: NotificationPopoverProps) {
  return (
    <PopoverContent
      align="end"
      sideOffset={8}
      className={cn(
        "w-[380px] overflow-hidden rounded-xl border-border/70 bg-popover/95 p-0 shadow-2xl backdrop-blur-xl",
        className,
      )}
    >
      <NotificationHeader
        unreadCount={unreadCount}
        isMarkingAllAsRead={isMarkingAllAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
      />
      <NotificationTabs activeTab={activeTab} onTabChange={onTabChange} />
      <NotificationList
        items={items}
        isLoading={isLoading}
        activeTab={activeTab}
        onItemClick={onItemClick}
      />
      <NotificationFooter total={totalCount} onGotoOverview={onGotoOverview} />
    </PopoverContent>
  );
});
