"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useMemoizedFn } from "ahooks";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
	NotificationBell,
	type NotificationItem,
	type NotificationTabKey,
	resolveNotificationTabFilters,
} from "@/components/notifications";

import {
	useDeleteNotificationMutation,
	useMarkAllAsReadMutation,
	useMarkAsReadMutation,
	useNotifications,
	useRealtimeNotifications,
	useUnreadNotificationCount,
} from "../hooks";
import { notificationsEndpoint } from "../resource";

export interface ConnectedNotificationBellProps {
	className?: string;
}

const EMPTY_ITEMS: NotificationItem[] = [];

/**
 * 业务连接容器：绑定 notifications 域查询、突变与 Centrifuge 实时推送。
 */
export function ConnectedNotificationBell({ className }: ConnectedNotificationBellProps = {}) {
	const [open, setOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<NotificationTabKey>("all");
	const router = useRouter();
	const queryClient = useQueryClient();

	const { category: filterCategory, unreadOnly: filterUnread } = resolveNotificationTabFilters(activeTab);
	const filters = { category: filterCategory, unreadOnly: filterUnread };

	const { data: countData } = useUnreadNotificationCount();
	useRealtimeNotifications();

	const { data: listData, isLoading } = useNotifications(filters, { enabled: open });

	const markAsReadMutation = useMarkAsReadMutation();
	const markAllAsReadMutation = useMarkAllAsReadMutation();
	const deleteMutation = useDeleteNotificationMutation();

	const unreadCount = countData ?? listData?.unreadCount ?? 0;
	const items = listData?.items ?? EMPTY_ITEMS;
	const totalCount = listData?.total ?? 0;

	const handlePrefetch = useMemoizedFn(() => {
		void queryClient
			.prefetchQuery({
				...notificationsEndpoint.queries.list(filters),
				staleTime: 10000,
			})
			.catch(() => {});
	});

	const handleItemClick = useMemoizedFn((item: NotificationItem) => {
		if (!item.read) {
			markAsReadMutation.mutate(item.id);
		}
		if (
			item.actionUrl &&
			item.actionUrl.startsWith("/") &&
			!item.actionUrl.startsWith("//") &&
			!item.actionUrl.startsWith("/\\")
		) {
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

	const handleMarkAllRead = useMemoizedFn(() => {
		if (unreadCount > 0) {
			markAllAsReadMutation.mutate();
		}
	});

	const handleGotoOverview = useMemoizedFn(() => {
		setOpen(false);
		router.push("/notifications");
	});

	return (
		<NotificationBell
			className={className}
			open={open}
			onOpenChange={setOpen}
			activeTab={activeTab}
			onTabChange={setActiveTab}
			unreadCount={unreadCount}
			totalCount={totalCount}
			items={items}
			isLoading={isLoading}
			isMarkingAllAsRead={markAllAsReadMutation.isPending}
			onPrefetch={handlePrefetch}
			onMarkAllRead={handleMarkAllRead}
			onMarkAsRead={handleSingleMarkRead}
			onDelete={handleDelete}
			onItemClick={handleItemClick}
			onGotoOverview={handleGotoOverview}
		/>
	);
}
