"use client";

import dynamic from "next/dynamic";
import type { CSSProperties } from "react";

import { Table, TableFooter } from "@/components/ui/table";
import { cn } from "cn";

import { DataTableBody } from "../body/DataTableBody";
import type { DataTableSummaryRowProps } from "../footer/DataTableSummaryRow";
import { DataTableHeader } from "../header/DataTableHeader";
import { DataTableBackdropLoader } from "../overlays/DataTableOverlays";
import { DEFAULT_PAGE_SIZE_OPTIONS, EMPTY_RECORD } from "./constants";
import { DataTableBottomChrome } from "./DataTableBottomChrome";
import { DataTableProvider } from "./DataTableContext";
import { DataTableTopChrome } from "./DataTableTopBar";
import type { DataTableProps } from "./types";
import { useDataTableSetup } from "./useDataTableSetup";

const LazySummaryRow = dynamic<DataTableSummaryRowProps<Record<string, any>>>(() =>
	import("../footer/DataTableSummaryRow").then((mod) => mod.DataTableSummaryRow),
) as <TData extends Record<string, any> = Record<string, any>>(
	props: DataTableSummaryRowProps<TData>,
) => React.ReactNode;

export function DataTable<TData extends Record<string, any> = Record<string, any>>(props: DataTableProps<TData>) {
	const {
		checkboxSelection = false,
		renderExpandedRow,
		pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
		hidePagination = false,
		paginationVariant = "capsule",
		filterConfig,
		filters,
		tabs,
		activeTab,
		defaultActiveTab,
		onTabChange,
		savedViews,
		defaultSavedViews,
		onSavedViewsChange,
		enableSavedViews,
		storageKey,
		showToolbar = true,
		summaryRow = false,
		virtualize = false,
		maxHeight,
		batchActions,
		className,
		tableClassName,
		slots = EMPTY_RECORD,
		slotProps = EMPTY_RECORD,
	} = props;

	const {
		rows,
		loading,
		density,
		handleDensityChange,
		tableContainerRef,
		engine,
		rowVirtualizer,
		onSelectAllOnPage,
		contextValue,
		resolvedLoadingText,
		statusText,
	} = useDataTableSetup(props);

	return (
		<DataTableProvider value={contextValue}>
			<div
				className={cn(
					"relative flex w-full max-w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-xs transition-colors",
					className,
				)}
			>
				<DataTableTopChrome
					showToolbar={showToolbar}
					slots={slots}
					slotProps={slotProps}
					rows={rows}
					normalizedColumns={engine.normalizedColumns}
					visibleColumns={engine.visibleColumns}
					selectedFullRows={engine.selectedFullRows}
					processedRows={engine.processedRows}
					columnVisibility={engine.columnVisibility}
					onColumnVisibilityChange={engine.handleColumnVisibilityChange}
					filterModel={engine.filterModel}
					onFilterModelChange={engine.handleFilterModelChange}
					sortModel={engine.sortModel}
					onSortModelChange={engine.handleSortModelChange}
					quickFilterText={engine.quickFilterText}
					onQuickFilterChange={engine.handleQuickFilterChange}
					density={density}
					onDensityChange={handleDensityChange}
					filterConfig={filterConfig}
					filters={filters}
					tabs={tabs}
					activeTab={activeTab}
					defaultActiveTab={defaultActiveTab}
					onTabChange={onTabChange}
					savedViews={savedViews}
					defaultSavedViews={defaultSavedViews}
					onSavedViewsChange={onSavedViewsChange}
					enableSavedViews={enableSavedViews}
					storageKey={storageKey}
				/>

				<div
					ref={tableContainerRef}
					style={{
						maxHeight: maxHeight ?? (virtualize ? "560px" : undefined),
						...(engine.containerColumnStyles as CSSProperties),
					}}
					className="relative w-full max-w-full min-w-0 overflow-auto [&_[data-slot=table-container]]:overflow-visible"
				>
					{loading && engine.pagedRows.length > 0 ? (
						<DataTableBackdropLoader slots={slots} loadingText={resolvedLoadingText} />
					) : null}

					<Table
						className={cn("w-full border-collapse", tableClassName)}
						aria-busy={loading}
						inert={loading && engine.pagedRows.length > 0}
					>
						<DataTableHeader
							table={engine.table}
							isAllPageSelected={engine.isAllPageSelected}
							isSomePageSelected={engine.isSomePageSelected}
							onSelectAll={onSelectAllOnPage}
							sortModel={engine.sortModel}
						/>
						<DataTableBody
							loading={loading}
							virtualize={virtualize}
							pagedRows={engine.pagedRows}
							selectionSet={engine.selectionSet}
							expandedSet={renderExpandedRow ? engine.expandedSet : undefined}
							rowVirtualizer={rowVirtualizer}
							isFiltered={engine.isFiltered}
							onResetFilters={engine.handleResetFilters}
							skeletonRowCount={engine.paginationModel.pageSize}
						/>
						{summaryRow && engine.pagedRows.length > 0 && !loading ? (
							<TableFooter className="border-border/80 bg-muted/90 sticky bottom-0 z-20 border-t-2 backdrop-blur-xs">
								<LazySummaryRow rows={engine.processedRows} />
							</TableFooter>
						) : null}
					</Table>
				</div>

				<DataTableBottomChrome
					slots={slots}
					hidePagination={hidePagination}
					paginationModel={engine.paginationModel}
					onPaginationModelChange={engine.handlePaginationModelChange}
					totalRowCount={engine.totalRowCount}
					pageSizeOptions={pageSizeOptions}
					paginationVariant={paginationVariant}
					checkboxSelection={checkboxSelection}
					selectedFullRows={engine.selectedFullRows}
					clearSelection={engine.clearSelection}
					batchActions={batchActions}
					statusText={statusText}
				/>
			</div>
		</DataTableProvider>
	);
}
