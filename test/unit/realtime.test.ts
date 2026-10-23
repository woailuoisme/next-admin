import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST as publishMessage } from "@/app/api/realtime/publish/route";
import { GET as getToken } from "@/app/api/realtime/token/route";

const TOKEN_URL = "http://localhost:3000/api/realtime/token";
const PUBLISH_URL = "http://localhost:3000/api/realtime/publish";
const SESSION_COOKIE = "auth_token=test-session-token";

/** Request 会把 cookie 当作 forbidden header 丢弃，这里直接注入读取实现 */
function request(url: string, init: RequestInit = {}): Request {
  const req = new Request(url, init);
  const headers = { get: (name: string) => (name.toLowerCase() === "cookie" ? SESSION_COOKIE : null) };

  return { url: req.url, json: () => req.json(), headers } as unknown as Request;
}

describe("Realtime API Endpoints", () => {
  beforeEach(() => {
    vi.stubEnv("CENTRIFUGO_CLIENT_TOKEN_HMAC_SECRET_KEY", "unit-test-secret");
    vi.stubEnv("CENTRIFUGO_HTTP_API_KEY", "unit-test-api-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("GET /api/realtime/token", () => {
    it("rejects anonymous callers", async () => {
      const response = await getToken(new Request(TOKEN_URL));
      expect(response.status).toBe(401);
    });

    it("issues a valid HMAC-SHA256 JWT token with user claim", async () => {
      const response = await getToken(request(TOKEN_URL));
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(typeof data.token).toBe("string");
      expect(typeof data.expiresAt).toBe("number");

      const parts = data.token.split(".");
      expect(parts.length).toBe(3);

      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
      expect(payload.sub).toBe(data.user);
      expect(payload.exp).toBe(Math.floor(data.expiresAt / 1000));
      expect(payload.info?.name).toBe("Administrator");
    });

    it("honours user / name / role query overrides", async () => {
      const response = await getToken(request(`${TOKEN_URL}?user=alice&name=Alice&role=auditor`));
      const data = await response.json();

      expect(data.user).toBe("alice");
      const payload = JSON.parse(Buffer.from(data.token.split(".")[1], "base64url").toString("utf-8"));
      expect(payload.info).toMatchObject({ name: "Alice", role: "auditor" });
    });

    it("fails loudly when the signing secret is not configured", async () => {
      vi.stubEnv("CENTRIFUGO_CLIENT_TOKEN_HMAC_SECRET_KEY", "");
      const response = await getToken(request(TOKEN_URL));
      expect(response.status).toBe(500);
    });
  });

  describe("POST /api/realtime/publish", () => {
    it("rejects anonymous callers", async () => {
      const response = await publishMessage(
        new Request(PUBLISH_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: "public:test", data: { a: 1 } }),
        }),
      );
      expect(response.status).toBe(401);
    });

    it("returns HTTP 400 when channel is missing", async () => {
      const response = await publishMessage(
        request(PUBLISH_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: { message: "hello" } }),
        }),
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Channel and data are required");
    });

    it("returns 502 + simulated when Centrifugo is unreachable", async () => {
      const before = Math.floor(Date.now() / 1000);
      const response = await publishMessage(
        request(PUBLISH_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: "public:test-channel",
            data: { title: "Test Alert", level: "info" },
          }),
        }),
      );

      expect(response.status).toBe(502);
      const body = await response.json();
      expect(body.simulated).toBe(true);
      expect(body.channel).toBe("public:test-channel");
      // offset 统一为秒级，避免与上游偏移量单位不一致
      expect(body.result.offset).toBeGreaterThanOrEqual(before);
      expect(body.result.offset).toBeLessThan(before + 60);
    });
  });
});
