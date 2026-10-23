/**
 * 校验重定向目标路径是否为合法的同源相对路径，防止开放重定向（Open Redirect）攻击。
 *
 * 规则：
 * 1. 必须以单个 '/' 开头，严禁以 '//'、'/\\' 开头（防止协议相对 URL 或反斜杠绕过）。
 * 2. 严禁包含协议头 '://' 或 '\\' 反斜杠字符。
 * 3. 避免重定向到登录页自身（/login）导致重定向死循环。
 * 4. 必须能通过 URL 相对路径解析校验且 Origin 为同源主机。
 *
 * @param target 待校验的重定向目标 URL
 * @param fallback 校验失败时的默认回退路径，默认为 "/overview"
 */
export function getSafeRedirectUrl(target: string | null | undefined, fallback = "/overview"): string {
  if (!target || typeof target !== "string") {
    return fallback;
  }

  const trimmed = target.trim();
  if (!trimmed) {
    return fallback;
  }

  // 必须以单个 '/' 开头，禁止协议相对路径 //evil.com 或 /\evil.com
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }

  // 禁止反斜杠与协议头注入
  if (trimmed.includes("\\") || trimmed.includes("://")) {
    return fallback;
  }

  // 防止登录页内部死循环
  if (trimmed === "/login" || trimmed.startsWith("/login?") || trimmed.startsWith("/login/")) {
    return fallback;
  }

  try {
    const dummyOrigin = "http://localhost";
    const parsed = new URL(trimmed, dummyOrigin);

    // 确保 hostname 保持为 dummyOrigin，未被构造技巧篡改
    if (parsed.origin !== dummyOrigin) {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
