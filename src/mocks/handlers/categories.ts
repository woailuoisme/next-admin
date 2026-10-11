import { http } from "msw";

import type { Category } from "@/features/categories";

import { db } from "../db";
import {
  checkChaosError,
  checkIdempotency,
  jsonCreated,
  jsonError,
  jsonNoContent,
  jsonOk,
  saveIdempotencyRecord,
  simulateNetwork,
} from "../middleware";

async function updateCategory(id: string, request: Request): Promise<Response> {
  await simulateNetwork(request);
  const chaos = checkChaosError(request);
  if (chaos) return chaos;

  const body = (await request.json()) as Partial<Category>;
  const existing = db.category.findFirst({
    where: { id: { equals: id } },
  });
  if (!existing) {
    return jsonError(404, "NOT_FOUND", "Category not found");
  }

  const updatedCategory = await db.category.update({
    where: { id: { equals: id } },
    data: body,
  });

  return jsonOk(updatedCategory);
}

export const categoriesHandlers = [
  http.get("/v1/categories", async ({ request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const categories = db.category.getAll();
    return jsonOk(categories);
  }),

  http.post("/v1/categories", async ({ request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const rawText = await request.clone().text();
    const cached = checkIdempotency(request, rawText);
    if (cached) return cached;

    const body = (await request.json()) as {
      name: string;
      slug?: string;
      description?: string;
    };

    const newCategory = await db.category.create({
      id: `cat-${Date.now()}`,
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
      description: body.description ?? "",
      productCount: 0,
    });

    const response = jsonCreated(newCategory);
    saveIdempotencyRecord(request, rawText, 201, { data: newCategory, ...newCategory });
    return response;
  }),

  http.patch("/v1/categories/:id", async ({ params, request }) => {
    return updateCategory(params.id as string, request);
  }),

  http.put("/v1/categories/:id", async ({ params, request }) => {
    return updateCategory(params.id as string, request);
  }),

  http.delete("/v1/categories/:id", async ({ params, request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const { id } = params;
    const existing = db.category.findFirst({
      where: { id: { equals: id as string } },
    });
    if (!existing) {
      return jsonError(404, "NOT_FOUND", "Category not found");
    }

    db.category.delete({
      where: { id: { equals: id as string } },
    });

    return jsonNoContent();
  }),
];
