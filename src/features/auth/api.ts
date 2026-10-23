import type { ApiResponse } from "@/types";

import { apiClient } from "@/lib/apiClient";

import type {
  AdminUser,
  AuthSession,
  ForgotPasswordCredentials,
  ForgotPasswordResponse,
  LoginCredentials,
  ResetPasswordCredentials,
  VerifyOtpCredentials,
  VerifyOtpResponse,
} from "./types";

export async function loginApi(credentials: LoginCredentials): Promise<AuthSession> {
  const res = await apiClient.post("auth/login", { json: credentials }).json<ApiResponse<AuthSession>>();
  return res.data;
}

export async function logoutApi(): Promise<void> {
  await apiClient.post("auth/logout");
}

export async function fetchCurrentAdminApi(): Promise<AdminUser> {
  const res = await apiClient.get("auth/me").json<ApiResponse<{ admin: AdminUser }>>();
  return res.data.admin;
}

export async function forgotPasswordApi(credentials: ForgotPasswordCredentials): Promise<ForgotPasswordResponse> {
  const res = await apiClient
    .post("auth/forgot-password", { json: credentials })
    .json<ApiResponse<ForgotPasswordResponse>>();
  return res.data;
}

export async function verifyOtpApi(credentials: VerifyOtpCredentials): Promise<VerifyOtpResponse> {
  const res = await apiClient.post("auth/verify-otp", { json: credentials }).json<ApiResponse<VerifyOtpResponse>>();
  return res.data;
}

export async function resetPasswordApi(credentials: ResetPasswordCredentials): Promise<void> {
  const response = await apiClient.post("auth/reset-password", { json: credentials });
  // 契约返回 204：显式消费空响应体，避免流式响应悬挂
  await response.arrayBuffer();
}
