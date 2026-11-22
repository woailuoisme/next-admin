import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useIsMobile } from "@/hooks/use-mobile";

describe("useIsMobile hook", () => {
  it("should return a boolean based on window width", () => {
    const { result } = renderHook(() => useIsMobile());
    expect(typeof result.current).toBe("boolean");
  });
});
