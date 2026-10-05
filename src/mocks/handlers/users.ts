import { chunk, orderBy } from "es-toolkit";
import { http } from "msw";

import type { Customer } from "@/features/users";

import { db } from "../db";
import { checkChaosError, jsonError, jsonOk, jsonPaginated, simulateNetwork } from "../middleware";

export const usersHandlers = [
  http.get("/v1/users", async ({ request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase();
    const status = url.searchParams.get("status");
    const hasPagination = url.searchParams.has("page") || url.searchParams.has("pageSize");
    const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
    const pageSize = Number.parseInt(url.searchParams.get("pageSize") ?? "20", 10);

    const all = db.customer.getAll() as unknown as Customer[];
    let items = [...all];

    if (search) {
      items = items.filter(
        (c) => c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search),
      );
    }

    if (status && status !== "all") {
      items = items.filter((c) => c.status === status);
    }

    items = orderBy(items, [(c) => c.totalSpent], ["desc"]);

    if (hasPagination) {
      const chunks = chunk(items, pageSize);
      const paginatedItems = chunks[page - 1] ?? [];
      const totalPages = Math.ceil(items.length / pageSize);
      return jsonPaginated(
        paginatedItems,
        {
          page,
          pageSize,
          total: items.length,
          totalPages,
          hasMore: page < totalPages,
        },
        {
          items: paginatedItems,
          total: items.length,
        },
      );
    }

    return jsonOk(items, { items, total: items.length });
  }),

  http.patch("/v1/users/:id/status", async ({ params, request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const { id } = params;
    const body = (await request.json()) as { status: "active" | "inactive" };

    const customer = db.customer.findFirst({
      where: { id: { equals: id as string } },
    });
    if (!customer) {
      return jsonError(404, "NOT_FOUND", "Customer not found");
    }

    const updated = await db.customer.update({
      where: { id: { equals: id as string } },
      data: { status: body.status },
    });

    return jsonOk(updated as unknown as Customer);
  }),
];
