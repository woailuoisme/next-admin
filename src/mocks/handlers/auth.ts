import { capitalize } from "es-toolkit";
import { http } from "msw";

import type { AdminUser } from "@/features/admin-users";

import { db } from "../db";
import { checkChaosError, jsonError, jsonNoContent, jsonOk, simulateNetwork } from "../middleware";

export const authHandlers = [
  http.post("/v1/auth/login", async ({ request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    let body: { email?: string; password?: string } = {};
    try {
      body = (await request.json()) as {
        email?: string;
        password?: string;
      };
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
    return jsonOk({
      token,
      admin,
    });
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
    // Match token pattern mock-token-{adminId}-{timestamp}
    const match = token.match(/^mock-token-(admin-\d+)-/);
    const adminId = match ? match[1] : null;
    const admin = admins.find((u) => u.id === adminId) ?? admins[0];

    if (!admin) {
      return jsonError(401, "UNAUTHORIZED", "Unauthorized");
    }

    return jsonOk({ admin });
  }),

  http.get("/v1/auth/demo-accounts", async ({ request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    const admins = db.adminUser.getAll() as unknown as AdminUser[];
    const demoAccounts = admins
      .filter((a) => a.status === "active")
      .slice(0, 3)
      .map((a) => ({
        name: a.name,
        email: a.email,
        role: a.role === "superadmin" ? "Superadmin" : capitalize(a.role),
      }));

    return jsonOk(demoAccounts);
  }),
];
