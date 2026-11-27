"use client";

import { useState } from "react";

import { Popover } from "@/components/ui/popover";

import { NotificationPopover } from "./NotificationPopover";
import { NotificationTrigger } from "./NotificationTrigger";
import type { NotificationItem, NotificationTabKey } from "./shared";

export interface NotificationBellProps {
	className?: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	activeTab?: NotificationTabKey;
	onTabChange?: (tab: NotificationTabKey) => void;
	unreadCount?: number;
	totalCount?: number;
	items?: NotificationItem[];
	isLoading?: boolean;
	isMarkingAllAsRead?: boolean;
	onPrefetch?: () => void;
	onMarkAllRead?: (e: React.MouseEvent) => void;
	onMarkAsRead?: (id: string) => void;
	onDelete?: (id: string) => void;
	onItemClick?: (item: NotificationItem) => void;
	onGotoOverview?: () => void;
}

const EMPTY_ITEMS: NotificationItem[] = [];
const NOOP = () => {};

/**
 * 纯 UI 通知铃铛组件（领域无关）：
 * 数据查询与实时推送由调用方或业务容器（如 ConnectedNotificationBell）通过 Props 注入。
 */
export function NotificationBell({
	className,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
	activeTab: controlledActiveTab,
	onTabChange: controlledOnTabChange,
	unreadCount = 0,
	totalCount = 0,
	items = EMPTY_ITEMS,
	isLoading = false,
	isMarkingAllAsRead = false,
	onPrefetch,
	onMarkAllRead,
	onMarkAsRead,
	onDelete,
	onItemClick,
	onGotoOverview,
}: NotificationBellProps = {}) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
	const [uncontrolledTab, setUncontrolledTab] = useState<NotificationTabKey>("all");

	const open = controlledOpen ?? uncontrolledOpen;
	const activeTab = controlledActiveTab ?? uncontrolledTab;

	const handleOpenChange = (nextOpen: boolean) => {
		if (controlledOpen === undefined) {
			setUncontrolledOpen(nextOpen);
		}
		controlledOnOpenChange?.(nextOpen);
	};

	const handleTabChange = (nextTab: NotificationTabKey) => {
		if (controlledActiveTab === undefined) {
			setUncontrolledTab(nextTab);
		}
		controlledOnTabChange?.(nextTab);
	};

	const handleMarkAllRead = (e: React.MouseEvent) => {
		e.stopPropagation();
		onMarkAllRead?.(e);
	};

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<NotificationTrigger unreadCount={unreadCount} onPrefetch={onPrefetch} className={className} />
			<NotificationPopover
				unreadCount={unreadCount}
				totalCount={totalCount}
				activeTab={activeTab}
				items={items}
				isLoading={isLoading}
				isMarkingAllAsRead={isMarkingAllAsRead}
				onTabChange={handleTabChange}
				onMarkAllAsRead={handleMarkAllRead}
				onMarkAsRead={onMarkAsRead}
				onDelete={onDelete}
				onItemClick={onItemClick ?? NOOP}
				onGotoOverview={onGotoOverview ?? NOOP}
			/>
		</Popover>
	);
}
