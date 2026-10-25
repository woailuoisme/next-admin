import { cn } from "cn";
import React from "react";

import type { DataTableColDef, DataTableFilterDefinition, DataTableFilterItem } from "../../../core/types";

import { CustomFilterControl } from "./CustomFilterControl";
import { SelectFilterControl } from "./SelectFilterControl";
import { TernaryFilterControl } from "./TernaryFilterControl";

export interface FilterControlItemProps<TData = any> {
  definition: DataTableFilterDefinition;
  index: number;
  filterableColumns: DataTableColDef<TData>[];
  currentItems: DataTableFilterItem[];
  onSelectChange: (field: string, val: string) => void;
  onTernaryChange: (field: string, val: string) => void;
  onCustomChange: (field: string, val: any) => void;
}

export const FilterControlItem: React.FC<FilterControlItemProps> = ({
  definition,
  index,
  filterableColumns,
  currentItems,
  onSelectChange,
  onTernaryChange,
  onCustomChange,
}) => {
  const filterField = definition.field ?? definition.name ?? definition.columnField ?? `filter-${index}`;
  const col = filterableColumns.find((c) => c.field === filterField);
  const labelText = definition.label ?? col?.headerName ?? filterField;

  if (definition.type === "select") {
    const activeItem = currentItems.find((i) => i.field === filterField && i.operator === "equals");
    return (
      <div key={filterField} className="space-y-1.5">
        <label className="text-foreground text-xs font-medium">{labelText}</label>
        <SelectFilterControl
          definition={definition}
          value={activeItem?.value}
          onChange={(val) => onSelectChange(filterField, val)}
          ariaLabel={labelText}
        />
      </div>
    );
  }

  if (definition.type === "ternary") {
    const activeItem = currentItems.find((i) => i.field === filterField && i.operator === "equals");
    return (
      <div key={filterField} className="space-y-1.5">
        <label className="text-foreground text-xs font-medium">{labelText}</label>
        <TernaryFilterControl
          definition={definition}
          value={activeItem?.value}
          onChange={(val) => onTernaryChange(filterField, val)}
          ariaLabel={labelText}
        />
      </div>
    );
  }

  if (definition.type === "custom") {
    const activeItem = currentItems.find((i) => i.field === filterField);
    return (
      <div key={filterField} className="space-y-1.5">
        <label className="text-foreground text-xs font-medium">{labelText}</label>
        <CustomFilterControl
          definition={definition}
          value={activeItem?.value}
          onChange={(val) => onCustomChange(filterField, val)}
        />
      </div>
    );
  }

  return null;
};

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
  const columnsCount = explicitColumnsCount ?? (resolvedFilters.length >= 3 ? 3 : resolvedFilters.length >= 2 ? 2 : 1);

  if (resolvedFilters.length === 0) {
    return <p className="text-muted-foreground py-4 text-center text-xs">No filters available for this table.</p>;
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
