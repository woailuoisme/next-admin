import { NextResponse } from "next/server";

/**
 * /api 不经过 proxy 的会话门禁，实时接口需自行校验登录态。
 * 前端把 auth_token 写在同源 cookie 上，因此直接读请求头即可。
 */
export function requireSession(request: Request): NextResponse | null {
  const cookie = request.headers.get("cookie") ?? "";
  if (/(?:^|;\s*)auth_token=[^;\s]+/.test(cookie)) return null;
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}
