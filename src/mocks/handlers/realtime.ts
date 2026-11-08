import { http, HttpResponse, passthrough } from "msw";

export const realtimeHandlers = [
  // 连接令牌必须由服务端用 HMAC 密钥真实签发（含 aud 声明），浏览器端无法伪造，故放行到真实路由
  http.get("/api/realtime/token", () => passthrough()),
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
