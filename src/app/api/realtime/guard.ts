import crypto from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";

export interface VerifiedApiSession {
  userId: string;
  name: string;
  role: string;
}

const AUTH_COOKIE_NAME = "auth_token";
const MOCK_TOKEN_REGEX = /^mock-token-(admin-\d+)-\d+$/;
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7;

function extractAuthCookie(request: Request): string | null {
  const nextCookies = (request as Partial<NextRequest>).cookies;
  const cookieValue = nextCookies?.get?.(AUTH_COOKIE_NAME)?.value;
  if (cookieValue) return cookieValue;

  const rawCookie = request.headers.get("cookie") ?? "";
  for (const part of rawCookie.split(";")) {
    const eqIndex = part.indexOf("=");
    if (eqIndex <= 0) continue;
    const key = part.slice(0, eqIndex).trim();
    if (key !== AUTH_COOKIE_NAME) continue;
    const rawValue = part.slice(eqIndex + 1).trim();
    if (!rawValue) return null;
    try {
      return decodeURIComponent(rawValue);
    } catch {
      return rawValue;
    }
  }
  return null;
}

export function createSignedSessionToken(
  session: VerifiedApiSession,
  secret: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = Buffer.from(
    JSON.stringify({
      userId: session.userId,
      name: session.name,
      role: session.role,
      exp,
    }),
  ).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySignedSessionToken(token: string, secret: string): VerifiedApiSession | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  if (!payload || !signature) return null;

  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  const actualBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (actualBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(actualBuf, expectedBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      userId?: unknown;
      name?: unknown;
      role?: unknown;
      exp?: unknown;
    };
    if (
      typeof parsed.userId !== "string" ||
      !parsed.userId ||
      typeof parsed.name !== "string" ||
      !parsed.name ||
      typeof parsed.role !== "string" ||
      !parsed.role ||
      typeof parsed.exp !== "number" ||
      parsed.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return {
      userId: parsed.userId,
      name: parsed.name,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}

export async function resolveApiSession(request: Request): Promise<VerifiedApiSession | null> {
  const token = extractAuthCookie(request);
  if (!token) return null;

  const sessionSecret = process.env.AUTH_SESSION_SECRET;
  if (sessionSecret) {
    return verifySignedSessionToken(token, sessionSecret);
  }

  if (process.env.NODE_ENV !== "production" && env.ENABLE_MOCK) {
    const mockMatch = MOCK_TOKEN_REGEX.exec(token);
    if (mockMatch) {
      return {
        userId: mockMatch[1],
        name: "Administrator",
        role: "admin",
      };
    }
  }

  if (env.API_URL) {
    try {
      const response = await fetch(`${env.API_URL.replace(/\/+$/, "")}/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });
      if (!response.ok) return null;
      const body = (await response.json()) as {
        data?: { id?: unknown; name?: unknown; role?: unknown };
        id?: unknown;
        name?: unknown;
        role?: unknown;
      };
      const user = body.data ?? body;
      if (typeof user.id === "string" && user.id) {
        return {
          userId: user.id,
          name: typeof user.name === "string" && user.name ? user.name : "Operator",
          role: typeof user.role === "string" && user.role ? user.role : "viewer",
        };
      }
    } catch {
      return null;
    }
  }

  return null;
}

export async function requireSession(
  request: Request,
  unauthorizedResponse?: NextResponse,
): Promise<VerifiedApiSession | NextResponse> {
  const session = await resolveApiSession(request);
  if (session) return session;
  return unauthorizedResponse ?? NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}
