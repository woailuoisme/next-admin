// @vitest-environment node
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { apiClient, resolveApiPrefix, setServerHeadersResolver, toSearchParams } from "@/lib/apiClient";
import { server } from "@/mocks/server";

describe("toSearchParams", () => {
  it("should return empty string for non-plain objects", () => {
    expect(toSearchParams(null)).toBe("");
    expect(toSearchParams(undefined)).toBe("");
    expect(toSearchParams("string")).toBe("");
    expect(toSearchParams(123)).toBe("");
    expect(toSearchParams([])).toBe("");
  });

  it("should serialize flat key-value pairs", () => {
    const result = toSearchParams({
      page: 1,
      pageSize: 20,
      search: "apple",
    });
    expect(result).toBe("page=1&pageSize=20&search=apple");
  });

  it("should skip empty strings, null, and undefined values", () => {
    const result = toSearchParams({
      page: 1,
      search: "",
      filter: null,
      status: undefined,
      category: "electronics",
    });
    expect(result).toBe("page=1&category=electronics");
  });

  it("should format array values using bracket notation", () => {
    const result = toSearchParams({
      status: ["active", "pending"],
    });
    // URLSearchParams encodes brackets as %5B%5D
    const decoded = decodeURIComponent(result);
    expect(decoded).toBe("status[]=active&status[]=pending");
  });

  it("should skip empty items inside arrays", () => {
    const result = toSearchParams({
      roles: ["admin", "", null, undefined, "user"],
    });
    const decoded = decodeURIComponent(result);
    expect(decoded).toBe("roles[]=admin&roles[]=user");
  });

  it("should format nested plain objects with bracket notation", () => {
    const result = toSearchParams({
      sort: { field: "createdAt", order: "desc" },
    });
    const decoded = decodeURIComponent(result);
    expect(decoded).toBe("sort[field]=createdAt&sort[order]=desc");
  });
});

describe("apiClient SSR serverHeadersResolver", () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    Object.defineProperty(globalThis, "window", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    setServerHeadersResolver(null);
    Object.defineProperty(globalThis, "window", {
      value: originalWindow,
      writable: true,
      configurable: true,
    });
  });

  it("forwards cookie and Authorization headers when running on server", async () => {
    let capturedAuth: string | null = null;
    let capturedCookie: string | null = null;

    server.use(
      http.get(`${resolveApiPrefix()}/ssr-probe`, ({ request }) => {
        capturedAuth = request.headers.get("authorization");
        capturedCookie = request.headers.get("cookie");
        return HttpResponse.json({ ok: true });
      }),
    );

    setServerHeadersResolver(() => ({
      cookie: "auth_token=ssr-cookie-token; NEXT_LOCALE=zh",
      Authorization: "Bearer ssr-cookie-token",
    }));

    const res = await apiClient.get("ssr-probe").json<{ ok: boolean }>();
    expect(res.ok).toBe(true);
    expect(capturedAuth).toBe("Bearer ssr-cookie-token");
    expect(capturedCookie).toBe("auth_token=ssr-cookie-token; NEXT_LOCALE=zh");
  });

  it("does not overwrite an explicit Authorization header", async () => {
    let capturedAuth: string | null = null;

    server.use(
      http.get(`${resolveApiPrefix()}/ssr-probe-override`, ({ request }) => {
        capturedAuth = request.headers.get("authorization");
        return HttpResponse.json({ ok: true });
      }),
    );

    setServerHeadersResolver(() => ({
      Authorization: "Bearer resolver-token",
    }));

    await apiClient
      .get("ssr-probe-override", {
        headers: { Authorization: "Bearer explicit-token" },
      })
      .json();

    expect(capturedAuth).toBe("Bearer explicit-token");
  });
});
