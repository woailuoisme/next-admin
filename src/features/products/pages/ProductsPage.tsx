"use client";

import { countBy, meanBy } from "es-toolkit";
import { Plus } from "lucide-react";
import { useMemo } from "react";

import { useResourceManagement } from "@/components/data-table";
import { DeleteDialog } from "@/components/dialogs";
import { Button } from "@/components/ui/button";
import { categoryKeys } from "@/features/categories/queries";
import { dashboardKeys } from "@/features/dashboard/queries";
import type { Product, ProductFilters, ProductListResponse } from "../types";

import { deleteProductApi } from "../api";
import { ProductFormDialog } from "../components/ProductFormDialog";
import { ProductMetricsCards } from "../components/ProductMetricsCards";
import { ProductTable } from "../components/ProductTable";
import { productKeys, productQueries } from "../queries";

export interface ProductsPageProps {
  search?: ProductFilters & {
    createProduct?: boolean;
    editProductId?: string;
    deleteProductId?: string;
  };
  onCreateProduct?: () => void;
  onEditProduct?: (productId: string) => void;
  onDeleteProduct?: (productId: string) => void;
}

export function ProductsPage({
  search = {},
  onCreateProduct,
  onEditProduct,
  onDeleteProduct,
}: ProductsPageProps) {
  // Unified Deep Resource Management Module
  const resource = useResourceManagement<Product, ProductFilters, ProductListResponse>({
    entityName: "Product",
    search,
    queryOptions: productQueries.list,
    modalKeys: {
      createKey: "createProduct",
      editKey: "editProductId",
      deleteKey: "deleteProductId",
    },
    onOpenCreate: onCreateProduct,
    onOpenEdit: onEditProduct,
    onOpenDelete: onDeleteProduct,
    getEntityTitle: (p) => p?.title,
    deleteMutationFn: (id) => deleteProductApi(id),
    invalidateQueryKeys: [productKeys.all, dashboardKeys.all, categoryKeys.all],
  });

  // Calculate product statistics for KPI cards
  const productStats = useMemo(
    () => computeProductStats(resource.rows, resource.total, resource.rawResponse?.summary),
    [resource.rawResponse?.summary, resource.total, resource.rows],
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">商品目录 (Product Catalog)</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            全面监控在库 SKU 存量、售价毛利及上下架运营可用性
          </p>
        </div>
        <Button
          onClick={resource.modal.openCreate}
          className="h-9 cursor-pointer gap-1.5 text-xs font-semibold shadow-xs"
        >
          <Plus className="size-4" /> 添加商品
        </Button>
      </div>

      {/* KPI StatCards */}
      <ProductMetricsCards stats={productStats} isLoading={resource.isLoading} />

      {/* Table Content */}
      <ProductTable
        products={resource.rows}
        total={resource.total}
        loading={resource.isLoading}
        onEditProduct={resource.modal.openEdit}
        onDeleteProduct={resource.modal.openDelete}
        onBatchDelete={resource.handleBatchDelete}
      />

      {/* Singleton Product Form Dialog */}
      <ProductFormDialog
        open={resource.isFormOpen}
        onOpenChange={resource.handleFormOpenChange}
        productToEdit={resource.activeEditItem}
        productIdToEdit={resource.modal.editId}
      />

      {/* Unified Delete Dialog (Both Single and Batch Deletion handled by resource) */}
      <DeleteDialog {...resource.deleteDialogProps} />
    </div>
  );
}

export function computeProductStats(
  rows: Product[],
  total?: number,
  serverSummary?: ProductListResponse["summary"],
) {
  if (serverSummary) {
    return serverSummary;
  }
  const totalCount = total ?? rows.length;
  const activeCount = countBy(rows, (p) => p.status).active ?? 0;
  const lowStockCount = rows.filter((p) => p.stock <= 15 || p.status === "out_of_stock").length;
  const avgPrice = rows.length > 0 ? meanBy(rows, (p) => p.price) : 0;

  return {
    total: totalCount,
    activeCount,
    lowStockCount,
    avgPrice,
  };
}
