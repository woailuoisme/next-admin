// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/geocode/route";

function buildRequest(url: string, options: { auth?: boolean; ip?: string } = {}) {
  const headers = new Headers({ "x-forwarded-for": options.ip ?? "10.0.0.1" });
  if (options.auth !== false) headers.set("cookie", "auth_token=test-token");
  return new NextRequest(`http://localhost${url}`, { headers });
}

describe("GET /api/geocode", () => {
  it("rejects requests without an auth cookie", async () => {
    const res = await GET(buildRequest("/api/geocode?action=status", { auth: false, ip: "10.0.1.1" }));
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
