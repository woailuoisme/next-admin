import { NextResponse } from "next/server";

import { requireSession } from "../guard";

interface PublishRequestBody {
  channel: string;
  data: Record<string, unknown>;
}

/** 上游不可用时的降级响应：明确标记 simulated，避免被当成投递成功 */
function simulatedResponse(channel: string, epoch: string, warning?: string) {
  return NextResponse.json(
    {
      success: false,
      simulated: true,
      channel,
      ...(warning ? { warning } : {}),
      result: { offset: Math.floor(Date.now() / 1000), epoch },
    },
    { status: 502 },
  );
}

export async function POST(request: Request) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as PublishRequestBody;
    const { channel, data } = body;

    if (!channel || !data) {
      return NextResponse.json({ success: false, error: "Channel and data are required" }, { status: 400 });
    }

    const apiKey = process.env.CENTRIFUGO_HTTP_API_KEY;
    if (!apiKey) {
      console.error("[Realtime Publish API] CENTRIFUGO_HTTP_API_KEY is not configured");
      return NextResponse.json({ success: false, error: "Realtime API key not configured" }, { status: 500 });
    }

    const apiUrl = process.env.CENTRIFUGO_API_URL || "http://localhost:48000/api";

    try {
      const response = await fetch(`${apiUrl}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `apikey ${apiKey}`,
        },
        body: JSON.stringify({ channel, data }),
      });

      if (response.ok) {
        const result = await response.json();
        return NextResponse.json({
          success: true,
          channel,
          result: result.result || {},
        });
      }

      const errorText = await response.text();
      console.warn(`[Realtime Publish API] Centrifugo responded with HTTP ${response.status}: ${errorText}`);
      return simulatedResponse(channel, "simulated", `Centrifugo status ${response.status}`);
    } catch (networkError) {
      // 容器未启动时不让演示中断，但通过 502 + simulated 暴露真实状态
      console.warn("[Realtime Publish API] Centrifugo unreachable, returning simulated result:", networkError);
      return simulatedResponse(channel, "offline_fallback");
    }
  } catch (err) {
    console.error("[Realtime Publish API] Request error:", err);
    return NextResponse.json({ success: false, error: "Invalid publish request body" }, { status: 500 });
  }
}
