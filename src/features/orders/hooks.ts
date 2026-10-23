import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { dashboardKeys } from "@/features/dashboard/queries";
import { handleMutationError } from "@/lib/apiClient";
import { toastMessages } from "@/lib/toastMessages";

import type { OrderStatus } from "./types";

import { updateOrderStatusApi } from "./api";
import { orderKeys } from "./queries";

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatusApi(id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success(toastMessages.statusChanged(updated.orderNumber, updated.status));
    },
    onError: handleMutationError(toastMessages.statusError()),
  });
}
