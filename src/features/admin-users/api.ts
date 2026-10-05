import type { ApiResponse } from "@/types";

import { apiClient, createIdempotencyKey } from "@/lib/api-client";

import type { AdminUser, CreateAdminUserInput } from "./types";

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await apiClient.get("admin-users").json<ApiResponse<AdminUser[]>>();
  return res.data;
}

export async function createAdminUserApi(
  input: CreateAdminUserInput,
  idempotencyKey?: string,
): Promise<AdminUser> {
  const res = await apiClient
    .post("admin-users", {
      json: input,
      headers: { "Idempotency-Key": idempotencyKey ?? createIdempotencyKey() },
    })
    .json<ApiResponse<AdminUser>>();
  return res.data;
}

export async function updateAdminUserApi(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
  const res = await apiClient
    .patch(`admin-users/${id}`, { json: data })
    .json<ApiResponse<AdminUser>>();
  return res.data;
}
