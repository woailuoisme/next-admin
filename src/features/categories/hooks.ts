import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { handleMutationError } from "@/lib/api-client";
import { toastMessages } from "@/lib/toast-messages";

import type { Category, CategoryInput } from "./types";

import { createCategoryApi, deleteCategoryApi, updateCategoryApi } from "./api";
import { categoryKeys, categoryQueries } from "./queries";

export function useCategoriesQuery() {
  return useQuery(categoryQueries.list());
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryInput) => createCategoryApi(data),
    onSuccess: (cat) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success(toastMessages.created(cat.name));
    },
    onError: handleMutationError(toastMessages.createError()),
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      updateCategoryApi(id, data),
    onSuccess: (cat) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success(toastMessages.updated(cat.name));
    },
    onError: handleMutationError(toastMessages.updateError()),
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategoryApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success(toastMessages.deleted());
    },
    onError: handleMutationError(toastMessages.deleteError()),
  });
}
