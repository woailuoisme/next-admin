import React from "react";

import type {
  DataTableColDef,
  DataTableFilterDefinition,
  DataTableFilterItem,
  DataTableFilterOperator,
} from "../../../core/types";

import { FilterControlGrid } from "../controls/FilterControlGrid";
import { QueryBuilderControl } from "../controls/QueryBuilderControl";
import { FilterPanelFooter } from "./FilterPanelFooter";
import { FilterPanelHeader } from "./FilterPanelHeader";

export interface FilterPanelBodyProps<TData = any> {
  resolvedFilters: DataTableFilterDefinition[];
  filterableColumns: DataTableColDef<TData>[];
  currentItems: DataTableFilterItem[];
  activeCount: number;
  columnsCount?: number;
  deferFilters?: boolean;
  showQueryBuilder?: boolean;
  title?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
  onSelectChange: (field: string, val: string) => void;
  onTernaryChange: (field: string, val: string) => void;
  onCustomChange: (field: string, val: any) => void;
  onAddRule?: (field: string, operator?: DataTableFilterOperator, value?: any) => void;
  onUpdateRule?: (id: string, patch: Partial<DataTableFilterItem>) => void;
  onRemoveRule?: (id: string) => void;
  onReset: () => void;
  onClose: () => void;
  onApply: () => void;
}

export const FilterPanelBody: React.FC<FilterPanelBodyProps> = ({
  resolvedFilters,
  filterableColumns,
  currentItems,
  activeCount,
  columnsCount,
  deferFilters = false,
  showQueryBuilder = false,
  title,
  hideHeader = false,
  hideFooter = false,
  onSelectChange,
  onTernaryChange,
  onCustomChange,
  onAddRule,
  onUpdateRule,
  onRemoveRule,
  onReset,
  onClose,
  onApply,
}) => {
  const showReset = currentItems.length > 0 || activeCount > 0;
  const queryBuilderRules = React.useMemo(
    () => currentItems.filter((item) => item.id?.startsWith("qb_")),
    [currentItems],
  );

  return (
    <div data-testid="data-table-filter-panel" className="space-y-4">
      {!hideHeader && (
        <FilterPanelHeader
          title={title}
          activeCount={activeCount}
          showReset={showReset}
          onReset={onReset}
        />
      )}

      <FilterControlGrid
        resolvedFilters={resolvedFilters}
        filterableColumns={filterableColumns}
        currentItems={currentItems}
        columnsCount={columnsCount}
        onSelectChange={onSelectChange}
        onTernaryChange={onTernaryChange}
        onCustomChange={onCustomChange}
      />

      {showQueryBuilder && onAddRule && onUpdateRule && onRemoveRule && (
        <QueryBuilderControl
          filterableColumns={filterableColumns}
          rules={queryBuilderRules}
          onAddRule={onAddRule}
          onUpdateRule={onUpdateRule}
          onRemoveRule={onRemoveRule}
        />
      )}

      {!hideFooter && (
        <FilterPanelFooter deferFilters={deferFilters} onClose={onClose} onApply={onApply} />
      )}
    </div>
  );
};
