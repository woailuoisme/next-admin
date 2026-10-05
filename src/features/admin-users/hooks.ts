import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { handleMutationError } from "@/lib/api-client";
import { toastMessages } from "@/lib/toast-messages";

import type { AdminUser, AdminUserInput } from "./types";

import { createAdminUserApi, updateAdminUserApi } from "./api";
import { adminUserKeys, adminUserQueries } from "./queries";

export function useAdminUsersQuery() {
  return useQuery(adminUserQueries.list());
}

export function useCreateAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminUserInput) => createAdminUserApi(input),
    onSuccess: (admin) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
      toast.success(toastMessages.staffRegistered(admin.name, admin.role));
    },
    onError: handleMutationError(toastMessages.createError()),
  });
}

export function useUpdateAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminUser> }) =>
      updateAdminUserApi(id, data),
    onSuccess: (admin) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
      toast.success(toastMessages.updated(admin.name));
    },
    onError: handleMutationError(toastMessages.updateError()),
  });
}
