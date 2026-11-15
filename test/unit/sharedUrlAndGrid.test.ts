import { describe, expect, it } from "vitest";

import { resolveFixedColsClassName, resolveGridClassName } from "@/components/shared/grid";
import { sanitizeRichEditorUrl, sanitizeUrl } from "@/components/shared/url";

describe("shared grid & url utilities", () => {
  it("sanitizes unsafe protocols while preserving safe links", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeUrl("java\tscript:alert(1)")).toBeNull();
    expect(sanitizeUrl("&#106;avascript:alert(1)")).toBeNull();
    expect(sanitizeUrl("vbscript:msgbox(1)")).toBeNull();
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(sanitizeUrl("//evil.com/phish")).toBeNull();
    expect(sanitizeUrl("/\\evil.com/phish")).toBeNull();
    expect(sanitizeUrl("&#x2f;&#x5c;evil.com/phish")).toBeNull();
    expect(sanitizeUrl("\\\\evil.com/phish")).toBeNull();
    expect(sanitizeRichEditorUrl("/\\evil.com/phish")).toBeNull();
    expect(sanitizeUrl("mailto:user@example.com")).toBeNull();

    expect(sanitizeUrl("mailto:user@example.com", { allowMailtoTel: true })).toBe("mailto:user@example.com");
    expect(sanitizeUrl("tel:+1234567890", { allowMailtoTel: true })).toBe("tel:+1234567890");
    expect(sanitizeUrl("https://example.com/path?a=1")).toBe("https://example.com/path?a=1");
    expect(sanitizeUrl("https://example.com/pa\tth\n?a=1")).toBe("https://example.com/path?a=1");
    expect(sanitizeUrl("/images/avatar.png")).toBe("/images/avatar.png");
    expect(sanitizeUrl("#details")).toBe("#details");
    expect(sanitizeUrl("example.com")).toBeNull();
    expect(sanitizeRichEditorUrl("example.com")).toBe("https://example.com");
  });

  it("resolves static 1..12 responsive and fixed grid classes cleanly", () => {
    const classNames5 = resolveGridClassName({ default: 1, sm: 5, md: 7, lg: 10, xl: 11 }, "lg", "custom-grid");
    expect(classNames5).toContain("grid-cols-1");
    expect(classNames5).toContain("sm:grid-cols-5");
    expect(classNames5).toContain("md:grid-cols-7");
    expect(classNames5).toContain("lg:grid-cols-10");
    expect(classNames5).toContain("xl:grid-cols-11");
    expect(classNames5).toContain("gap-6");
    expect(classNames5).toContain("custom-grid");

    expect(resolveFixedColsClassName(5)).toBe("grid-cols-5");
    expect(resolveFixedColsClassName(12)).toBe("grid-cols-12");
  });
});
