import { Download, Trash2 } from "lucide-react";
import { useMemo } from "react";

import {
  BadgeCell,
  col,
  type DataTableColDef,
  type DataTableFilterDefinition,
  type DataTableRenderCellParams,
  ResourceTable,
} from "@/components/data-table";
import { Button } from "@/components/ui/button";

import type { Product } from "../types";

import { productQueries } from "../queries";

const STATUS_VARIANT_MAP: Record<string, "success" | "secondary"> = {
  active: "success",
  draft: "secondary",
};

const STATUS_LABEL_MAP: Record<string, string> = {
  active: "Active",
  draft: "Draft",
};

const PRODUCT_FILTERS: DataTableFilterDefinition[] = [
  {
    type: "select",
    field: "status",
    label: "Status",
    placeholder: "All statuses",
    options: [
      { label: "Active", value: "active" },
      { label: "Draft", value: "draft" },
    ],
  },
  {
    type: "select",
    field: "categoryName",
    label: "Category",
    placeholder: "All categories",
    options: [
      { label: "Electronics", value: "Electronics" },
      { label: "Clothing", value: "Clothing" },
      { label: "Home", value: "Home" },
      { label: "Accessories", value: "Accessories" },
    ],
  },
];

const PINNED_COLUMNS = {
  left: ["imageUrl", "title"],
  right: ["actions"],
};

const SLOT_PROPS = {
  toolbar: {
    exportFileName: "products-catalog.csv",
    quickFilterPlaceholder: "Filter products in current view...",
  },
};

const getProductRowId = (row: Product) => row.id;

function exportProductsJson(selectedRows: Product[], clearSelection: () => void) {
  const json = JSON.stringify(selectedRows, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `products-selected-${selectedRows.length}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  clearSelection();
}

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
  const columns = useMemo<DataTableColDef<Product>[]>(
    () => [
      col.avatar<Product>("imageUrl", "Item", {
        width: 70,
        pinned: "left",
        shape: "rounded",
        size: "md",
      }),
      col.text<Product>("title", "Product Info", {
        description: (r) => r.slug,
        copyable: (r) => r.slug,
        flex: 1,
        width: 260,
        pinned: "left",
        weight: "semibold",
      }),
      col.badge<Product>("categoryName", "Category", {
        width: 140,
        variant: "outline",
      }),
      {
        field: "price",
        headerName: "Financials",
        width: 180,
        type: "number",
        sortable: true,
        aggregation: "sum",
        renderCell: ({ row }: DataTableRenderCellParams<Product>) => {
          const margin = row.price > 0 ? Math.round(((row.price - row.costPrice) / row.price) * 100) : 0;
          return (
            <div className="text-xs">
              <span className="text-foreground font-mono font-bold">${row.price.toFixed(2)}</span>
              <div className="text-muted-foreground flex items-center gap-1 text-[10px]">
                <span>Cost: ${row.costPrice.toFixed(2)}</span>
                <span className="text-chart-2 font-medium">({margin}% margin)</span>
              </div>
            </div>
          );
        },
      },
      {
        field: "stock",
        headerName: "Inventory",
        width: 130,
        type: "number",
        sortable: true,
        aggregation: "sum",
        renderCell: ({ row }: DataTableRenderCellParams<Product>) => {
          if (row.stock === 0) {
            return <BadgeCell value="Out of Stock" variant="destructive" />;
          }
          if (row.stock <= 10) {
            return <BadgeCell value={`Low: ${row.stock} left`} variant="warning" dot />;
          }
          return <span className="text-muted-foreground font-mono text-xs">{row.stock} in stock</span>;
        },
      },
      col.badge<Product>("status", "Status", {
        width: 100,
        dot: true,
        variantMap: STATUS_VARIANT_MAP,
        labelMap: STATUS_LABEL_MAP,
      }),
      col.actions<Product>({
        field: "actions",
        headerName: "Actions",
        width: 80,
        moreActionsLabel: "Actions",
        crud: {
          onEdit: (row) => onEditProduct?.(row.id),
          onDelete: (row) => onDeleteProduct?.(row.id),
        },
      }),
    ],
    [onEditProduct, onDeleteProduct],
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
      filters={PRODUCT_FILTERS}
      summaryRow
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
