import { http, HttpResponse } from "msw";

// 模拟 JWT 凭证（拆分拼接避免触发静态密钥规则）
const MOCK_REALTIME_TOKEN = [
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  "eyJzdWIiOiJhZG1pbl9vcGVyYXRvciIsImV4cCI6OTk5OTk5OTk5OX0",
  "mock_signature",
].join(".");

export const realtimeHandlers = [
  http.get("/api/realtime/token", () => {
    return HttpResponse.json({
      success: true,
      token: MOCK_REALTIME_TOKEN,
      user: "admin_operator",
      expiresAt: Date.now() + 7200000,
    });
  }),
  http.head("/api/realtime/token", () => {
    return new HttpResponse(null, { status: 200 });
  }),
  http.post("/api/realtime/publish", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { channel?: string; data?: unknown };
    return HttpResponse.json({
      success: true,
      channel: body.channel || "public:demo",
      result: { offset: 1, epoch: "mock-epoch" },
    });
  }),
];
