import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/health/route";

describe("Health Check Route Handler (/api/health)", () => {
  it("should return HTTP 200 with healthy status and metadata", async () => {
    const response = await GET();

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("healthy");
    expect(data.environment).toBeDefined();
    expect(data.timestamp).toBeDefined();
    expect(typeof data.timestamp).toBe("string");
    expect(data.version).toBeDefined();
  });
});
