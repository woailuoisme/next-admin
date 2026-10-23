"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useMemoizedFn } from "ahooks";
import { memo, useState } from "react";

import { Popover } from "@/components/ui/popover";
import {
  fetchNotifications,
  notificationKeys,
  useDeleteNotificationMutation,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
  useNotifications,
  useRealtimeNotifications,
  useUnreadNotificationCount,
  type NotificationItem,
} from "@/features/notifications";

import type { NotificationTabKey } from "./shared";

import { NotificationPopover } from "./popover";
import { resolveNotificationTabFilters } from "./shared";
import { NotificationTrigger } from "./trigger";

export interface NotificationBellProps {
  className?: string;
}

const EMPTY_ITEMS: NotificationItem[] = [];

export const NotificationBell = memo(function NotificationBell({ className }: NotificationBellProps = {}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationTabKey>("all");
  const router = useRouter();
  const queryClient = useQueryClient();

  const { category: filterCategory, unreadOnly: filterUnread } = resolveNotificationTabFilters(activeTab);
  const filters = { category: filterCategory, unreadOnly: filterUnread };

  // 闭合态：轻量未读数
  const { data: countData } = useUnreadNotificationCount();

  // 实时推送监听：自动增量推送到 TanStack Query 缓存并触发 Toast
  useRealtimeNotifications();

  // 展开态：按需拉取详情列表
  const { data: listData, isLoading } = useNotifications(filters, { enabled: open });

  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();
  const deleteMutation = useDeleteNotificationMutation();

  const unreadCount = open ? (listData?.unreadCount ?? countData ?? 0) : (countData ?? listData?.unreadCount ?? 0);
  const items = listData?.items ?? EMPTY_ITEMS;
  const totalCount = listData?.total ?? 0;

  // 鼠标悬停预拉取
  const handlePrefetch = useMemoizedFn(() => {
    void queryClient
      .query({
        queryKey: notificationKeys.list(filters),
        queryFn: () => fetchNotifications(filters),
        staleTime: 10000,
      })
      .catch(() => {});
  });

  const handleItemClick = useMemoizedFn((item: NotificationItem) => {
    if (!item.read) {
      markAsReadMutation.mutate(item.id);
    }
    if (item.actionUrl) {
      setOpen(false);
      router.push(item.actionUrl);
    }
  });

  const handleSingleMarkRead = useMemoizedFn((id: string) => {
    markAsReadMutation.mutate(id);
  });

  const handleDelete = useMemoizedFn((id: string) => {
    deleteMutation.mutate(id);
  });

  const handleMarkAllRead = useMemoizedFn((e: React.MouseEvent) => {
    e.stopPropagation();
    if (unreadCount > 0) {
      markAllAsReadMutation.mutate();
    }
  });

  const handleGotoOverview = useMemoizedFn(() => {
    setOpen(false);
    router.push("/orders");
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <NotificationTrigger unreadCount={unreadCount} onPrefetch={handlePrefetch} className={className} />
      <NotificationPopover
        unreadCount={unreadCount}
        totalCount={totalCount}
        activeTab={activeTab}
        items={items}
        isLoading={isLoading}
        isMarkingAllAsRead={markAllAsReadMutation.isPending}
        onTabChange={setActiveTab}
        onMarkAllAsRead={handleMarkAllRead}
        onMarkAsRead={handleSingleMarkRead}
        onDelete={handleDelete}
        onItemClick={handleItemClick}
        onGotoOverview={handleGotoOverview}
      />
    </Popover>
  );
});
