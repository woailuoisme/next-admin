"use client";

import { useMemoizedFn } from "ahooks";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { ActionList, useActionResourceBridge } from "@/components/actions";
import { col } from "@/components/data-table/columns/col";
import { DataTable, type DataTableSlotProps, type TableStateAdapter } from "@/components/data-table/core";
import { useAccessControl } from "@/lib/resource";
import type { ResourceDefinition } from "@/lib/resource/types";

import { resolveResourceActionsInput } from "./useResourceBridge";
import type { ResourceTableSchema, ResourceTranslateFn } from "./types";

export interface ResourceTableProps<TItem extends { id: string | number }> {
	resource: ResourceDefinition<TItem, any, any, any, any>;
	schema: ResourceTableSchema<TItem>;
	tableState: TableStateAdapter<TItem>;
	/** 独立单测场景（未包在 ResourceScaffold 内）可显式注入，用于 onRowClick */
	onRowView?: (id: string) => void;
	onRowEdit?: (id: string) => void;
}

/**
 * 声明式表格渲染引擎（Filament v5 Table + Actions 统一范式）：
 * 统一接管列构造、过滤器、toolbarActions、rowActions（ActionList cell）、batchActions（ActionList batch）与行点击鉴权。
 */
export function ResourceTable<TItem extends { id: string | number }>({
	resource,
	schema,
	tableState,
	onRowView,
	onRowEdit,
}: ResourceTableProps<TItem>) {
	const t = useTranslations(resource.i18nNamespace as never) as unknown as ResourceTranslateFn;
	const { can } = useAccessControl();
	const resourceBridge = useActionResourceBridge();

	// 向 @tanstack/react-table ("use no memo") 与 React.memo(DataTableRow) 传递引用稳定的列与槽位配置
	const columns = useMemo(() => {
		const baseCols = schema.columns({ t });
		const resolvedRowActions = resolveResourceActionsInput(schema.rowActions, t);
		if (!resolvedRowActions?.length) return baseCols;

		const resolvedRowActionsCol = schema.rowActionsColumn
			? typeof schema.rowActionsColumn === "function"
				? schema.rowActionsColumn(t)
				: schema.rowActionsColumn
			: undefined;

		return [
			...baseCols,
			col.actions<TItem>({
				field: resolvedRowActionsCol?.field ?? "actions",
				headerName: resolvedRowActionsCol?.headerName,
				width: resolvedRowActionsCol?.width,
				align: resolvedRowActionsCol?.align,
				headerAlign: resolvedRowActionsCol?.headerAlign,
				pinned: resolvedRowActionsCol?.pinned ?? "right",
				maxInline: resolvedRowActionsCol?.maxInline,
				moreActionsLabel: resolvedRowActionsCol?.moreActionsLabel,
				actions: resolvedRowActions,
			}),
		];
	}, [schema, t]);

	// 解析过滤器与 toolbar 插槽配置
	const filters = schema.filters?.(t);
	const resolvedToolbarActions = resolveResourceActionsInput(schema.toolbarActions, t);

	const toolbarCustomActions = resolvedToolbarActions?.length ? (
		<div className="flex items-center gap-2">
			<ActionList actions={resolvedToolbarActions} surface="toolbar" />
			{schema.slotProps?.toolbar?.customActions}
		</div>
	) : (
		schema.slotProps?.toolbar?.customActions
	);

	const slotProps: DataTableSlotProps | undefined =
		!schema.exportFileName && !schema.slotProps && !resolvedToolbarActions?.length
			? undefined
			: {
					...schema.slotProps,
					toolbar: {
						...schema.slotProps?.toolbar,
						...(schema.exportFileName ? { exportFileName: schema.exportFileName } : {}),
						...(toolbarCustomActions ? { customActions: toolbarCustomActions } : {}),
					},
				};

	const getRowId = useMemoizedFn((row: TItem) => (schema.getRowId ? schema.getRowId(row) : String(row.id)));

	const effectiveOpenView = onRowView ?? resourceBridge?.openView;
	const effectiveOpenEdit = onRowEdit ?? resourceBridge?.openEdit;

	// 白名单：保持传入 React.memo(DataTableRow) 的行点击处理器引用稳定
	const handleRowClick = useMemo(() => {
		if (!schema.onRowClick) return undefined;
		if (schema.onRowClick === "view") {
			return (row: TItem) => {
				if (!can({ resource: resource.name, action: "view", record: row })) return;
				effectiveOpenView?.(String(row.id));
			};
		}
		const customClick = schema.onRowClick;
		return (row: TItem) =>
			customClick(row, {
				openView: (id) => effectiveOpenView?.(id),
				openEdit: (id) => effectiveOpenEdit?.(id),
			});
	}, [can, effectiveOpenEdit, effectiveOpenView, resource.name, schema]);

	const resolvedBatchActions = resolveResourceActionsInput(schema.batchActions, t);

	const renderBatchActions = resolvedBatchActions?.length
		? (selectedRows: TItem[], clearSelection: () => void) => (
				<ActionList
					actions={resolvedBatchActions}
					payload={selectedRows}
					surface="batch"
					clearSelection={clearSelection}
				/>
			)
		: undefined;

	return (
		<DataTable<TItem>
			state={tableState}
			columns={columns}
			getRowId={getRowId}
			checkboxSelection={schema.checkboxSelection ?? Boolean(resolvedBatchActions?.length)}
			pinnedColumns={schema.pinnedColumns}
			filters={filters}
			onRowClick={handleRowClick}
			slotProps={slotProps}
			batchActions={renderBatchActions}
		/>
	);
}
