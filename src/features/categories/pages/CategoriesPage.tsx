"use client";

import { Plus } from "lucide-react";

import { useResourceManagement } from "@/components/data-table";
import { DeleteDialog } from "@/components/dialogs";
import { Button } from "@/components/ui/button";

import type { Category, CategorySearchParams } from "../types";

import { deleteCategoryApi } from "../api";
import { CategoryFormDialog } from "../components/CategoryFormDialog";
import { CategoryTable } from "../components/CategoryTable";
import { categoryQueries } from "../queries";

export interface CategoriesPageProps {
  search?: CategorySearchParams;
  onCreateCategory?: () => void;
  onEditCategory?: (categoryId: string) => void;
  onDeleteCategory?: (categoryId: string) => void;
}

export function CategoriesPage({
  search = {},
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
}: CategoriesPageProps) {
  const {
    rows,
    total,
    isLoading,
    modal,
    activeEditItem,
    isFormOpen,
    handleFormOpenChange,
    deleteDialogProps,
  } = useResourceManagement<Category, CategorySearchParams>({
    search,
    entityName: "Category",
    queryOptions: categoryQueries.list,
    deleteMutationFn: deleteCategoryApi,
    invalidateQueryKeys: [categoryQueries.all()],
    modalKeys: {
      createKey: "createCategory",
      editKey: "editCategoryId",
      deleteKey: "deleteCategoryId",
    },
    onOpenCreate: onCreateCategory,
    onOpenEdit: onEditCategory,
    onOpenDelete: onDeleteCategory,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catalog Categories</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Structure store taxonomy to organize merchandise into discoverable departments.
          </p>
        </div>
        <Button
          onClick={modal.openCreate}
          className="h-9 cursor-pointer gap-1.5 text-xs font-semibold shadow-xs"
        >
          <Plus className="size-4" /> Add Category
        </Button>
      </div>

      {/* Enterprise CategoryTable */}
      <CategoryTable
        categories={rows}
        total={total}
        loading={isLoading}
        onEditCategory={modal.openEdit}
        onDeleteCategory={modal.openDelete}
      />

      {/* Singleton Category Form Dialog (Create & Edit) */}
      <CategoryFormDialog
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        categoryToEdit={activeEditItem}
      />

      {/* Unified Delete Dialog */}
      <DeleteDialog {...deleteDialogProps} />
    </div>
  );
}
