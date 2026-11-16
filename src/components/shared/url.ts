export interface SanitizeUrlOptions {
  /** 允许 `mailto:` 与 `tel:` 协议（默认 false） */
  allowMailtoTel?: boolean;
  /** 允许同源单斜杠相对路径 `/path` 与页内锚点 `#hash`（默认 true） */
  allowRelative?: boolean;
  /** 将无协议裸域名如 `example.com` 自动补齐为 `https://example.com`（默认 false） */
  allowBareDomain?: boolean;
}

function decodeNamedSchemeEntities(raw: string): string {
  return raw
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&colon;/gi, ":")
    .replace(/&tab;/gi, "\t")
    .replace(/&newline;/gi, "\n");
}

function stripControlChars(input: string): string {
  return input.replace(/\p{Cc}+/gu, "");
}

function stripControlAndWhitespace(input: string): string {
  return input.replace(/[\p{Cc}\s]+/gu, "");
}

/**
 * 统一 URL 协议安全净化，阻断换行/控制符与 HTML 实体混淆绕过的 `javascript:` / `vbscript:` / `data:` 注入。
 */
export function sanitizeUrl(rawUrl: string, options: SanitizeUrlOptions = {}): string | null {
  const { allowMailtoTel = false, allowRelative = true, allowBareDomain = false } = options;

  const decoded = stripControlChars(decodeNamedSchemeEntities(rawUrl)).trim();
  if (!decoded) return null;

  // 剥离空白符、HTML 数字实体与控制字符后再校验协议，拦截 `java\tscript:` / `&#106;avascript:` 等绕过
  const stripped = stripControlAndWhitespace(
    decoded
      .replace(/&#(\d+);?/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16))),
  );

  if (!stripped) return null;

  if (/^(javascript|vbscript|data):/i.test(stripped)) {
    return null;
  }

  if (/^https?:\/\//i.test(stripped)) {
    return decoded;
  }

  if (allowMailtoTel && /^(mailto:|tel:)/i.test(stripped)) {
    return decoded;
  }

  if (allowRelative && /^(\/(?![/\\])|#)/i.test(stripped)) {
    return decoded;
  }

  // 拒绝协议相对路径 (`//evil.com`、`/\\evil.com`、`\\evil.com`) 及其他未知显式 scheme
  if (
    stripped.startsWith("//") ||
    stripped.startsWith("/\\") ||
    stripped.startsWith("\\") ||
    /^[a-z][a-z0-9+.-]*:/i.test(stripped)
  ) {
    return null;
  }

  return allowBareDomain ? `https://${decoded}` : null;
}

/**
 * 富文本与用户输入链接专用快捷净化：允许 http(s)、mailto、tel、相对路径/锚点，并补齐裸域名 https://
 */
export function sanitizeRichEditorUrl(rawUrl: string): string | null {
  return sanitizeUrl(rawUrl, {
    allowMailtoTel: true,
    allowRelative: true,
    allowBareDomain: true,
  });
}

/**
 * 媒体与附件 URL 安全净化：兼容 FileReader / ObjectURL (`blob:` 与安全光栅 `data:image/*;base64,...`)，
 * 同时复用 `sanitizeUrl` 阻断 `javascript:`、`vbscript:`、`data:text/html` 与 `SVG` 脚本注入。
 */
export function sanitizeMediaUrl(rawUrl?: string, options: { allowDataImage?: boolean } = {}): string | undefined {
  if (!rawUrl) return undefined;
  const safeStandard = sanitizeUrl(rawUrl, {
    allowRelative: true,
    allowBareDomain: false,
  });
  if (safeStandard) {
    return safeStandard;
  }

  const decoded = stripControlChars(decodeNamedSchemeEntities(rawUrl)).trim();
  const stripped = stripControlAndWhitespace(decoded);
  if (!stripped) return undefined;

  if (/^blob:/i.test(stripped)) {
    return decoded;
  }

  if (options.allowDataImage && /^data:image\/(png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=]+$/i.test(stripped)) {
    return decoded;
  }

  return undefined;
}

/**
 * 净化邮箱/电话纯值，阻断控制字符或内联伪协议注入
 */
export function sanitizeContactToken(rawValue: unknown): string | null {
  const cleaned = stripControlAndWhitespace(String(rawValue ?? ""));
  if (!cleaned || /^[a-z][a-z0-9+.-]*:/i.test(cleaned)) {
    return null;
  }
  return cleaned;
}
