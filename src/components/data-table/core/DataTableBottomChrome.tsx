"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import type { DataTableBatchActionBarProps } from "../footer/DataTableBatchActionBar";
import { DataTablePagination } from "../footer/DataTablePagination";
import type { DataTablePaginationModel } from "./types";

const LazyBatchActionBar = dynamic(() =>
	import("../footer/DataTableBatchActionBar").then((mod) => mod.DataTableBatchActionBar),
) as <TData = unknown>(props: DataTableBatchActionBarProps<TData>) => ReactNode;

export interface DataTableBottomChromeProps<TData> {
	hidePagination: boolean;
	paginationModel: DataTablePaginationModel;
	onPaginationModelChange: (model: DataTablePaginationModel) => void;
	totalRowCount: number;
	pageSizeOptions: readonly number[];
	paginationVariant: "capsule" | "shadcn" | "simple";
	checkboxSelection: boolean;
	selectedFullRows: TData[];
	clearSelection: () => void;
	batchActions?: (selectedRows: TData[], clearSelection: () => void) => ReactNode;
	statusText: string;
}

/**
 * DataTable 底部分页条、批量操作栏与无障碍状态播报切片。
 */
export function DataTableBottomChrome<TData>({
	hidePagination,
	paginationModel,
	onPaginationModelChange,
	totalRowCount,
	pageSizeOptions,
	paginationVariant,
	checkboxSelection,
	selectedFullRows,
	clearSelection,
	batchActions,
	statusText,
}: DataTableBottomChromeProps<TData>) {
	return (
		<>
			{!hidePagination ? (
				<DataTablePagination
					paginationModel={paginationModel}
					onPaginationModelChange={onPaginationModelChange}
					rowCount={totalRowCount}
					pageSizeOptions={pageSizeOptions}
					variant={paginationVariant}
				/>
			) : null}

			{checkboxSelection && selectedFullRows.length > 0 ? (
				<LazyBatchActionBar
					selectedRows={selectedFullRows}
					onClearSelection={clearSelection}
					batchActions={batchActions}
				/>
			) : null}

			<div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
				{statusText}
			</div>
		</>
	);
}
