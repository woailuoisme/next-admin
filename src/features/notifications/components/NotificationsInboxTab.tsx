"use client";

import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
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

	let systemCount = 0;
	let orderCount = 0;
	let customerCount = 0;
	for (const item of items) {
		if (item.category === "system") systemCount++;
		else if (item.category === "order") orderCount++;
		else if (item.category === "customer") customerCount++;
	}

	const categoryTabs: { key: NotificationCategoryFilter; label: string; count: number }[] = [
		{ key: "all", label: t("tab_all"), count: items.length },
		{ key: "system", label: t("tab_system"), count: systemCount },
		{ key: "order", label: t("tab_order"), count: orderCount },
		{ key: "customer", label: t("tab_customer"), count: customerCount },
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
		const { failedIds } = await batchMarkReadMutation.mutateAsync(activeSelectedIds);
		setSelectedIds(failedIds);
	};

	const handleBatchDeleteConfirm = async () => {
		if (activeSelectedIds.length === 0) return;
		const { failedIds } = await batchDeleteMutation.mutateAsync(activeSelectedIds);
		setSelectedIds(failedIds);
	};

	const handleItemOpen = (item: NotificationItem) => {
		if (!item.read) {
			markAsReadMutation.mutate(item.id);
		}
		if (isSafeNotificationUrl(item.actionUrl)) {
			router.push(item.actionUrl);
		}
	};

	const emptyDescription = hasSearchOrCategoryFilter
		? t("empty_search_desc")
		: unreadOnly
			? t("empty_unread_desc")
			: t("empty_category_desc");

	return (
		<>
			<Card>
				<CardContent className="flex flex-col gap-4 p-4 sm:p-5">
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
						<div className="flex flex-col gap-3">
							{[1, 2, 3, 4].map((idx) => (
								<div key={idx} className="border-border flex items-start gap-3 rounded-lg border p-3.5">
									<Skeleton className="mt-1 size-4 rounded" />
									<Skeleton className="size-9 rounded-full" />
									<div className="flex flex-1 flex-col gap-2">
										<Skeleton className="h-4 w-48" />
										<Skeleton className="h-3.5 w-full max-w-md" />
									</div>
								</div>
							))}
						</div>
					) : filteredItems.length === 0 ? (
						<Empty className="border-dashed py-12">
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<Bell aria-hidden="true" />
								</EmptyMedia>
								<EmptyTitle className="text-sm">{t("empty_title")}</EmptyTitle>
								<EmptyDescription className="max-w-sm text-xs">{emptyDescription}</EmptyDescription>
							</EmptyHeader>
							{hasAnyFilter ? (
								<EmptyContent>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleClearFilters}
										className="cursor-pointer"
									>
										{t("clear_filters")}
									</Button>
								</EmptyContent>
							) : null}
						</Empty>
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
