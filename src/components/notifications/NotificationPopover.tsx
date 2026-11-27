import { ArrowRight, CheckCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PopoverContent } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "cn";

import { NotificationList } from "./NotificationList";
import { NOTIFICATION_TABS, type NotificationItem, type NotificationTabKey } from "./shared";

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

const TAB_TRIGGER_CLASS =
	"relative h-9 rounded-none border-b-2 border-transparent px-3 text-xs font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none";

export function NotificationHeader({
	unreadCount,
	isMarkingAllAsRead,
	onMarkAllAsRead,
	className,
}: NotificationHeaderProps) {
	const t = useTranslations("notification");

	return (
		<div
			className={cn(
				"flex items-center justify-between border-b border-border/50 bg-background/90 px-4 py-3",
				className,
			)}
		>
			<div className="flex items-center gap-2">
				<span className="text-foreground text-sm font-semibold tracking-tight">{t("title")}</span>
				{unreadCount > 0 ? (
					<Badge
						variant="secondary"
						className="border-primary/20 bg-primary/10 text-primary h-5 rounded-full border px-2 text-[11px] font-semibold"
					>
						{t("unread_count", { count: unreadCount })}
					</Badge>
				) : (
					<Badge
						variant="secondary"
						className="text-muted-foreground/80 bg-muted/60 h-5 rounded-full px-2 text-[11px] font-normal"
					>
						{t("all_synced")}
					</Badge>
				)}
			</div>

			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={onMarkAllAsRead}
				disabled={unreadCount === 0 || isMarkingAllAsRead}
				className="text-muted-foreground hover:text-foreground hover:bg-muted/60 text-xs font-normal transition-colors"
			>
				<CheckCheck data-icon="inline-start" aria-hidden="true" />
				{t("mark_all_read")}
			</Button>
		</div>
	);
}

export function NotificationTabs({ activeTab, unreadCount = 0, onTabChange, className }: NotificationTabsProps) {
	const t = useTranslations("notification");

	const handleValueChange = (val: string) => {
		onTabChange(val as NotificationTabKey);
	};

	return (
		<div className={cn("border-b border-border/40 px-3", className)}>
			<Tabs value={activeTab} onValueChange={handleValueChange} className="w-full">
				<TabsList className="flex h-9 w-full items-center justify-start gap-1 rounded-none bg-transparent p-0">
					{NOTIFICATION_TABS.map(({ key, labelKey }) => (
						<TabsTrigger key={key} value={key} className={TAB_TRIGGER_CLASS}>
							<span>{t(labelKey)}</span>
							{key === "unread" && unreadCount > 0 && (
								<Badge
									variant="secondary"
									className="bg-primary/10 text-primary h-4 min-w-4 rounded-full border-0 px-1 text-[10px] font-semibold"
								>
									{unreadCount}
								</Badge>
							)}
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>
		</div>
	);
}

export function NotificationFooter({ total, onGotoOverview, className }: NotificationFooterProps) {
	const t = useTranslations("notification");

	return (
		<div
			className={cn(
				"flex items-center justify-between border-t border-border/50 bg-muted/15 px-4 py-2.5 text-xs text-muted-foreground",
				className,
			)}
		>
			<span className="text-[11px]">{t("total_records", { count: total })}</span>
			<Button
				type="button"
				variant="ghost"
				size="xs"
				onClick={onGotoOverview}
				className="text-muted-foreground hover:text-foreground h-auto p-0 text-xs font-normal hover:bg-transparent"
			>
				{t("goto_overview")}
				<ArrowRight
					data-icon="inline-end"
					className="transition-transform duration-150 group-hover/button:translate-x-0.5"
					aria-hidden="true"
				/>
			</Button>
		</div>
	);
}

export function NotificationPopover({
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
}
