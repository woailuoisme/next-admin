import type { ApiResponse } from "@/types";

import { apiClient, createIdempotencyKey } from "@/lib/api-client";

import type { Category } from "./types";

export async function fetchCategories(): Promise<Category[]> {
  const res = await apiClient.get("categories").json<ApiResponse<Category[]>>();
  return res.data;
}

export async function createCategoryApi(
  data: {
    name: string;
    slug?: string;
    description?: string;
  },
  idempotencyKey?: string,
): Promise<Category> {
  const res = await apiClient
    .post("categories", {
      json: data,
      headers: { "Idempotency-Key": idempotencyKey ?? createIdempotencyKey() },
    })
    .json<ApiResponse<Category>>();
  return res.data;
}

export async function updateCategoryApi(id: string, data: Partial<Category>): Promise<Category> {
  const res = await apiClient
    .patch(`categories/${id}`, { json: data })
    .json<ApiResponse<Category>>();
  return res.data;
}

export async function deleteCategoryApi(id: string): Promise<void> {
  await apiClient.delete(`categories/${id}`);
}
