import React from "react";

import type {
  DataTableColDef,
  DataTableFilterDefinition,
  DataTableFilterItem,
} from "../../../core/types";

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
  const filterField =
    definition.field ?? definition.name ?? definition.columnField ?? `filter-${index}`;
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
