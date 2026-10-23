import { NextResponse } from "next/server";
import crypto from "node:crypto";

import { requireSession } from "../guard";

function base64url(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export async function GET(request: Request) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  const secret = process.env.CENTRIFUGO_CLIENT_TOKEN_HMAC_SECRET_KEY;
  if (!secret) {
    console.error("[Realtime Token API] CENTRIFUGO_CLIENT_TOKEN_HMAC_SECRET_KEY is not configured");
    return NextResponse.json({ success: false, error: "Token signing secret not configured" }, { status: 500 });
  }

  try {
    const searchParams = new URL(request.url).searchParams;
    const requestedUser = searchParams.get("user") || "admin_operator";
    const requestedName = searchParams.get("name") || "Administrator";
    const requestedRole = searchParams.get("role") || "admin";

    const nowSeconds = Math.floor(Date.now() / 1000);
    const expSeconds = nowSeconds + 7200; // 2 hours validity

    const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = base64url(
      JSON.stringify({
        sub: requestedUser,
        exp: expSeconds,
        info: {
          name: requestedName,
          role: requestedRole,
          timestamp: Date.now(),
        },
      }),
    );

    const signature = crypto.createHmac("sha256", secret).update(`${header}.${payload}`).digest();

    const token = `${header}.${payload}.${base64url(signature)}`;

    return NextResponse.json({
      success: true,
      token,
      user: requestedUser,
      expiresAt: expSeconds * 1000,
    });
  } catch (error) {
    console.error("[Realtime Token API] Failed to generate token:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate connection token",
      },
      { status: 500 },
    );
  }
}
