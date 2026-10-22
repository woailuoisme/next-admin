import { Download } from "lucide-react";
import { useMemo } from "react";

import { col, type DataTableColDef, downloadBlob, ResourceTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";

import type { Category } from "../types";

import { categoryQueries } from "../queries";

export interface CategoryTableProps {
  categories?: Category[];
  loading?: boolean;
  total?: number;
  onEditCategory?: (id: string) => void;
  onDeleteCategory?: (id: string) => void;
}

const PINNED_COLUMNS = {
  left: ["name"],
  right: ["__actions"],
};

const SLOT_PROPS = {
  toolbar: {
    exportFileName: "categories-catalog.csv",
    quickFilterPlaceholder: "Filter categories in view...",
  },
};

const getCategoryRowId = (c: Category) => c.id;

function exportCategoriesJson(selectedRows: Category[], clearSelection: () => void) {
  downloadBlob(
    JSON.stringify(selectedRows, null, 2),
    `categories-${selectedRows.length}.json`,
    "application/json",
  );
  clearSelection();
}

export function CategoryTable({
  categories,
  loading,
  total,
  onEditCategory,
  onDeleteCategory,
}: CategoryTableProps) {
  const columns = useMemo<DataTableColDef<Category>[]>(
    () => [
      col.text<Category>("name", "Category Name", {
        width: 220,
        flex: 1,
        pinned: "left",
        weight: "semibold",
      }),
      col.text<Category>("slug", "Slug Identifier", {
        width: 180,
        mono: true,
        copyable: true,
      }),
      col.text<Category>("description", "Description", {
        width: 280,
        flex: 1,
        truncate: true,
      }),
      col.number<Category>("productCount", "Associated Items", {
        width: 160,
        aggregation: "sum",
        suffix: " products",
      }),
      col.actions<Category>({
        field: "__actions",
        headerName: "Actions",
        width: 80,
        moreActionsLabel: "Actions",
        crud: {
          onEdit: (row) => onEditCategory?.(row.id),
          onDelete: (row) => onDeleteCategory?.(row.id),
        },
      }),
    ],
    [onEditCategory, onDeleteCategory],
  );

  return (
    <ResourceTable<Category>
      queryOptions={!categories ? categoryQueries.list : undefined}
      data={categories}
      loading={loading}
      total={total}
      columns={columns}
      getRowId={getCategoryRowId}
      checkboxSelection
      paginationMode="client"
      pinnedColumns={PINNED_COLUMNS}
      summaryRow
      slotProps={SLOT_PROPS}
      batchActions={(selectedRows, clearSelection) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 rounded-full text-xs"
            onClick={() => exportCategoriesJson(selectedRows, clearSelection)}
          >
            <Download className="size-3.5" />
            <span>Export JSON ({selectedRows.length})</span>
          </Button>
        </div>
      )}
    />
  );
}
