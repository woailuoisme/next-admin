"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-client";
import { toastMessages } from "@/lib/toast-messages";

import { loginApi, logoutApi } from "./api";
import { authQueries } from "./queries";
import { clearAuthSession, setAuthSession } from "./store";

export function useLoginMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setAuthSession(data);
      queryClient.clear();
      toast.success(toastMessages.loginSuccess(data.admin.name));
      const redirectPath =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("from") || "/dashboard"
          : "/dashboard";
      router.push(redirectPath);
    },
    onError: async (error) => {
      const msg = await getApiErrorMessage(error, toastMessages.loginError());
      toast.error(msg);
    },
  });
}

export function useLogoutMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      clearAuthSession();
      queryClient.clear();
      toast.info(toastMessages.logoutInfo());
      router.push("/login");
    },
  });
}

export function useDemoAccountsQuery() {
  return useQuery(authQueries.demoAccounts());
}
