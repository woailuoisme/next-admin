import type { AdminUser } from "@/features/admin-users";
import type { ApiResponse } from "@/types";

import { apiClient } from "@/lib/api-client";

import type { AuthSession, DemoAccount, LoginCredentials } from "./types";

export async function loginApi(credentials: LoginCredentials): Promise<AuthSession> {
  const res = await apiClient
    .post("auth/login", { json: credentials })
    .json<ApiResponse<AuthSession>>();
  return res.data;
}

export async function logoutApi(): Promise<void> {
  await apiClient.post("auth/logout");
}

export async function fetchCurrentAdminApi(): Promise<AdminUser> {
  const res = await apiClient.get("auth/me").json<ApiResponse<{ admin: AdminUser }>>();
  return res.data.admin;
}

export async function getDemoAccountsApi(): Promise<DemoAccount[]> {
  const res = await apiClient.get("auth/demo-accounts").json<ApiResponse<DemoAccount[]>>();
  return res.data;
}
