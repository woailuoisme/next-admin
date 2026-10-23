import type { ApiResponse } from "@/types";

import { apiClient, createIdempotencyKey, toSearchParams } from "@/lib/apiClient";

import type { Product, ProductFilters, ProductInput, ProductListResponse } from "./types";

export async function fetchProducts(filters: ProductFilters): Promise<ProductListResponse> {
  return apiClient.get("products", { searchParams: toSearchParams(filters) }).json<ProductListResponse>();
}

export async function fetchProductById(id: string): Promise<Product> {
  const res = await apiClient.get(`products/${id}`).json<ApiResponse<Product>>();
  return res.data;
}

export async function createProductApi(input: ProductInput, idempotencyKey?: string): Promise<Product> {
  const res = await apiClient
    .post("products", {
      json: input,
      headers: { "Idempotency-Key": idempotencyKey ?? createIdempotencyKey() },
    })
    .json<ApiResponse<Product>>();
  return res.data;
}

export async function updateProductApi(id: string, input: Partial<ProductInput>): Promise<Product> {
  const res = await apiClient.patch(`products/${id}`, { json: input }).json<ApiResponse<Product>>();
  return res.data;
}

export async function deleteProductApi(id: string): Promise<void> {
  await apiClient.delete(`products/${id}`);
}
