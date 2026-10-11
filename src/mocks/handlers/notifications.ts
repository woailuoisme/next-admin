import { orderBy } from "es-toolkit";
import { http } from "msw";

import { db } from "../db";
import { checkChaosError, jsonError, jsonNoContent, jsonOk, simulateNetwork } from "../middleware";

async function markAllNotificationsAsRead(request: Request): Promise<Response> {
  await simulateNetwork(request);
  const chaos = checkChaosError(request);
  if (chaos) return chaos;

  const unread = db.notification.findMany({
    where: { read: { equals: false } },
  });

  for (const item of unread) {
    await db.notification.update({
      where: { id: { equals: item.id } },
      data: { read: true },
    });
  }

  return jsonOk({ count: unread.length }, { success: true, count: unread.length });
}

export const notificationHandlers = [
  http.get("/v1/notifications", async ({ request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const unreadOnly = url.searchParams.get("unreadOnly") === "true";

    const allNotifications = db.notification.getAll();
    const unreadCount = allNotifications.filter((i) => !i.read).length;

    let items = allNotifications;
    if (category && category !== "all") {
      items = items.filter((item) => item.category === category);
    }
    if (unreadOnly) {
      items = items.filter((item) => !item.read);
    }

    items = orderBy(items, [(i) => i.createdAt], ["desc"]);
    const formatted = items.map((i) => ({ ...i, isRead: i.read, read: i.read }));

    return jsonOk(formatted, {
      items: formatted,
      total: formatted.length,
      unreadCount,
    });
  }),

  http.patch("/v1/notifications/:id", async ({ params, request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const { id } = params;
    const target = db.notification.findFirst({
      where: { id: { equals: id as string } },
    });

    if (!target) {
      return jsonError(404, "NOT_FOUND", "Notification not found");
    }

    let body: { isRead?: boolean; read?: boolean } = {};
    try {
      body = (await request.json()) as { isRead?: boolean; read?: boolean };
    } catch {
      // Body optional for simple read mark
    }

    const isRead = body.isRead ?? body.read ?? true;
    const updated = await db.notification.update({
      where: { id: { equals: id as string } },
      data: { read: isRead },
    });

    const result = {
      ...updated,
      isRead: updated?.read ?? isRead,
      read: updated?.read ?? isRead,
    };
    return jsonOk(result);
  }),

  http.patch("/v1/notifications/:id/read", async ({ params, request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const { id } = params;
    const target = db.notification.findFirst({
      where: { id: { equals: id as string } },
    });

    if (!target) {
      return jsonError(404, "NOT_FOUND", "Notification not found");
    }

    const updated = await db.notification.update({
      where: { id: { equals: id as string } },
      data: { read: true },
    });

    const result = {
      ...updated,
      isRead: updated?.read ?? true,
      read: updated?.read ?? true,
    };
    return jsonOk(result);
  }),

  http.post("/v1/notifications/batch-reads", async ({ request }) => {
    return markAllNotificationsAsRead(request);
  }),

  http.post("/v1/notifications/read-all", async ({ request }) => {
    return markAllNotificationsAsRead(request);
  }),

  http.delete("/v1/notifications/:id", async ({ params, request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const { id } = params;
    const target = db.notification.findFirst({
      where: { id: { equals: id as string } },
    });

    if (!target) {
      return jsonError(404, "NOT_FOUND", "Notification not found");
    }

    db.notification.delete({
      where: { id: { equals: id as string } },
    });

    return jsonNoContent();
  }),
];
