import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { categoryKeys } from "@/features/categories/queries";
import { dashboardKeys } from "@/features/dashboard/queries";
import { handleMutationError } from "@/lib/apiClient";
import { toastMessages } from "@/lib/toastMessages";

import type { ProductInput } from "./types";

import { createProductApi, deleteProductApi, updateProductApi } from "./api";
import { productKeys } from "./queries";

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => createProductApi(input),
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success(toastMessages.created(newProduct.title));
    },
    onError: handleMutationError(toastMessages.createError()),
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) => updateProductApi(id, input),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success(toastMessages.updated(updated.title));
    },
    onError: handleMutationError(toastMessages.updateError()),
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProductApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success(toastMessages.deleted());
    },
    onError: handleMutationError(toastMessages.deleteError()),
  });
}
