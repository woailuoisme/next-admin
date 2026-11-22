import { http } from "msw";

import { sanitizeUrl } from "@/components/shared/url";
import { isStrongEnough } from "@/features/auth/schemas";
import type { AdminUser } from "@/features/auth/types";

import { db } from "../db";
import { checkChaosError, jsonError, jsonNoContent, jsonOk, simulateNetwork } from "../middleware";
import { authResetHandlers } from "./authReset";

export const authHandlers = [
  http.post("/v1/auth/login", async ({ request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    let body: { email?: string; password?: string } = {};
    try {
      body = (await request.json()) as { email?: string; password?: string };
    } catch {
      return jsonError(400, "BAD_REQUEST", "Invalid JSON payload");
    }
    const { email, password } = body;

    if (!email || !password) {
      return jsonError(400, "BAD_REQUEST", "Email and password are required");
    }

    const admins = db.adminUser.getAll() as unknown as AdminUser[];
    const admin = admins.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!admin || password !== "admin123") {
      return jsonError(401, "UNAUTHORIZED", 'Invalid credentials. Use password "admin123"');
    }

    if (admin.status === "suspended") {
      return jsonError(403, "FORBIDDEN", "This staff account has been suspended");
    }

    const token = `mock-token-${admin.id}-${Date.now()}`;
    return jsonOk({ token, admin });
  }),

  http.post("/v1/auth/logout", async ({ request }) => {
    await simulateNetwork(request);
    return jsonNoContent();
  }),

  http.get("/v1/auth/me", async ({ request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const token = authHeader.replace("Bearer ", "");
    const admins = db.adminUser.getAll() as unknown as AdminUser[];
    const match = token.match(/^mock-token-(admin-\d+)-/);
    const adminId = match ? match[1] : null;
    const admin = admins.find((u) => u.id === adminId) ?? admins[0];

    if (!admin) {
      return jsonError(401, "UNAUTHORIZED", "Unauthorized");
    }

    return jsonOk({ admin });
  }),

  http.patch("/v1/auth/me", async ({ request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonError(401, "UNAUTHORIZED", "Unauthorized");
    }

    let body: { name?: string; avatarUrl?: string } = {};
    try {
      body = (await request.json()) as { name?: string; avatarUrl?: string };
    } catch {
      return jsonError(400, "BAD_REQUEST", "Invalid JSON payload");
    }

    const name = body.name?.trim();
    if (!name || name.length < 2) {
      return jsonError(422, "VALIDATION_ERROR", "Display name must be at least 2 characters");
    }

    const rawAvatar = body.avatarUrl?.trim();
    const safeAvatar = rawAvatar ? sanitizeUrl(rawAvatar, { allowRelative: true, allowBareDomain: false }) : undefined;
    if (rawAvatar && !safeAvatar) {
      return jsonError(422, "VALIDATION_ERROR", "Invalid avatar URL protocol");
    }

    const token = authHeader.replace("Bearer ", "");
    const admins = db.adminUser.getAll() as unknown as AdminUser[];
    const match = token.match(/^mock-token-(admin-\d+)-/);
    const adminId = match ? match[1] : null;
    const admin = admins.find((u) => u.id === adminId) ?? admins[0];

    if (!admin) {
      return jsonError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const updated = (await db.adminUser.update((q) => q.where({ id: admin.id }), {
      data: {
        name,
        ...(body.avatarUrl !== undefined ? { avatarUrl: safeAvatar ?? undefined } : {}),
        lastActiveAt: new Date().toISOString(),
      },
    })) as unknown as AdminUser | null;

    return jsonOk({ admin: updated ?? { ...admin, name } });
  }),

  http.post("/v1/auth/change-password", async ({ request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonError(401, "UNAUTHORIZED", "Unauthorized");
    }

    let body: { currentPassword?: string; newPassword?: string } = {};
    try {
      body = (await request.json()) as { currentPassword?: string; newPassword?: string };
    } catch {
      return jsonError(400, "BAD_REQUEST", "Invalid JSON payload");
    }

    if (!body.currentPassword || body.currentPassword !== "admin123") {
      return jsonError(400, "INVALID_PASSWORD", 'Current password is incorrect (use "admin123")');
    }

    const password = body.newPassword ?? "";
    if (!isStrongEnough(password)) {
      return jsonError(422, "WEAK_PASSWORD", "The new password does not meet the requirements");
    }

    return jsonNoContent();
  }),

  ...authResetHandlers,
];
