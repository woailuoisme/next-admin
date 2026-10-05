import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

describe("Next.js 16 Edge Proxy Routing Tests", () => {
  const BASE_URL = "http://localhost:3000";

  it("should redirect root path / to /overview", () => {
    const request = new NextRequest(new URL("/", BASE_URL));
    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(`${BASE_URL}/overview`);
  });

  it("should redirect legacy /dashboard path to /overview", () => {
    const request = new NextRequest(new URL("/dashboard", BASE_URL));
    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(`${BASE_URL}/overview`);
  });

  it("should redirect unauthenticated users accessing protected routes to /login with from query param", () => {
    const request = new NextRequest(new URL("/products?page=2", BASE_URL));
    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(`${BASE_URL}/login?from=%2Fproducts%3Fpage%3D2`);
  });

  it("should allow authenticated users with auth_token cookie to access protected routes", () => {
    const request = new NextRequest(new URL("/overview", BASE_URL));
    request.cookies.set("auth_token", "test_jwt_token_12345");
    const response = proxy(request);

    // NextResponse.next() returns 200 without location redirect
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("should redirect authenticated user accessing /login back to /overview", () => {
    const request = new NextRequest(new URL("/login", BASE_URL));
    request.cookies.set("auth_token", "test_jwt_token_12345");
    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(`${BASE_URL}/overview`);
  });

  it("should allow unauthenticated users to access /login", () => {
    const request = new NextRequest(new URL("/login", BASE_URL));
    const response = proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
