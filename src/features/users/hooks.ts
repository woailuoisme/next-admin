import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { handleMutationError } from "@/lib/api-client";
import { toastMessages } from "@/lib/toast-messages";

import type { CustomerFilters } from "./types";

import { toggleCustomerStatusApi } from "./api";
import { customerKeys, customerQueries, EMPTY_CUSTOMER_FILTERS } from "./queries";

export function useCustomersQuery(filters: CustomerFilters = EMPTY_CUSTOMER_FILTERS) {
  return useQuery(customerQueries.list(filters));
}

export function useToggleCustomerStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "inactive" }) =>
      toggleCustomerStatusApi(id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      toast.success(toastMessages.statusChanged(updated.name, updated.status));
    },
    onError: handleMutationError(toastMessages.statusError()),
  });
}
