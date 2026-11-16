// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { GET } from "@/app/api/geocode/route";
import { createSignedSessionToken } from "@/app/api/realtime/guard";

const SESSION_SECRET = "geocode-test-session-secret";

function buildRequest(url: string, options: { auth?: boolean | "forged"; ip?: string } = {}) {
  const headers = new Headers({ "x-forwarded-for": options.ip ?? "10.0.0.1" });
  if (options.auth === "forged") {
    headers.set("cookie", "auth_token=unsigned-forged-token");
  } else if (options.auth !== false) {
    const token = createSignedSessionToken(
      { userId: "admin_operator", name: "Administrator", role: "admin" },
      SESSION_SECRET,
    );
    headers.set("cookie", `auth_token=${token}`);
  }
  return new NextRequest(`http://localhost${url}`, { headers });
}

describe("GET /api/geocode", () => {
  const origSessionSecret = process.env.AUTH_SESSION_SECRET;

  beforeEach(() => {
    process.env.AUTH_SESSION_SECRET = SESSION_SECRET;
  });

  afterEach(() => {
    if (origSessionSecret !== undefined) {
      process.env.AUTH_SESSION_SECRET = origSessionSecret;
    } else {
      delete process.env.AUTH_SESSION_SECRET;
    }
  });

  it("rejects requests without an auth cookie", async () => {
    const res = await GET(buildRequest("/api/geocode?action=status", { auth: false, ip: "10.0.1.1" }));
    expect(res.status).toBe(401);
  });

  it("rejects requests with an unsigned or forged auth cookie", async () => {
    const res = await GET(buildRequest("/api/geocode?action=status", { auth: "forged", ip: "10.0.1.3" }));
    expect(res.status).toBe(401);
  });

  it("answers status probes for authenticated clients", async () => {
    const res = await GET(buildRequest("/api/geocode?action=status", { ip: "10.0.1.2" }));
    expect(res.status).toBe(200);
    expect(typeof (await res.json()).enabled).toBe("boolean");
  });

  it("rate-limits a single client after 60 requests per window", async () => {
    const ip = "10.0.2.1";
    for (let i = 0; i < 60; i += 1) {
      const res = await GET(buildRequest("/api/geocode?action=status", { ip }));
      expect(res.status).toBe(200);
    }
    const limited = await GET(buildRequest("/api/geocode?action=status", { ip }));
    expect(limited.status).toBe(429);
    expect(limited.headers.get("Retry-After")).toBe("60");

    const otherClient = await GET(buildRequest("/api/geocode?action=status", { ip: "10.0.2.2" }));
    expect(otherClient.status).toBe(200);
  });
});
