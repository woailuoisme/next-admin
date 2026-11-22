"use client";

import { CheckCheck, Search, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { NotificationCategory } from "../types";

export type NotificationCategoryFilter = "all" | NotificationCategory;

export interface NotificationCategoryTabItem {
	key: NotificationCategoryFilter;
	label: string;
	count: number;
}

export interface NotificationInboxFilterBarProps {
	categoryFilter: NotificationCategoryFilter;
	onCategoryChange: (next: NotificationCategoryFilter) => void;
	categoryTabs: NotificationCategoryTabItem[];
	searchQuery: string;
	onSearchChange: (next: string) => void;
	unreadOnly: boolean;
	onUnreadOnlyChange: (checked: boolean) => void;
	hasAnyFilter: boolean;
	onClearFilters: () => void;
	filteredCount: number;
	selectedCount: number;
	allVisibleSelected: boolean;
	onToggleSelectAll: (checked: boolean) => void;
	isBatchMarkReadPending: boolean;
	isBatchDeletePending: boolean;
	onBatchMarkRead: () => void;
	onOpenBatchDeleteConfirm: () => void;
}

export function NotificationInboxFilterBar({
	categoryFilter,
	onCategoryChange,
	categoryTabs,
	searchQuery,
	onSearchChange,
	unreadOnly,
	onUnreadOnlyChange,
	hasAnyFilter,
	onClearFilters,
	filteredCount,
	selectedCount,
	allVisibleSelected,
	onToggleSelectAll,
	isBatchMarkReadPending,
	isBatchDeletePending,
	onBatchMarkRead,
	onOpenBatchDeleteConfirm,
}: NotificationInboxFilterBarProps) {
	const t = useTranslations("notification");

	return (
		<>
			<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
				<Tabs value={categoryFilter} onValueChange={(v) => onCategoryChange(v as NotificationCategoryFilter)}>
					<TabsList>
						{categoryTabs.map((tab) => (
							<TabsTrigger key={tab.key} value={tab.key} className="gap-1.5">
								{tab.label}
								<Badge variant="secondary" className="h-4 px-1 text-[10px]">
									{tab.count}
								</Badge>
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>

				<div className="flex flex-wrap items-center gap-3">
					<div className="relative min-w-60 flex-1 sm:w-64 sm:flex-initial">
						<Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
						<Input
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							placeholder={t("search_placeholder")}
							className="h-9 pr-8 pl-8 text-sm"
						/>
						{searchQuery ? (
							<button
								type="button"
								onClick={() => onSearchChange("")}
								aria-label={t("clear_filters")}
								className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer"
							>
								<X className="size-3.5" />
							</button>
						) : null}
					</div>

					<div className="flex items-center gap-2">
						<Switch id="notifications-unread-only" checked={unreadOnly} onCheckedChange={onUnreadOnlyChange} />
						<Label htmlFor="notifications-unread-only" className="cursor-pointer text-xs font-medium">
							{t("unread_only_label")}
						</Label>
					</div>

					{hasAnyFilter ? (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={onClearFilters}
							className="text-muted-foreground h-8 cursor-pointer px-2 text-xs"
						>
							{t("clear_filters")}
						</Button>
					) : null}
				</div>
			</div>

			<Separator />

			<div className="bg-muted/40 flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2">
				<div className="flex items-center gap-2.5">
					<Checkbox
						id="notifications-select-all"
						checked={allVisibleSelected}
						onCheckedChange={(checked) => onToggleSelectAll(checked === true)}
						disabled={filteredCount === 0}
					/>
					<Label htmlFor="notifications-select-all" className="cursor-pointer text-xs font-medium">
						{selectedCount > 0 ? t("selected_count", { count: selectedCount }) : t("select_all")}
					</Label>
				</div>

				{selectedCount > 0 ? (
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={isBatchMarkReadPending}
							onClick={onBatchMarkRead}
							className="h-7 cursor-pointer gap-1 px-2.5 text-xs"
						>
							<CheckCheck className="size-3.5" />
							{t("batch_mark_read")}
						</Button>
						<Button
							type="button"
							variant="destructive"
							size="sm"
							disabled={isBatchDeletePending}
							onClick={onOpenBatchDeleteConfirm}
							className="h-7 cursor-pointer gap-1 px-2.5 text-xs"
						>
							<Trash2 className="size-3.5" />
							{t("batch_delete")}
						</Button>
					</div>
				) : (
					<span className="text-muted-foreground text-xs">{t("total_records", { count: filteredCount })}</span>
				)}
			</div>
		</>
	);
}
