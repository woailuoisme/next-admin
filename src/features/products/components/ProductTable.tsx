import { Download, Trash2 } from "lucide-react";
import { useMemo } from "react";

import {
  BadgeCell,
  col,
  type DataTableColDef,
  type DataTableFilterDefinition,
  type DataTableRenderCellParams,
  exportRowsAsJson,
  ResourceTable,
} from "@/components/data-table";
import { Button } from "@/components/ui/button";

import type { Product } from "../types";

import { productQueries } from "../queries";
import { useTranslations } from "next-intl";

const STATUS_VARIANT_MAP: Record<string, "success" | "secondary"> = {
  active: "success",
  draft: "secondary",
};

const PINNED_COLUMNS = {
  left: ["imageUrl", "title"],
  right: ["actions"],
};

const SLOT_PROPS = {
  toolbar: {
    exportFileName: "products-catalog.csv",
  },
};

const getProductRowId = (row: Product) => row.id;

const exportProductsJson = (selectedRows: Product[], clearSelection: () => void) =>
  exportRowsAsJson(selectedRows, `products-selected-${selectedRows.length}.json`, clearSelection);

interface ProductTableProps {
  products?: Product[];
  total?: number;
  loading?: boolean;
  onEditProduct?: (productId: string) => void;
  onDeleteProduct?: (productId: string) => void;
  onBatchDelete?: (products: Product[]) => void;
}

export function ProductTable({
  products,
  total,
  loading,
  onEditProduct,
  onDeleteProduct,
  onBatchDelete,
}: ProductTableProps) {
  const t = useTranslations("products");

  const statusLabelMap = useMemo<Record<string, string>>(
    () => ({ active: t("status_active"), draft: t("status_draft") }),
    [t],
  );

  const productFilters = useMemo<DataTableFilterDefinition[]>(
    () => [
      {
        type: "select",
        field: "status",
        label: t("col_status"),
        placeholder: t("filter_status_placeholder"),
        options: [
          { label: t("status_active"), value: "active" },
          { label: t("status_draft"), value: "draft" },
        ],
      },
      {
        type: "select",
        field: "categoryName",
        label: t("col_category"),
        placeholder: t("filter_category_placeholder"),
        options: [
          { label: t("category_electronics"), value: "Electronics" },
          { label: t("category_clothing"), value: "Clothing" },
          { label: t("category_home"), value: "Home" },
          { label: t("category_accessories"), value: "Accessories" },
        ],
      },
    ],
    [t],
  );

  const columns = useMemo<DataTableColDef<Product>[]>(
    () => [
      col.avatar<Product>("imageUrl", t("col_item"), {
        width: 70,
        pinned: "left",
        shape: "rounded",
        size: "md",
      }),
      col.text<Product>("title", t("col_product_info"), {
        description: (r) => r.slug,
        copyable: (r) => r.slug,
        flex: 1,
        width: 260,
        pinned: "left",
        weight: "semibold",
      }),
      col.badge<Product>("categoryName", t("col_category"), {
        width: 140,
        variant: "outline",
      }),
      {
        field: "price",
        headerName: t("col_financials"),
        width: 180,
        type: "number",
        sortable: true,
        renderCell: ({ row }: DataTableRenderCellParams<Product>) => {
          const margin = row.price > 0 ? Math.round(((row.price - row.costPrice) / row.price) * 100) : 0;
          return (
            <div className="text-xs">
              <span className="text-foreground font-mono font-bold">${row.price.toFixed(2)}</span>
              <div className="text-muted-foreground flex items-center gap-1 text-[10px]">
                <span>
                  {t("cost_prefix")} ${row.costPrice.toFixed(2)}
                </span>
                <span className="text-chart-2 font-medium">
                  ({margin}
                  {t("margin_suffix")})
                </span>
              </div>
            </div>
          );
        },
      },
      {
        field: "stock",
        headerName: t("col_inventory"),
        width: 130,
        type: "number",
        sortable: true,
        renderCell: ({ row }: DataTableRenderCellParams<Product>) => {
          if (row.stock === 0) {
            return <BadgeCell value={t("stock_out")} variant="destructive" />;
          }
          if (row.stock <= 10) {
            return <BadgeCell value={t("low_stock", { count: row.stock })} variant="warning" dot />;
          }
          return <span className="text-muted-foreground font-mono text-xs">{t("in_stock", { count: row.stock })}</span>;
        },
      },
      col.badge<Product>("status", t("col_status"), {
        width: 100,
        dot: true,
        variantMap: STATUS_VARIANT_MAP,
        labelMap: statusLabelMap,
      }),
      col.actions<Product>({
        field: "actions",
        headerName: t("col_actions"),
        width: 80,
        moreActionsLabel: t("col_actions"),
        crud: {
          onEdit: (row) => onEditProduct?.(row.id),
          onDelete: (row) => onDeleteProduct?.(row.id),
        },
      }),
    ],
    [onEditProduct, onDeleteProduct, statusLabelMap, t],
  );

  return (
    <ResourceTable<Product>
      queryOptions={!products ? productQueries.list : undefined}
      data={products}
      columns={columns}
      getRowId={getProductRowId}
      checkboxSelection
      loading={loading}
      total={total}
      pinnedColumns={PINNED_COLUMNS}
      filters={productFilters}
      slotProps={SLOT_PROPS}
      batchActions={(selectedRows, clearSelection) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 rounded-full text-xs"
            onClick={() => exportProductsJson(selectedRows, clearSelection)}
          >
            <Download className="size-3.5" />
            <span>Export ({selectedRows.length})</span>
          </Button>
          {onBatchDelete && (
            <Button
              variant="destructive"
              size="sm"
              className="h-7 gap-1 rounded-full text-xs"
              onClick={() => {
                onBatchDelete(selectedRows);
                clearSelection();
              }}
            >
              <Trash2 className="size-3.5" />
              <span>Delete ({selectedRows.length})</span>
            </Button>
          )}
        </div>
      )}
    />
  );
}
