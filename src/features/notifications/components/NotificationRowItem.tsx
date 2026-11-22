"use client";

import { CheckCheck, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "cn";

import {
	formatRelativeTime,
	getCategoryIconComponent,
	SEVERITY_BADGE_CLASSES,
} from "@/components/notifications/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import type { NotificationCategory, NotificationItem } from "../types";

const CATEGORY_LABEL_KEY_MAP: Record<NotificationCategory, "tab_system" | "tab_order" | "tab_customer"> = {
	system: "tab_system",
	order: "tab_order",
	customer: "tab_customer",
};

export function isSafeNotificationUrl(url?: string): url is string {
	return Boolean(url && url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\"));
}

export interface NotificationRowItemProps {
	item: NotificationItem;
	selected: boolean;
	onToggleSelect: (id: string, checked: boolean) => void;
	onOpen: (item: NotificationItem) => void;
	onMarkRead: (id: string) => void;
	onDelete: (id: string) => void;
}

export function NotificationRowItem({
	item,
	selected,
	onToggleSelect,
	onOpen,
	onMarkRead,
	onDelete,
}: NotificationRowItemProps) {
	const t = useTranslations("notification");
	const locale = useLocale();
	const { Icon, className: iconClassName } = getCategoryIconComponent(item.category, item.severity);
	const severityBgClass = SEVERITY_BADGE_CLASSES[item.severity];
	const canNavigate = isSafeNotificationUrl(item.actionUrl);

	return (
		<div
			className={cn(
				"hover:bg-muted/40 flex items-start gap-3 p-3.5 transition-colors sm:p-4",
				!item.read && "bg-primary/5",
			)}
		>
			<Checkbox
				checked={selected}
				onCheckedChange={(checked) => onToggleSelect(item.id, checked === true)}
				aria-label={item.title}
				className="mt-1.5"
			/>

			<div className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full", severityBgClass)}>
				<Icon className={iconClassName} />
			</div>

			<div className="min-w-0 flex-1 space-y-1">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						{!item.read ? <span className="bg-primary size-2 shrink-0 rounded-full" aria-hidden="true" /> : null}
						<button
							type="button"
							onClick={() => onOpen(item)}
							className={cn(
								"text-left text-sm font-medium",
								canNavigate ? "hover:text-primary cursor-pointer hover:underline" : "cursor-default",
							)}
						>
							{item.title}
						</button>
						<Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal">
							{t(CATEGORY_LABEL_KEY_MAP[item.category] ?? "tab_system")}
						</Badge>
					</div>
					<span className="text-muted-foreground text-xs tabular-nums">
						{formatRelativeTime(item.createdAt, (k, v) => t(k as never, v as never), locale)}
					</span>
				</div>

				<p className="text-muted-foreground text-xs leading-relaxed">{item.description}</p>

				{canNavigate ? (
					<div className="flex items-center gap-2 pt-1">
						<Button
							type="button"
							variant="link"
							size="sm"
							onClick={() => onOpen(item)}
							className="h-auto cursor-pointer p-0 text-xs"
						>
							{item.actionLabel ?? t("open_details")}
						</Button>
					</div>
				) : null}
			</div>

			<div className="flex shrink-0 items-center gap-1">
				{!item.read ? (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => onMarkRead(item.id)}
						aria-label={t("mark_as_read")}
						title={t("mark_as_read")}
						className="text-muted-foreground hover:text-foreground size-8 cursor-pointer"
					>
						<CheckCheck className="size-4" />
					</Button>
				) : null}
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => onDelete(item.id)}
					aria-label={t("delete")}
					title={t("delete")}
					className="text-muted-foreground hover:text-destructive size-8 cursor-pointer"
				>
					<Trash2 className="size-4" />
				</Button>
			</div>
		</div>
	);
}
