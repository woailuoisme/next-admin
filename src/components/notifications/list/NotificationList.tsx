import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, type ReactNode } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";

import type { NotificationEmptyStateProps, NotificationListProps, NotificationSkeletonProps } from "./types";

import { NotificationItemRow } from "../item";

export const NotificationSkeleton = memo(function NotificationSkeleton({
  count = 4,
  className,
}: NotificationSkeletonProps) {
  return (
    <div className={cn("space-y-2.5 p-2", className)} data-testid="notification-skeletons">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="mx-1 flex items-start gap-3 rounded-xl p-3">
          <Skeleton className="size-7.5 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2.5 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
});

export const NotificationEmptyState = memo(function NotificationEmptyState({
  activeTab,
  className,
}: NotificationEmptyStateProps) {
  const t = useTranslations("notification");

  return (
    <div
      data-testid="notification-empty-state"
      className={cn(
        "flex h-64 flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground",
        className,
      )}
    >
      <div className="bg-muted/60 text-muted-foreground/60 mb-1 flex size-12 items-center justify-center rounded-full">
        <Sparkles className="size-6" />
      </div>
      <p className="text-foreground text-xs font-medium">{t("empty_title")}</p>
      <p className="text-muted-foreground max-w-[200px] text-[11px]">
        {activeTab === "unread" ? t("empty_unread_desc") : t("empty_category_desc")}
      </p>
    </div>
  );
});

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
