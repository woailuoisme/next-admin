import { memo, type ReactElement } from "react";

import type { DataTableFilterPanelProps } from "./types";

import { useFilterInference } from "./hooks/useFilterInference";
import { useFilterPanelState } from "./hooks/useFilterPanelState";
import { AboveContentFilterLayout } from "./layouts/AboveContentFilterLayout";
import { FilterPanelBody } from "./layouts/FilterPanelBody";
import { FilterTrigger } from "./layouts/FilterTrigger";
import { PopoverFilterLayout } from "./layouts/PopoverFilterLayout";
import { SheetFilterLayout } from "./layouts/SheetFilterLayout";

function DataTableFilterPanelInner<TData = any>({
  columns,
  filterModel,
  onFilterModelChange,
  filterConfig,
  filters: directFilters,
  data,
}: DataTableFilterPanelProps<TData>) {
  const layout = filterConfig?.layout ?? "popover";
  const deferFilters = filterConfig?.deferFilters ?? false;
  const sheetTitle = filterConfig?.sheetTitle ?? "Filters";
  const sheetDescription = filterConfig?.sheetDescription ?? "Filter and refine table records.";

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
    handleSelectChange,
    handleTernaryChange,
    handleCustomChange,
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

  const columnsCount =
    filterConfig?.columns ??
    (resolvedFilters.length >= 3 ? 3 : resolvedFilters.length >= 2 ? 2 : 1);
  const showQueryBuilder = Boolean(filterConfig?.showQueryBuilder);

  // Inline filter body (used by Popover & AboveContent)
  const filterBody = (
    <FilterPanelBody
      resolvedFilters={resolvedFilters}
      filterableColumns={filterableColumns}
      currentItems={currentItems}
      activeCount={activeCount}
      columnsCount={columnsCount}
      deferFilters={deferFilters}
      showQueryBuilder={showQueryBuilder}
      onSelectChange={handleSelectChange}
      onTernaryChange={handleTernaryChange}
      onCustomChange={handleCustomChange}
      onAddRule={handleAddRule}
      onUpdateRule={handleUpdateRule}
      onRemoveRule={handleRemoveRule}
      onReset={handleResetAll}
      onClose={() => setOpen(false)}
      onApply={handleApply}
    />
  );

  // 1. AboveContent layout (inline above table)
  if (layout === "aboveContent") {
    return <AboveContentFilterLayout>{filterBody}</AboveContentFilterLayout>;
  }

  const trigger = <FilterTrigger activeCount={activeCount} />;

  // 2. Sheet layout (Slide-over drawer)
  if (layout === "sheet") {
    return (
      <SheetFilterLayout
        open={open}
        onOpenChange={setOpen}
        trigger={trigger}
        sheetTitle={sheetTitle}
        sheetDescription={sheetDescription}
        activeCount={activeCount}
        showReset={currentItems.length > 0 || activeCount > 0}
        onReset={handleResetAll}
        deferFilters={deferFilters}
        onApply={handleApply}
      >
        <FilterPanelBody
          resolvedFilters={resolvedFilters}
          filterableColumns={filterableColumns}
          currentItems={currentItems}
          activeCount={activeCount}
          columnsCount={columnsCount}
          deferFilters={deferFilters}
          showQueryBuilder={showQueryBuilder}
          hideHeader
          hideFooter
          onSelectChange={handleSelectChange}
          onTernaryChange={handleTernaryChange}
          onCustomChange={handleCustomChange}
          onAddRule={handleAddRule}
          onUpdateRule={handleUpdateRule}
          onRemoveRule={handleRemoveRule}
          onReset={handleResetAll}
          onClose={() => setOpen(false)}
          onApply={handleApply}
        />
      </SheetFilterLayout>
    );
  }

  // 3. Popover layout (Default)
  return (
    <PopoverFilterLayout
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      columnsCount={columnsCount}
    >
      {filterBody}
    </PopoverFilterLayout>
  );
}

export const DataTableFilterPanel = memo(DataTableFilterPanelInner) as <TData = any>(
  props: DataTableFilterPanelProps<TData>,
) => ReactElement | null;
