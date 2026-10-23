"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { getApiErrorMessage, parseApiError } from "@/lib/apiClient";
import { getSafeRedirectUrl } from "@/lib/security";
import { toastMessages } from "@/lib/toastMessages";
import type { MessageKeyOf } from "@/types/i18n";

import { fetchCurrentAdminApi, forgotPasswordApi, loginApi, logoutApi, resetPasswordApi, verifyOtpApi } from "./api";
import { clearResetFlow, readResetFlow, saveResetFlow, patchResetFlow } from "./resetFlow";
import { clearAuthSession, getAuthToken, setAuthSession, useIsAuthenticated } from "./store";

const RESET_ERROR_KEYS: Record<string, MessageKeyOf<"auth">> = {
  INVALID_CODE: "error_invalid_code",
  TICKET_EXPIRED: "error_ticket_expired",
  TOO_MANY_ATTEMPTS: "error_too_many_attempts",
  RESEND_TOO_SOON: "error_resend_too_soon",
  WEAK_PASSWORD: "error_password_weak",
};

/** 把后端业务错误码映射为 auth 命名空间下的文案键；无法识别时返回 null */
export async function resolveResetErrorKey(error: unknown): Promise<MessageKeyOf<"auth"> | null> {
  const parsed = await parseApiError(error);
  return parsed?.code ? (RESET_ERROR_KEYS[parsed.code] ?? null) : null;
}

export function useLoginMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setAuthSession(data);
      queryClient.clear();
      toast.success(toastMessages.loginSuccess(data.admin.name));
      const fromParam = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("from") : null;
      const redirectPath = getSafeRedirectUrl(fromParam, "/overview");
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

/**
 * 启动时用 /auth/me 校验本地持久化的 token：
 * token 失效时 apiClient 会统一清理会话并跳转登录，有效时刷新管理员信息。
 */
export function useSessionValidation() {
  const isAuthenticated = useIsAuthenticated();
  const validated = useRef(false);

  useEffect(() => {
    // 持久化状态会异步水合（false → true），用一次性标记避免重复请求
    if (validated.current || !isAuthenticated || !getAuthToken()) return;
    validated.current = true;

    let cancelled = false;
    void fetchCurrentAdminApi()
      .then((admin) => {
        const token = getAuthToken();
        if (!cancelled && token) setAuthSession({ token, admin });
      })
      .catch(() => {
        // 401 已由 apiClient 统一处理，其余错误保留本地会话避免误踢
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);
}

export function useForgotPasswordMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: forgotPasswordApi,
    onSuccess: (data, variables) => {
      saveResetFlow({
        ticket: data.ticket,
        email: variables.email,
        expiresAt: Date.now() + data.expiresIn * 1000,
      });
      router.push("/forgot-password/verify");
    },
  });
}

export function useVerifyOtpMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: verifyOtpApi,
    onSuccess: (data) => {
      patchResetFlow({
        resetToken: data.resetToken,
        resetExpiresAt: Date.now() + data.expiresIn * 1000,
      });
      router.push("/forgot-password/reset");
    },
  });
}

export function useResetPasswordMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("auth");

  return useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: () => {
      const email = readResetFlow()?.email;
      clearResetFlow();
      queryClient.clear();
      toast.success(t("reset_success"));
      router.push(email ? `/login?email=${encodeURIComponent(email)}` : "/login");
    },
  });
}
