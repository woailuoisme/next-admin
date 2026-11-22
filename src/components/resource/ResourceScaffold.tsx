"use client";

import { useMemoizedFn } from "ahooks";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { action, ActionList, ActionResourceProvider } from "@/components/actions";
import type { BaseTableSearchParams } from "@/components/data-table/core/tableSearchSchema";
import { useCan } from "@/lib/resource";

import type { ResourceFormController as ResourceFormControllerType } from "./ResourceFormController";
import type { ResourceViewController as ResourceViewControllerType } from "./ResourceViewController";
import type {
	ResourceFormSlotContext,
	ResourceScaffoldProps,
	ResourceStatsSlotContext,
	ResourceTableSlotContext,
	ResourceViewSlotContext,
} from "./types";
import { useResourceController } from "./useResourceController";
import {
	resolveResourceActionsInput,
	resolveResourcePresentation,
	safeResourceTranslate,
	useResourceBridge,
} from "./useResourceBridge";

const ResourceFormController = dynamic(() => import("./ResourceFormController").then((m) => m.ResourceFormController), {
	ssr: false,
}) as typeof ResourceFormControllerType;

const ResourceViewController = dynamic(() => import("./ResourceViewController").then((m) => m.ResourceViewController), {
	ssr: false,
}) as typeof ResourceViewControllerType;

export type {
	ResourceFormSlotContext,
	ResourceScaffoldProps,
	ResourceStatsSlotContext,
	ResourceTableSlotContext,
	ResourceViewSlotContext,
};

/**
 * Refine v5 + nuqs + Filament v5 统一资源页宿主：
 * 由 `useResourceController` 驱动表格查询、URL 参数与 Form/View 状态机。
 */
export function ResourceScaffold<
	TItem extends { id: string | number },
	TInput extends Record<string, unknown> = Record<string, unknown>,
	TFilters extends BaseTableSearchParams = BaseTableSearchParams,
	TListResponse = { items: TItem[]; total: number },
>({
	resource,
	search,
	title,
	description,
	createLabel,
	headerActions,
	formSize = "xl",
	viewSize = "md",
	allowFullscreen = true,
	onCreate,
	onEdit,
	onView,
	resolveFormDefaults,
	viewTitle,
	viewDescription,
	viewBadge,
	viewActions,
	renderStats,
	renderTable,
	renderForm,
	renderView,
}: ResourceScaffoldProps<TItem, TInput, TFilters, TListResponse>) {
	const router = useRouter();

	const canView = useCan(resource.name, "view");
	const canEdit = useCan(resource.name, "edit");
	const canDelete = useCan(resource.name, "delete");

	const ctrl = useResourceController<TItem, TFilters, TListResponse>({
		resource,
		search,
		onOpenCreate: onCreate,
		onOpenEdit: onEdit,
		onOpenView: onView,
	});

	const createPresentation = resolveResourcePresentation(resource.presentation, "create");
	const editPresentation = resolveResourcePresentation(resource.presentation, "edit");
	const viewPresentation = resolveResourcePresentation(resource.presentation, "view");

	const openCreate = useMemoizedFn(() => {
		if (createPresentation === "page") {
			if (onCreate) onCreate();
			else router.push(`${resource.basePath}/create`);
			return;
		}
		ctrl.modal.openCreate();
	});

	const openEdit = useMemoizedFn((id: string) => {
		if (editPresentation === "page") {
			if (onEdit) onEdit(id);
			else router.push(`${resource.basePath}/${id}/edit`);
			return;
		}
		ctrl.modal.openEdit(id);
	});

	const openView = useMemoizedFn((id: string) => {
		if (viewPresentation === "page") {
			if (onView) onView(id);
			else router.push(`${resource.basePath}/${id}`);
			return;
		}
		ctrl.modal.openView(id);
	});

	const { t, actionBridge } = useResourceBridge({
		resource,
		rows: ctrl.rows,
		createLabel,
		openCreate,
		openEdit,
		openView,
	});

	const resolvedTitle = title ?? safeResourceTranslate(t, resource.i18nKeys.heading) ?? resource.entityName;
	const resolvedDesc = description ?? safeResourceTranslate(t, resource.i18nKeys.headingDescription);

	const resolvedHeaderActions = resolveResourceActionsInput(headerActions, t) ?? (renderForm ? [action.create()] : []);

	const formPresentation = ctrl.modal.editId ? editPresentation : createPresentation;

	return (
		<ActionResourceProvider value={actionBridge}>
			<div className="space-y-6">
				<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">{resolvedTitle}</h1>
						{resolvedDesc ? <p className="text-muted-foreground mt-0.5 text-xs">{resolvedDesc}</p> : null}
					</div>
					{resolvedHeaderActions.length > 0 ? <ActionList actions={resolvedHeaderActions} surface="toolbar" /> : null}
				</div>

				{renderStats?.({
					rows: ctrl.rows,
					total: ctrl.total,
					rawResponse: ctrl.rawResponse,
					isLoading: ctrl.isLoading,
				})}

				{renderTable({
					tableState: ctrl.tableState,
					rows: ctrl.rows,
					total: ctrl.total,
					rawResponse: ctrl.rawResponse,
					isLoading: ctrl.isLoading,
					openCreate,
					openEdit,
					openView,
					canView,
					canEdit,
					canDelete,
				})}

				{renderForm && formPresentation !== "page" ? (
					<ResourceFormController
						resource={resource}
						presentation={formPresentation}
						open={ctrl.modal.isFormOpen}
						onOpenChange={ctrl.modal.handleFormOpenChange}
						editId={ctrl.modal.editId}
						entity={ctrl.modal.activeEditItem}
						size={formSize}
						allowFullscreen={allowFullscreen}
						resolveFormDefaults={resolveFormDefaults}
						renderForm={renderForm}
					/>
				) : null}

				{renderView && viewPresentation !== "page" ? (
					<ResourceViewController
						resource={resource}
						presentation={viewPresentation}
						open={ctrl.modal.isViewOpen}
						onOpenChange={ctrl.modal.handleViewOpenChange}
						viewId={ctrl.modal.viewId}
						activeViewItem={ctrl.modal.activeViewItem}
						size={viewSize}
						allowFullscreen={allowFullscreen}
						onEdit={canEdit && renderForm ? openEdit : undefined}
						viewTitle={viewTitle}
						viewDescription={viewDescription}
						viewBadge={viewBadge}
						viewActions={viewActions}
						renderView={renderView}
					/>
				) : null}
			</div>
		</ActionResourceProvider>
	);
}
