import { describe, expect, it } from "vitest";

import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and joins words with single hyphens", () => {
    expect(slugify("Wireless Noise Cancelling Headphones")).toBe("wireless-noise-cancelling-headphones");
  });

  it("collapses consecutive separators and trims leading / trailing ones", () => {
    expect(slugify("  --Hello   World!! -- ")).toBe("hello-world");
  });

  it("drops non-latin characters instead of leaving stray hyphens", () => {
    expect(slugify("无线耳机 Wireless 耳机")).toBe("wireless");
  });

  it("returns an empty string when nothing latin survives", () => {
    expect(slugify("中文名称")).toBe("");
    expect(slugify("")).toBe("");
  });
});
