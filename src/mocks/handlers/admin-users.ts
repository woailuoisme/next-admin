import { pick } from "es-toolkit";
import { http } from "msw";

import type { AdminRole, AdminUser } from "@/features/admin-users";

import { db } from "../db";
import {
  checkChaosError,
  checkIdempotency,
  jsonCreated,
  jsonError,
  jsonOk,
  saveIdempotencyRecord,
  simulateNetwork,
} from "../middleware";

export const adminUsersHandlers = [
  http.get("/v1/admin-users", async ({ request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const admins = db.adminUser.getAll() as unknown as AdminUser[];
    return jsonOk(admins);
  }),

  http.post("/v1/admin-users", async ({ request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const rawText = await request.clone().text();
    const cached = checkIdempotency(request, rawText);
    if (cached) return cached;

    const body = (await request.json()) as {
      name: string;
      email: string;
      role: AdminRole;
    };

    const existing = db.adminUser.findFirst({
      where: { email: { equals: body.email } },
    });
    if (existing) {
      return jsonError(409, "CONFLICT", "A staff member with this email already exists");
    }

    const newAdmin = await db.adminUser.create({
      id: `admin-${Date.now()}`,
      name: body.name,
      email: body.email,
      role: body.role,
      status: "active",
      avatarUrl: "",
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    });

    const response = jsonCreated(newAdmin as unknown as AdminUser);
    saveIdempotencyRecord(request, rawText, 201, { data: newAdmin, ...newAdmin });
    return response;
  }),

  http.patch("/v1/admin-users/:id", async ({ params, request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const { id } = params;
    const body = (await request.json()) as Partial<AdminUser>;

    const admin = db.adminUser.findFirst({
      where: { id: { equals: id as string } },
    });
    if (!admin) {
      return jsonError(404, "NOT_FOUND", "Admin user not found");
    }

    const safeUpdates = pick(body, ["role", "status", "name"]);
    const updated = await db.adminUser.update({
      where: { id: { equals: id as string } },
      data: safeUpdates,
    });

    return jsonOk(updated as unknown as AdminUser);
  }),
];
