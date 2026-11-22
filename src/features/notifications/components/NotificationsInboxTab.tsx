"use client";

import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
	useBatchDeleteNotificationsMutation,
	useBatchMarkNotificationsReadMutation,
	useDeleteNotificationMutation,
	useMarkAsReadMutation,
} from "../hooks";
import type { NotificationItem } from "../types";
import { type NotificationCategoryFilter, NotificationInboxFilterBar } from "./NotificationInboxFilterBar";
import { isSafeNotificationUrl, NotificationRowItem } from "./NotificationRowItem";

export interface NotificationsInboxTabProps {
	items: NotificationItem[];
	isLoading: boolean;
}

export function NotificationsInboxTab({ items, isLoading }: NotificationsInboxTabProps) {
	const t = useTranslations("notification");
	const tDialog = useTranslations("dialog");
	const router = useRouter();

	const [categoryFilter, setCategoryFilter] = useState<NotificationCategoryFilter>("all");
	const [unreadOnly, setUnreadOnly] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [confirmBatchDeleteOpen, setConfirmBatchDeleteOpen] = useState(false);

	const markAsReadMutation = useMarkAsReadMutation();
	const deleteMutation = useDeleteNotificationMutation();
	const batchMarkReadMutation = useBatchMarkNotificationsReadMutation({
		successMessage: (count) => t("batch_mark_read_success", { count }),
	});
	const batchDeleteMutation = useBatchDeleteNotificationsMutation({
		successMessage: (count) => t("batch_delete_success", { count }),
	});

	const normalizedSearch = searchQuery.trim().toLowerCase();
	const filteredItems = items.filter((item) => {
		if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
		if (unreadOnly && item.read) return false;
		if (normalizedSearch) {
			const matchesTitle = item.title.toLowerCase().includes(normalizedSearch);
			const matchesDesc = item.description.toLowerCase().includes(normalizedSearch);
			if (!matchesTitle && !matchesDesc) return false;
		}
		return true;
	});

	const visibleIdSet = new Set(filteredItems.map((i) => i.id));
	const activeSelectedIds = selectedIds.filter((id) => visibleIdSet.has(id));
	const allVisibleSelected = filteredItems.length > 0 && activeSelectedIds.length === filteredItems.length;
	const hasSearchOrCategoryFilter = categoryFilter !== "all" || normalizedSearch.length > 0;
	const hasAnyFilter = hasSearchOrCategoryFilter || unreadOnly;

	const categoryTabs: { key: NotificationCategoryFilter; label: string; count: number }[] = [
		{ key: "all", label: t("tab_all"), count: items.length },
		{ key: "system", label: t("tab_system"), count: items.filter((i) => i.category === "system").length },
		{ key: "order", label: t("tab_order"), count: items.filter((i) => i.category === "order").length },
		{ key: "customer", label: t("tab_customer"), count: items.filter((i) => i.category === "customer").length },
	];

	const handleToggleSelectAll = (checked: boolean) => {
		setSelectedIds(checked ? filteredItems.map((item) => item.id) : []);
	};

	const handleToggleSelectOne = (id: string, checked: boolean) => {
		setSelectedIds((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((item) => item !== id)));
	};

	const handleClearFilters = () => {
		setCategoryFilter("all");
		setUnreadOnly(false);
		setSearchQuery("");
	};

	const handleBatchMarkRead = async () => {
		if (activeSelectedIds.length === 0) return;
		await batchMarkReadMutation.mutateAsync(activeSelectedIds);
		setSelectedIds([]);
	};

	const handleBatchDeleteConfirm = async () => {
		if (activeSelectedIds.length === 0) return;
		await batchDeleteMutation.mutateAsync(activeSelectedIds);
		setSelectedIds([]);
	};

	const handleItemOpen = (item: NotificationItem) => {
		if (!item.read) {
			markAsReadMutation.mutate(item.id);
		}
		if (isSafeNotificationUrl(item.actionUrl)) {
			router.push(item.actionUrl);
		}
	};

	return (
		<>
			<Card>
				<CardContent className="space-y-4 p-4 sm:p-5">
					<NotificationInboxFilterBar
						categoryFilter={categoryFilter}
						onCategoryChange={(next) => {
							setCategoryFilter(next);
							setSelectedIds([]);
						}}
						categoryTabs={categoryTabs}
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						unreadOnly={unreadOnly}
						onUnreadOnlyChange={setUnreadOnly}
						hasAnyFilter={hasAnyFilter}
						onClearFilters={handleClearFilters}
						filteredCount={filteredItems.length}
						selectedCount={activeSelectedIds.length}
						allVisibleSelected={allVisibleSelected}
						onToggleSelectAll={handleToggleSelectAll}
						isBatchMarkReadPending={batchMarkReadMutation.isPending}
						isBatchDeletePending={batchDeleteMutation.isPending}
						onBatchMarkRead={() => void handleBatchMarkRead()}
						onOpenBatchDeleteConfirm={() => setConfirmBatchDeleteOpen(true)}
					/>

					{isLoading ? (
						<div className="space-y-3">
							{[1, 2, 3, 4].map((idx) => (
								<div key={idx} className="border-border flex items-start gap-3 rounded-lg border p-3.5">
									<Skeleton className="mt-1 size-4 rounded" />
									<Skeleton className="size-9 rounded-full" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-48" />
										<Skeleton className="h-3.5 w-full max-w-md" />
									</div>
								</div>
							))}
						</div>
					) : filteredItems.length === 0 ? (
						<div className="border-border/70 flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
							<div className="bg-muted mb-3 flex size-11 items-center justify-center rounded-full">
								<Bell className="text-muted-foreground size-5" />
							</div>
							<p className="text-foreground text-sm font-medium">{t("empty_title")}</p>
							<p className="text-muted-foreground mt-1 max-w-sm text-xs">
								{hasSearchOrCategoryFilter
									? t("empty_search_desc")
									: unreadOnly
										? t("empty_unread_desc")
										: t("empty_category_desc")}
							</p>
							{hasAnyFilter ? (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleClearFilters}
									className="mt-4 cursor-pointer"
								>
									{t("clear_filters")}
								</Button>
							) : null}
						</div>
					) : (
						<div className="divide-border border-border divide-y overflow-hidden rounded-lg border">
							{filteredItems.map((item) => (
								<NotificationRowItem
									key={item.id}
									item={item}
									selected={activeSelectedIds.includes(item.id)}
									onToggleSelect={handleToggleSelectOne}
									onOpen={handleItemOpen}
									onMarkRead={(id) => markAsReadMutation.mutate(id)}
									onDelete={(id) => deleteMutation.mutate(id)}
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<ConfirmDialog
				open={confirmBatchDeleteOpen}
				onOpenChange={setConfirmBatchDeleteOpen}
				title={t("batch_delete_confirm_title")}
				description={t("batch_delete_confirm_desc", { count: activeSelectedIds.length })}
				confirmText={t("batch_delete")}
				cancelText={tDialog("cancel")}
				isPending={batchDeleteMutation.isPending}
				onConfirm={handleBatchDeleteConfirm}
			/>
		</>
	);
}
