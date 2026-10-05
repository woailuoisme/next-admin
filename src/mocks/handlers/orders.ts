import { chunk, orderBy, round, sumBy } from "es-toolkit";
import { http } from "msw";

import type { Order, OrderStatus } from "@/features/orders";

import { db } from "../db";
import { checkChaosError, jsonError, jsonOk, jsonPaginated, simulateNetwork } from "../middleware";

export const ordersHandlers = [
  http.get("/v1/orders", async ({ request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.toLowerCase();
    const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
    const pageSize = Number.parseInt(url.searchParams.get("pageSize") ?? "20", 10);

    const all = db.order.getAll() as unknown as Order[];
    let items = [...all];

    if (status && status !== "all") {
      items = items.filter((o) => o.status === status);
    }

    if (search) {
      items = items.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(search) ||
          o.customerName.toLowerCase().includes(search) ||
          o.customerEmail.toLowerCase().includes(search),
      );
    }

    items = orderBy(items, [(o) => o.createdAt], ["desc"]);

    const total = items.length;
    const pendingCount = items.filter(
      (o) => o.status === "pending" || o.status === "processing",
    ).length;
    const deliveredCount = items.filter((o) => o.status === "delivered").length;
    const avgOrderValue = total > 0 ? round(sumBy(items, (o) => o.total ?? 0) / total, 2) : 0;

    const chunks = chunk(items, pageSize);
    const paginatedItems = chunks[page - 1] ?? [];
    const totalPages = Math.ceil(total / pageSize);

    const sparklinePeriods = 8;
    const totalOrdersSparkline = Array.from({ length: sparklinePeriods }, (_, i) =>
      Math.max(1, Math.round(total * (0.6 + (0.4 * (i + 1)) / sparklinePeriods))),
    );
    const pendingSparkline = Array.from({ length: sparklinePeriods }, (_, i) =>
      Math.max(0, Math.round(pendingCount * (1.3 - (0.3 * (i + 1)) / sparklinePeriods))),
    );
    const deliveredSparkline = Array.from({ length: sparklinePeriods }, (_, i) =>
      Math.max(1, Math.round(deliveredCount * (0.7 + (0.3 * (i + 1)) / sparklinePeriods))),
    );
    const avgOrderValueSparkline = Array.from({ length: sparklinePeriods }, (_, i) =>
      round(Math.max(1, avgOrderValue * (0.9 + (0.1 * (i + 1)) / sparklinePeriods)), 1),
    );

    return jsonPaginated(
      paginatedItems,
      { page, pageSize, total, totalPages },
      {
        items: paginatedItems,
        total,
        page,
        pageSize,
        totalPages,
        summary: {
          total,
          pendingCount,
          deliveredCount,
          avgOrderValue,
          sparklines: {
            totalOrders: totalOrdersSparkline,
            pending: pendingSparkline,
            delivered: deliveredSparkline,
            avgOrderValue: avgOrderValueSparkline,
          },
        },
      },
    );
  }),

  http.get("/v1/orders/:id", async ({ params, request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const { id } = params;
    const order =
      db.order.findFirst({
        where: { id: { equals: id as string } },
      }) ??
      db.order.findFirst({
        where: { orderNumber: { equals: id as string } },
      });

    if (!order) {
      return jsonError(404, "NOT_FOUND", "Order not found");
    }

    return jsonOk(order as unknown as Order);
  }),

  http.patch("/v1/orders/:id/status", async ({ params, request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const { id } = params;
    const body = (await request.json()) as { status: OrderStatus };

    const existing =
      db.order.findFirst({
        where: { id: { equals: id as string } },
      }) ??
      db.order.findFirst({
        where: { orderNumber: { equals: id as string } },
      });

    if (!existing) {
      return jsonError(404, "NOT_FOUND", "Order not found");
    }

    const updated = await db.order.update({
      where: { id: { equals: existing.id } },
      data: { status: body.status },
    });

    return jsonOk(updated as unknown as Order);
  }),
];
