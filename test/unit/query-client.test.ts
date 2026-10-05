import { describe, expect, it } from "vitest";

import { getQueryClient, makeQueryClient } from "@/lib/query-client";

describe("QueryClient Request-Scoped Factory (@/lib/query-client)", () => {
  it("makeQueryClient should create a configured QueryClient with 1 min staleTime", () => {
    const client = makeQueryClient();
    const defaultOptions = client.getDefaultOptions();

    expect(defaultOptions.queries?.staleTime).toBe(60 * 1000);
    expect(defaultOptions.queries?.retry).toBe(1);
  });

  it("getQueryClient should return a valid QueryClient instance", () => {
    const client1 = getQueryClient();
    expect(client1).toBeDefined();

    // In jsdom environment (browser), it returns the singleton instance
    const client2 = getQueryClient();
    expect(client1).toBe(client2);
  });
});
