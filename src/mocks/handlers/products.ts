import { chunk, orderBy, round, sumBy } from "es-toolkit";
import { http } from "msw";

import type { Product } from "@/features/products";

import { db } from "../db";
import {
  checkChaosError,
  checkIdempotency,
  jsonCreated,
  jsonError,
  jsonNoContent,
  jsonOk,
  jsonPaginated,
  saveIdempotencyRecord,
  simulateNetwork,
} from "../middleware";

const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80";

async function updateProduct(id: string, request: Request): Promise<Response> {
  await simulateNetwork(request);
  const chaos = checkChaosError(request);
  if (chaos) return chaos;

  const body = (await request.json()) as Partial<Product>;
  const existing = db.product.findFirst({
    where: { id: { equals: id } },
  });

  if (!existing) {
    return jsonError(404, "NOT_FOUND", "Product not found");
  }

  const updatedProduct = await db.product.update({
    where: { id: { equals: id } },
    data: body,
  });

  return jsonOk(updatedProduct);
}

export const productsHandlers = [
  http.get("/v1/products", async ({ request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";
    const categoryId = url.searchParams.get("categoryId") ?? "";
    const status = url.searchParams.get("status") ?? "";
    const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
    const pageSize = Number.parseInt(url.searchParams.get("pageSize") ?? "20", 10);
    const sortBy = url.searchParams.get("sortBy") ?? "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") ?? "desc";

    const all = db.product.getAll();
    let items = [...all];

    if (search) {
      items = items.filter(
        (p) => p.title.toLowerCase().includes(search) || p.description.toLowerCase().includes(search),
      );
    }

    if (categoryId && categoryId !== "all") {
      items = items.filter((p) => p.categoryId === categoryId);
    }

    if (status && status !== "all") {
      items = items.filter((p) => p.status === status);
    }

    items = orderBy(
      items,
      [
        (p) => {
          const val = p[sortBy as keyof Product];
          return typeof val === "string" ? val.toLowerCase() : (val ?? "");
        },
      ],
      [sortOrder === "asc" ? "asc" : "desc"],
    );

    const total = items.length;
    const activeCount = items.filter((p) => p.status === "active").length;
    const lowStockCount = items.filter((p) => p.stock <= 15 || p.status === "out_of_stock").length;
    const avgPrice = total > 0 ? round(sumBy(items, (p) => p.price) / total, 2) : 0;

    const chunks = chunk(items, pageSize);
    const paginatedItems = chunks[page - 1] ?? [];
    const totalPages = Math.ceil(total / pageSize);

    const sparklinePeriods = 8;
    const totalSkuSparkline = Array.from({ length: sparklinePeriods }, (_, i) =>
      Math.max(1, Math.round(total * (0.7 + (0.3 * (i + 1)) / sparklinePeriods))),
    );
    const activeSkuSparkline = Array.from({ length: sparklinePeriods }, (_, i) =>
      Math.max(1, Math.round(activeCount * (0.8 + (0.2 * (i + 1)) / sparklinePeriods))),
    );
    const lowStockSparkline = Array.from({ length: sparklinePeriods }, (_, i) =>
      Math.max(0, Math.round(lowStockCount * (1.4 - (0.4 * (i + 1)) / sparklinePeriods))),
    );
    const avgPriceSparkline = Array.from({ length: sparklinePeriods }, (_, i) =>
      round(Math.max(1, avgPrice * (0.92 + (0.08 * (i + 1)) / sparklinePeriods)), 1),
    );

    return jsonPaginated(
      paginatedItems,
      {
        page,
        pageSize,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      {
        items: paginatedItems,
        total,
        page,
        pageSize,
        totalPages,
        summary: {
          total,
          activeCount,
          lowStockCount,
          avgPrice,
          sparklines: {
            totalSku: totalSkuSparkline,
            activeSku: activeSkuSparkline,
            lowStock: lowStockSparkline,
            avgPrice: avgPriceSparkline,
          },
        },
      },
    );
  }),

  http.get("/v1/products/:id", async ({ params, request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const { id } = params;
    const product = db.product.findFirst({
      where: { id: { equals: id as string } },
    });

    if (!product) {
      return jsonError(404, "NOT_FOUND", "Product not found");
    }
    return jsonOk(product);
  }),

  http.post("/v1/products", async ({ request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const rawText = await request.clone().text();
    const cached = checkIdempotency(request, rawText);
    if (cached) return cached;

    const body = (await request.json()) as Omit<Product, "id" | "createdAt">;

    const category = body.categoryId ? db.category.findFirst({ where: { id: { equals: body.categoryId } } }) : null;

    const newProduct = await db.product.create({
      id: `prod-${Date.now()}`,
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/\s+/g, "-"),
      description: body.description ?? "",
      price: body.price,
      costPrice: body.costPrice ?? round(body.price * 0.6, 2),
      stock: body.stock ?? 0,
      categoryId: body.categoryId ?? category?.id ?? "cat-1",
      categoryName: category?.name ?? "General",
      status: body.status ?? "active",
      imageUrl: body.imageUrl ?? DEFAULT_PRODUCT_IMAGE,
      createdAt: new Date().toISOString(),
    });

    if (category) {
      await db.category.update({
        where: { id: { equals: category.id } },
        data: { productCount: (category.productCount || 0) + 1 },
      });
    }

    const response = jsonCreated(newProduct);
    saveIdempotencyRecord(request, rawText, 201, { data: newProduct, ...newProduct });
    return response;
  }),

  http.patch("/v1/products/:id", async ({ params, request }) => updateProduct(params.id as string, request)),

  http.put("/v1/products/:id", async ({ params, request }) => updateProduct(params.id as string, request)),

  http.delete("/v1/products/:id", async ({ params, request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const { id } = params;
    const existing = db.product.findFirst({
      where: { id: { equals: id as string } },
    });

    if (!existing) {
      return jsonError(404, "NOT_FOUND", "Product not found");
    }

    if (existing.categoryId) {
      const cat = db.category.findFirst({
        where: { id: { equals: existing.categoryId } },
      });
      if (cat && cat.productCount > 0) {
        await db.category.update({
          where: { id: { equals: cat.id } },
          data: { productCount: cat.productCount - 1 },
        });
      }
    }

    db.product.delete({
      where: { id: { equals: id as string } },
    });

    return jsonNoContent();
  }),
];
