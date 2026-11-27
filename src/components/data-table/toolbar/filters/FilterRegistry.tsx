"use client";

import { useTranslations } from "next-intl";

import type { DataTableFilterPanelProps } from "./types";

import { FilterLayoutShell } from "./FilterLayoutShell";
import { FilterRegistryBody } from "./FilterRegistryBody";
import { useFilterInference } from "./hooks/useFilterInference";
import { useFilterPanelState } from "./hooks/useFilterPanelState";

/**
 * FilterRegistry (Deep Module):
 * Schema-driven control mapper consolidating layout modes (popover / sheet / aboveContent),
 * preset controls (select / ternary / custom), and deferred draft commits behind a single module.
 */
export function FilterRegistry<TData = any>({
	columns,
	filterModel,
	onFilterModelChange,
	filterConfig,
	filters: directFilters,
	data,
}: DataTableFilterPanelProps<TData>) {
	const t = useTranslations("table");
	const layout = filterConfig?.layout ?? "popover";
	const deferFilters = filterConfig?.deferFilters ?? false;
	const sheetTitle = filterConfig?.sheetTitle ?? t("filter_title");
	const sheetDescription = filterConfig?.sheetDescription ?? t("filter_sheet_description");

	const { filterableColumns, resolvedFilters } = useFilterInference({
		columns,
		filters: directFilters,
		filterConfig,
		data,
	});

	const {
		open,
		setOpen,
		currentItems,
		activeCount,
		handleValueChange,
		handleAddRule,
		handleUpdateRule,
		handleRemoveRule,
		handleResetAll,
		handleApply,
	} = useFilterPanelState({
		filterModel,
		onFilterModelChange,
		deferFilters,
	});

	const columnsCount = filterConfig?.columns ?? (resolvedFilters.length >= 3 ? 3 : resolvedFilters.length >= 2 ? 2 : 1);
	const showQueryBuilder = Boolean(filterConfig?.showQueryBuilder);
	const showReset = currentItems.length > 0 || activeCount > 0;
	const handleClose = () => setOpen(false);

	return (
		<FilterLayoutShell
			layout={layout}
			open={open}
			onOpenChange={setOpen}
			activeCount={activeCount}
			showReset={showReset}
			columnsCount={columnsCount}
			deferFilters={deferFilters}
			sheetTitle={sheetTitle}
			sheetDescription={sheetDescription}
			onReset={handleResetAll}
			onApply={handleApply}
		>
			<FilterRegistryBody
				resolvedFilters={resolvedFilters}
				filterableColumns={filterableColumns}
				currentItems={currentItems}
				activeCount={activeCount}
				showReset={showReset}
				columnsCount={columnsCount}
				deferFilters={deferFilters}
				showQueryBuilder={showQueryBuilder}
				hideHeader={layout === "sheet"}
				hideFooter={layout === "sheet"}
				onValueChange={handleValueChange}
				onAddRule={handleAddRule}
				onUpdateRule={handleUpdateRule}
				onRemoveRule={handleRemoveRule}
				onReset={handleResetAll}
				onClose={handleClose}
				onApply={handleApply}
			/>
		</FilterLayoutShell>
	);
}

export const DataTableFilterPanel = FilterRegistry;
