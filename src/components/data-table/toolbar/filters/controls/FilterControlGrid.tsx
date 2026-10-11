import { cn } from "cn";
import React from "react";

import type { DataTableColDef, DataTableFilterDefinition, DataTableFilterItem } from "../../../core/types";

import { FilterControlItem } from "./FilterControlItem";

export interface FilterControlGridProps<TData = any> {
  resolvedFilters: DataTableFilterDefinition[];
  filterableColumns: DataTableColDef<TData>[];
  currentItems: DataTableFilterItem[];
  columnsCount?: number;
  onSelectChange: (field: string, val: string) => void;
  onTernaryChange: (field: string, val: string) => void;
  onCustomChange: (field: string, val: any) => void;
}

export const FilterControlGrid: React.FC<FilterControlGridProps> = ({
  resolvedFilters,
  filterableColumns,
  currentItems,
  columnsCount: explicitColumnsCount,
  onSelectChange,
  onTernaryChange,
  onCustomChange,
}) => {
  const columnsCount =
    explicitColumnsCount ?? (resolvedFilters.length >= 3 ? 3 : resolvedFilters.length >= 2 ? 2 : 1);

  if (resolvedFilters.length === 0) {
    return (
      <p className="text-muted-foreground py-4 text-center text-xs">No filters available for this table.</p>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-3.5",
        columnsCount === 1
          ? "grid-cols-1"
          : columnsCount === 3
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
            : columnsCount === 4
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2",
      )}
    >
      {resolvedFilters.map((def, idx) => (
        <FilterControlItem
          key={def.field ?? def.name ?? def.columnField ?? `filter-${idx}`}
          definition={def}
          index={idx}
          filterableColumns={filterableColumns}
          currentItems={currentItems}
          onSelectChange={onSelectChange}
          onTernaryChange={onTernaryChange}
          onCustomChange={onCustomChange}
        />
      ))}
    </div>
  );
};
