"use client";

import { useMemoizedFn } from "ahooks";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { type DialogSize, ViewDialog } from "@/components/dialogs";
import { type ResourceDefinition, useResourceDetail } from "@/lib/resource";

import type { ResourceActionsInput, ResourcePresentation, ResourceTranslateFn, ResourceViewSlotContext } from "./types";
import { buildResourceViewProps } from "./useResourceBridge";

export interface ResourceViewControllerProps<TItem extends { id: string | number }> {
	resource: ResourceDefinition<TItem, any, any, any, any>;
	presentation: ResourcePresentation;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	viewId: string | null;
	activeViewItem: TItem | null;
	size: DialogSize;
	allowFullscreen: boolean;
	onEdit?: (id: string) => void;
	viewTitle?: (entity: TItem | null) => ReactNode;
	viewDescription?: (entity: TItem | null) => ReactNode;
	viewBadge?: (entity: TItem | null) => ReactNode;
	viewActions?: ResourceActionsInput<TItem>;
	renderView: (ctx: ResourceViewSlotContext<TItem>) => ReactNode;
}

/**
 * 资源详情弹窗/抽屉控制器：按需延迟拉取单条详情并直接驱动 `ViewDialog`。
 */
export function ResourceViewController<TItem extends { id: string | number }>({
	resource,
	presentation,
	open,
	onOpenChange,
	viewId,
	activeViewItem,
	size,
	allowFullscreen,
	onEdit,
	viewTitle,
	viewDescription,
	viewBadge,
	viewActions,
	renderView,
}: ResourceViewControllerProps<TItem>) {
	const t = useTranslations(resource.i18nNamespace as never) as unknown as ResourceTranslateFn;
	const { data: fetchedEntity, isLoading } = useResourceDetail(resource, viewId ?? "", {
		enabled: Boolean(open && viewId),
	});

	const effectiveEntity = fetchedEntity ?? activeViewItem ?? null;

	const handleEdit = useMemoizedFn(() => {
		if (!onEdit || !effectiveEntity) return;
		onOpenChange(false);
		onEdit(String(effectiveEntity.id));
	});

	const viewProps = buildResourceViewProps({
		resource,
		t,
		entity: effectiveEntity,
		viewTitle,
		viewDescription,
		viewBadge,
		viewActions,
		isLoading,
		renderView,
	});

	return (
		<ViewDialog
			presentation={presentation}
			open={open}
			onOpenChange={onOpenChange}
			size={size}
			allowFullscreen={allowFullscreen}
			onEdit={onEdit && effectiveEntity ? handleEdit : undefined}
			{...viewProps}
		/>
	);
}
