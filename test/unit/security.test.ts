import { describe, expect, it } from "vitest";
import { getSafeRedirectUrl } from "@/lib/security";

describe("getSafeRedirectUrl Security Validation Tests", () => {
  it("should return valid relative paths unchanged", () => {
    expect(getSafeRedirectUrl("/overview")).toBe("/overview");
    expect(getSafeRedirectUrl("/products?page=2&sort=name")).toBe("/products?page=2&sort=name");
    expect(getSafeRedirectUrl("/orders/123#history")).toBe("/orders/123#history");
  });

  it("should fallback to default when target is empty or invalid", () => {
    expect(getSafeRedirectUrl(null)).toBe("/overview");
    expect(getSafeRedirectUrl(undefined)).toBe("/overview");
    expect(getSafeRedirectUrl("")).toBe("/overview");
    expect(getSafeRedirectUrl("   ")).toBe("/overview");
    expect(getSafeRedirectUrl(null, "/custom-fallback")).toBe("/custom-fallback");
  });

  it("should block absolute external URLs (Open Redirect)", () => {
    expect(getSafeRedirectUrl("https://evil.com")).toBe("/overview");
    expect(getSafeRedirectUrl("http://evil.com/phishing")).toBe("/overview");
    expect(getSafeRedirectUrl("ftp://evil.com")).toBe("/overview");
    expect(getSafeRedirectUrl("javascript:alert(1)")).toBe("/overview");
    expect(getSafeRedirectUrl("data:text/html,<script>alert(1)</script>")).toBe("/overview");
  });

  it("should block protocol-relative URLs", () => {
    expect(getSafeRedirectUrl("//evil.com")).toBe("/overview");
    expect(getSafeRedirectUrl("///evil.com")).toBe("/overview");
    expect(getSafeRedirectUrl("/\\evil.com")).toBe("/overview");
  });

  it("should block backslash bypasses", () => {
    expect(getSafeRedirectUrl("\\evil.com")).toBe("/overview");
    expect(getSafeRedirectUrl("/products\\overview")).toBe("/overview");
  });

  it("should prevent redirect loop back to login page", () => {
    expect(getSafeRedirectUrl("/login")).toBe("/overview");
    expect(getSafeRedirectUrl("/login?from=/products")).toBe("/overview");
    expect(getSafeRedirectUrl("/login/reset")).toBe("/overview");
  });
});
