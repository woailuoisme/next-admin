import { X } from "lucide-react";
import React from "react";

import type {
  DataTableColDef,
  DataTableFilterDefinition,
  DataTableFilterItem,
  DataTableFilterModel,
  DataTableSelectFilterOption,
} from "../../../core/types";

export interface ActiveFilterPillsProps<TData = any> {
  filterModel: DataTableFilterModel;
  onFilterModelChange: (model: DataTableFilterModel) => void;
  columns: DataTableColDef<TData>[];
  filters?: DataTableFilterDefinition[];
}

export const ActiveFilterPills: React.FC<ActiveFilterPillsProps> = ({
  filterModel,
  onFilterModelChange,
  columns,
  filters = [],
}) => {
  const activeItems = React.useMemo(() => {
    return (filterModel.items || []).filter(
      (item) =>
        item.operator === "isEmpty" ||
        item.operator === "isNotEmpty" ||
        (item.value !== undefined && item.value !== "" && item.value !== "__all__"),
    );
  }, [filterModel.items]);

  const quickFilterValues = filterModel.quickFilterValues?.filter((v) => v.trim().length > 0) || [];

  const totalActive = activeItems.length + (quickFilterValues.length > 0 ? 1 : 0);

  if (totalActive === 0) {
    return null;
  }

  const handleRemoveItem = (itemToRemove: DataTableFilterItem) => {
    onFilterModelChange({
      ...filterModel,
      items: (filterModel.items || []).filter((i) => i.id !== itemToRemove.id),
    });
  };

  const handleRemoveQuickFilter = () => {
    onFilterModelChange({
      ...filterModel,
      quickFilterValues: [],
    });
  };

  const handleClearAll = () => {
    onFilterModelChange({
      ...filterModel,
      items: [],
      quickFilterValues: [],
    });
  };

  const getPillText = (item: DataTableFilterItem) => {
    const col = columns.find((c) => c.field === item.field);
    const fieldName = col?.headerName || item.field;

    // Null check operators
    if (item.operator === "isEmpty") {
      return `${fieldName} is empty`;
    }
    if (item.operator === "isNotEmpty") {
      return `${fieldName} is not empty`;
    }

    // Find preset filter if available
    const filterDef = filters.find((f) => (f.field ?? f.name ?? f.columnField) === item.field);

    let displayVal = String(item.value);

    if (filterDef?.type === "select") {
      const opt = filterDef.options.find(
        (o: DataTableSelectFilterOption) => String(o.value) === String(item.value),
      );
      if (opt) {
        displayVal = opt.label;
      }
    } else if (filterDef?.type === "ternary") {
      if (item.value === true || item.value === "true") {
        displayVal = filterDef.trueLabel ?? "Yes";
      } else if (item.value === false || item.value === "false") {
        displayVal = filterDef.falseLabel ?? "No";
      }
    }

    const operatorLabels: Record<string, string> = {
      contains: "contains",
      notContains: "doesn't contain",
      equals: "=",
      notEquals: "!=",
      startsWith: "starts with",
      endsWith: "ends with",
      greaterThan: ">",
      greaterThanOrEqual: ">=",
      lessThan: "<",
      lessThanOrEqual: "<=",
    };

    const opLabel = operatorLabels[item.operator] || item.operator;
    return `${fieldName} ${opLabel} "${displayVal}"`;
  };

  return (
    <div
      className="border-border/40 bg-muted/20 flex flex-wrap items-center gap-1.5 border-b px-2.5 py-1.5 text-xs"
      data-testid="data-table-active-filters"
    >
      <span className="text-muted-foreground mr-1 text-[11px] font-medium">Active filters:</span>

      {/* Quick filter pill */}
      {quickFilterValues.length > 0 && (
        <span
          className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium"
          data-testid="active-filter-pill-quick-search"
        >
          <span>Search: &quot;{quickFilterValues.join(" ")}&quot;</span>
          <button
            type="button"
            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
            onClick={handleRemoveQuickFilter}
            aria-label="Remove search filter"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}

      {/* Filter items pills */}
      {activeItems.map((item, idx) => (
        <span
          key={item.id ?? `${item.field}_${item.operator}_${idx}`}
          className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium"
          data-testid={`active-filter-pill-${item.id ?? idx}`}
        >
          <span>{getPillText(item)}</span>
          <button
            type="button"
            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
            onClick={() => handleRemoveItem(item)}
            aria-label={`Remove filter ${item.field}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      {/* Clear All button */}
      {totalActive >= 2 && (
        <button
          type="button"
          onClick={handleClearAll}
          className="text-muted-foreground hover:text-destructive ml-1 cursor-pointer text-xs underline underline-offset-2 transition-colors"
          data-testid="clear-all-active-filters-btn"
        >
          Clear all
        </button>
      )}
    </div>
  );
};
