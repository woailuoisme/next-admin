"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { type DialogSize, ViewDialog } from "@/components/dialogs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
	const tResource = useTranslations("resource");
	const shouldFetchDetail = Boolean(open && viewId);
	const {
		data: fetchedEntity,
		isLoading,
		isError,
		refetch,
	} = useResourceDetail(resource, viewId ?? "", {
		enabled: shouldFetchDetail,
	});

	const effectiveEntity = fetchedEntity ?? activeViewItem ?? null;
	const isDetailError = Boolean(shouldFetchDetail && isError && !effectiveEntity);
	const isDetailNotFound = Boolean(shouldFetchDetail && !isLoading && !isDetailError && !effectiveEntity);

	const handleEdit = () => {
		if (!onEdit || !effectiveEntity) return;
		onOpenChange(false);
		onEdit(String(effectiveEntity.id));
	};

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

	const errorFallback =
		isDetailError || isDetailNotFound ? (
			<Alert variant="destructive">
				<AlertCircle aria-hidden="true" />
				<AlertDescription className="flex flex-col gap-3">
					<span>{isDetailError ? tResource("detail_load_error") : tResource("detail_not_found")}</span>
					{isDetailError ? (
						<div>
							<Button type="button" variant="outline" size="xs" onClick={() => void refetch()}>
								{tResource("retry")}
							</Button>
						</div>
					) : null}
				</AlertDescription>
			</Alert>
		) : null;

	return (
		<ViewDialog
			presentation={presentation}
			open={open}
			onOpenChange={onOpenChange}
			size={size}
			allowFullscreen={allowFullscreen}
			onEdit={onEdit && effectiveEntity ? handleEdit : undefined}
			{...viewProps}
		>
			{errorFallback ?? viewProps.children}
		</ViewDialog>
	);
}
