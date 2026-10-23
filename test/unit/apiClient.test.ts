import { describe, expect, it } from "vitest";

import { toSearchParams } from "@/lib/apiClient";

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
