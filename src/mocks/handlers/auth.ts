import { capitalize } from "es-toolkit";
import { http } from "msw";

import type { AdminUser } from "@/features/auth";

import { db } from "../db";
import { checkChaosError, jsonError, jsonNoContent, jsonOk, simulateNetwork } from "../middleware";

const OTP_CODE = "123456";
const TICKET_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

interface ResetTicket {
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
}

const resetTickets = new Map<string, ResetTicket>();
const resetTokens = new Map<string, { email: string; expiresAt: number }>();
const lastSentAtByEmail = new Map<string, number>();

function isDevEnvironment() {
  return process.env.NODE_ENV !== "production";
}

/**
 * happy-dom 处理空体 204 时会重复关闭响应流（ERR_INVALID_STATE），
 * 仅测试运行时退化为 200 + 空对象；dev / 生产保持契约中的 204。
 */
function isTestEnvironment() {
  return process.env.NODE_ENV === "test";
}

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

  // 忘记密码：无论邮箱是否存在都返回成功，避免账号枚举
  http.post("/v1/auth/forgot-password", async ({ request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    let body: { email?: string } = {};
    try {
      body = (await request.json()) as { email?: string };
    } catch {
      return jsonError(400, "BAD_REQUEST", "Invalid JSON payload");
    }

    const email = body.email?.trim().toLowerCase() ?? "";
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return jsonError(400, "BAD_REQUEST", "A valid email address is required");
    }

    const lastSentAt = lastSentAtByEmail.get(email) ?? 0;
    if (Date.now() - lastSentAt < RESEND_COOLDOWN_MS) {
      return jsonError(429, "RESEND_TOO_SOON", "Please wait before requesting another code");
    }

    const ticket = `reset-ticket-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    resetTickets.set(ticket, {
      email,
      code: OTP_CODE,
      expiresAt: Date.now() + TICKET_TTL_MS,
      attempts: 0,
    });
    lastSentAtByEmail.set(email, Date.now());

    return jsonOk({
      ticket,
      expiresIn: TICKET_TTL_MS / 1000,
      ...(isDevEnvironment() ? { devCode: OTP_CODE } : {}),
    });
  }),

  http.post("/v1/auth/verify-otp", async ({ request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    let body: { ticket?: string; code?: string } = {};
    try {
      body = (await request.json()) as { ticket?: string; code?: string };
    } catch {
      return jsonError(400, "BAD_REQUEST", "Invalid JSON payload");
    }

    const ticket = body.ticket ? resetTickets.get(body.ticket) : undefined;
    if (!ticket || Date.now() > ticket.expiresAt) {
      if (body.ticket) resetTickets.delete(body.ticket);
      return jsonError(410, "TICKET_EXPIRED", "This verification session has expired");
    }

    if (ticket.attempts >= MAX_ATTEMPTS) {
      resetTickets.delete(body.ticket as string);
      return jsonError(429, "TOO_MANY_ATTEMPTS", "Too many incorrect attempts");
    }

    if (body.code !== ticket.code) {
      ticket.attempts += 1;
      return jsonError(401, "INVALID_CODE", "The verification code is incorrect");
    }

    resetTickets.delete(body.ticket as string);
    const resetToken = `reset-token-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    resetTokens.set(resetToken, { email: ticket.email, expiresAt: Date.now() + TICKET_TTL_MS });

    return jsonOk({ resetToken, expiresIn: TICKET_TTL_MS / 1000 });
  }),

  http.post("/v1/auth/reset-password", async ({ request }) => {
    await simulateNetwork(request);
    const chaos = checkChaosError(request);
    if (chaos) return chaos;

    let body: { resetToken?: string; password?: string } = {};
    try {
      body = (await request.json()) as { resetToken?: string; password?: string };
    } catch {
      return jsonError(400, "BAD_REQUEST", "Invalid JSON payload");
    }

    const token = body.resetToken ? resetTokens.get(body.resetToken) : undefined;
    if (!token || Date.now() > token.expiresAt) {
      if (body.resetToken) resetTokens.delete(body.resetToken);
      return jsonError(410, "TICKET_EXPIRED", "This reset session has expired");
    }

    const password = body.password ?? "";
    const characterClasses = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) =>
      pattern.test(password),
    ).length;
    if (password.length < 8 || characterClasses < 2) {
      return jsonError(422, "WEAK_PASSWORD", "The new password does not meet the requirements");
    }

    // 一次性令牌：用完即作废
    resetTokens.delete(body.resetToken as string);
    return isTestEnvironment() ? jsonOk({ ok: true }) : jsonNoContent();
  }),
];
