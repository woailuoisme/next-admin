import { Download } from "lucide-react";
import { useMemo } from "react";

import { col, type DataTableColDef, exportRowsAsJson, ResourceTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";

import type { Category } from "../types";

import { categoryQueries } from "../queries";
import { useTranslations } from "next-intl";

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
  },
};

const getCategoryRowId = (c: Category) => c.id;

const exportCategoriesJson = (selectedRows: Category[], clearSelection: () => void) =>
  exportRowsAsJson(selectedRows, `categories-${selectedRows.length}.json`, clearSelection);

export function CategoryTable({ categories, loading, total, onEditCategory, onDeleteCategory }: CategoryTableProps) {
  const t = useTranslations("categories");

  const columns = useMemo<DataTableColDef<Category>[]>(
    () => [
      col.text<Category>("name", t("col_name"), {
        width: 220,
        flex: 1,
        pinned: "left",
        weight: "semibold",
      }),
      col.text<Category>("slug", t("col_slug"), {
        width: 180,
        mono: true,
        copyable: true,
      }),
      col.text<Category>("description", t("col_description"), {
        width: 280,
        flex: 1,
        truncate: true,
      }),
      col.number<Category>("productCount", t("col_product_count"), {
        width: 160,
        suffix: t("unit_products"),
      }),
      col.actions<Category>({
        field: "__actions",
        headerName: t("col_actions"),
        width: 80,
        moreActionsLabel: t("col_actions"),
        crud: {
          onEdit: (row) => onEditCategory?.(row.id),
          onDelete: (row) => onDeleteCategory?.(row.id),
        },
      }),
    ],
    [onEditCategory, onDeleteCategory, t],
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
