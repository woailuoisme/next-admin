import { NextResponse } from "next/server";
import { z } from "zod";

import { requireSession } from "../guard";

const ALLOWED_PUBLISH_ROLES = new Set(["superadmin", "admin", "manager", "operator"]);
const CHANNEL_PATTERN = /^[a-zA-Z0-9:_-]{1,128}$/;

const publishBodySchema = z.object({
  channel: z.string().trim().regex(CHANNEL_PATTERN, "Invalid channel format"),
  data: z.record(z.string(), z.unknown()),
});

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
  const session = await requireSession(request);
  if (session instanceof NextResponse) return session;

  if (!ALLOWED_PUBLISH_ROLES.has(session.role)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch (err) {
    console.error("[Realtime Publish API] Request error:", err);
    return NextResponse.json({ success: false, error: "Invalid publish request body" }, { status: 400 });
  }

  const rawObj = typeof rawBody === "object" && rawBody !== null ? (rawBody as Record<string, unknown>) : null;
  if (!rawObj?.channel || rawObj.data === undefined || rawObj.data === null) {
    return NextResponse.json({ success: false, error: "Channel and data are required" }, { status: 400 });
  }

  const parsed = publishBodySchema.safeParse(rawObj);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid channel or data payload" }, { status: 400 });
  }

  const { channel, data } = parsed.data;

  try {
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
        signal: AbortSignal.timeout(5000),
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
