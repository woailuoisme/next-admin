import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode } from "react";

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";

import { NotificationItemRow } from "./NotificationItemRow";
import type { NotificationItem, NotificationTabKey } from "./shared";

export interface NotificationListProps {
	items: NotificationItem[];
	isLoading: boolean;
	activeTab: NotificationTabKey;
	onItemClick: (item: NotificationItem) => void;
	onMarkAsRead?: (id: string) => void;
	onDelete?: (id: string) => void;
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

export function NotificationSkeleton({ count = 4, className }: NotificationSkeletonProps) {
	const tCommon = useTranslations("common");

	return (
		<div
			role="status"
			aria-busy="true"
			aria-label={tCommon("loading_page_aria")}
			className={cn("flex flex-col gap-2.5 p-2", className)}
			data-testid="notification-skeletons"
		>
			<span className="sr-only">{tCommon("loading_page_aria")}</span>
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} aria-hidden="true" className="mx-1 flex items-start gap-3 rounded-xl p-3">
					<Skeleton className="size-7.5 shrink-0 rounded-full" />
					<div className="flex flex-1 flex-col gap-1.5">
						<Skeleton className="h-3.5 w-3/4" />
						<Skeleton className="h-3 w-full" />
						<Skeleton className="h-2.5 w-1/4" />
					</div>
				</div>
			))}
		</div>
	);
}

export function NotificationEmptyState({ activeTab, className }: NotificationEmptyStateProps) {
	const t = useTranslations("notification");

	return (
		<Empty
			data-testid="notification-empty-state"
			className={cn("h-64 border-none p-6 text-muted-foreground", className)}
		>
			<EmptyHeader>
				<EmptyMedia
					variant="icon"
					className="bg-muted/60 text-muted-foreground/60 mb-1 size-12 rounded-full [&_svg:not([class*='size-'])]:size-6"
				>
					<Sparkles aria-hidden="true" />
				</EmptyMedia>
				<EmptyTitle className="text-foreground text-xs font-medium">{t("empty_title")}</EmptyTitle>
				<EmptyDescription className="text-muted-foreground max-w-[200px] text-[11px]">
					{activeTab === "unread" ? t("empty_unread_desc") : t("empty_category_desc")}
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}

export function NotificationList({
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
			<div className="flex flex-col gap-0.5 py-1" data-testid="notification-items-container">
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
}
