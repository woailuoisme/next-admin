import { useMemoizedFn } from "ahooks";
import { ArrowRight, Check, Clock, ExternalLink, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "cn";

import { SEVERITY_BADGE_CLASSES, formatRelativeTime, getCategoryIconComponent, type NotificationItem } from "./shared";

export interface NotificationItemRowProps {
	item: NotificationItem;
	onItemClick: (item: NotificationItem) => void;
	onMarkAsRead?: (id: string) => void;
	onDelete?: (id: string) => void;
}

interface RowActionProps {
	label: string;
	Icon: React.ComponentType<{ className?: string }>;
	onClick: (e: React.MouseEvent) => void;
	className?: string;
}

/** 悬停工具栏图标按钮：统一 Tooltip 包裹与基础样式 */
function RowAction({ label, Icon, onClick, className }: RowActionProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={onClick}
					aria-label={label}
					className={cn("text-muted-foreground hover:bg-muted hover:text-foreground size-6 rounded", className)}
				>
					<Icon className="size-3.5" aria-hidden="true" />
				</Button>
			</TooltipTrigger>
			<TooltipContent side="top" className="text-[11px]">
				{label}
			</TooltipContent>
		</Tooltip>
	);
}

export function NotificationItemRow({ item, onItemClick, onMarkAsRead, onDelete }: NotificationItemRowProps) {
	const t = useTranslations("notification");
	const locale = useLocale();
	const { Icon, className: iconClassName } = getCategoryIconComponent(item.category, item.severity);
	const severityBgClass = SEVERITY_BADGE_CLASSES[item.severity];

	const handleClick = useMemoizedFn(() => {
		onItemClick(item);
	});

	const handleMarkRead = useMemoizedFn((e: React.MouseEvent) => {
		e.stopPropagation();
		onMarkAsRead?.(item.id);
	});

	const handleDelete = useMemoizedFn((e: React.MouseEvent) => {
		e.stopPropagation();
		onDelete?.(item.id);
	});

	const handleExternalAction = useMemoizedFn((e: React.MouseEvent) => {
		e.stopPropagation();
		handleClick();
	});

	const handleToolbarClick = useMemoizedFn((e: React.MouseEvent) => {
		e.stopPropagation();
	});

	const rowAriaLabel = item.read ? item.title : t("item_unread_aria", { title: item.title });

	return (
		<div
			data-testid={`notification-item-${item.id}`}
			className={cn(
				"group relative mx-1 flex items-start gap-3 rounded-xl p-3 transition-all duration-150",
				item.read
					? "text-muted-foreground hover:bg-muted/50"
					: "bg-primary/[0.03] text-foreground hover:bg-primary/[0.07]",
			)}
		>
			{/* 整行语义化 Stretched Trigger 兄弟节点：避免 <button> 包裹块级元素，并确保可访问名称纯净为标题 */}
			<button
				type="button"
				onClick={handleClick}
				aria-label={rowAriaLabel}
				className="focus-visible:ring-ring absolute inset-0 z-0 cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:outline-none"
			/>

			{/* 分类/级别精致微圆底图标 */}
			<div
				aria-hidden="true"
				className={cn(
					"pointer-events-none relative z-10 mt-0.5 flex size-7.5 shrink-0 items-center justify-center rounded-full transition-transform duration-150 group-hover:scale-105",
					severityBgClass,
				)}
			>
				<Icon className={iconClassName} />
			</div>

			{/* 文本及元信息 */}
			<div className="pointer-events-none relative z-10 min-w-0 flex-1 space-y-1">
				<div className="flex items-center justify-between gap-2">
					<div className="flex min-w-0 items-center gap-1.5">
						{!item.read && (
							<span
								aria-hidden="true"
								data-testid="notification-unread-dot"
								className="bg-primary size-1.5 shrink-0 rounded-full"
							/>
						)}
						<h4
							className={cn(
								"line-clamp-1 text-xs leading-snug tracking-tight",
								item.read ? "font-medium text-foreground/85" : "font-semibold text-foreground",
							)}
						>
							{item.title}
						</h4>
					</div>

					{/* 时间戳（悬浮或键盘聚焦工具栏出现时淡出避免视觉冲突） */}
					<span className="text-muted-foreground/75 flex shrink-0 items-center gap-1 text-[10px] transition-opacity duration-150 group-focus-within:opacity-0 group-hover:opacity-0">
						<Clock className="size-2.5" aria-hidden="true" />
						{formatRelativeTime(item.createdAt, t, locale)}
					</span>
				</div>

				<p className="text-muted-foreground line-clamp-2 text-[11px] leading-relaxed">{item.description}</p>

				{/* 实体轻量标签入口 */}
				{item.actionLabel && (
					<div className="pt-0.5">
						<Badge
							variant="outline"
							className="bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors"
						>
							<span>{item.actionLabel}</span>
							<ArrowRight className="size-2.5" aria-hidden="true" />
						</Badge>
					</div>
				)}
			</div>

			{/* 悬停与键盘聚焦微型工具栏：移动端触屏默认可见，桌面端 hover/focus-within 渐显 */}
			<div
				className="border-border/50 bg-popover/95 pointer-events-auto absolute top-2.5 right-2.5 z-20 flex items-center gap-0.5 rounded-md border p-0.5 shadow-xs backdrop-blur-md transition-opacity sm:pointer-events-none sm:opacity-0 sm:group-focus-within:pointer-events-auto sm:group-focus-within:opacity-100 sm:group-hover:pointer-events-auto sm:group-hover:opacity-100"
				onClick={handleToolbarClick}
			>
				{!item.read && onMarkAsRead && <RowAction label={t("mark_as_read")} Icon={Check} onClick={handleMarkRead} />}

				{item.actionUrl && <RowAction label={t("open_details")} Icon={ExternalLink} onClick={handleExternalAction} />}

				{onDelete && (
					<RowAction
						label={t("delete")}
						Icon={Trash2}
						onClick={handleDelete}
						className="hover:bg-destructive/10 hover:text-destructive"
					/>
				)}
			</div>
		</div>
	);
}
