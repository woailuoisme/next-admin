import { sanitizeRichEditorUrl } from "@/components/shared/url";

export { sanitizeRichEditorUrl };

/**
 * 富文本编解码契约：支持 HTML 与 Markdown 互转及统一 XSS / URL 协议净化。
 */
export interface RichEditorCodec {
  decode: (externalValue: string) => string;
  encode: (editorHtml: string, isEmpty: boolean) => string;
  isEqual?: (htmlA: string, htmlB: string) => boolean;
}

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
}

export function simpleHtmlToMarkdown(html: string): string {
  if (!html || html === "<p></p>") return "";
  return html
    .replace(/<h1>([\s\S]*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2>([\s\S]*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3>([\s\S]*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<b>([\s\S]*?)<\/b>/gi, "**$1**")
    .replace(/<em>([\s\S]*?)<\/em>/gi, "*$1*")
    .replace(/<i>([\s\S]*?)<\/i>/gi, "*$1*")
    .replace(/<s>([\s\S]*?)<\/s>/gi, "~~$1~~")
    .replace(/<del>([\s\S]*?)<\/del>/gi, "~~$1~~")
    .replace(/<code>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<blockquote><p>([\s\S]*?)<\/p><\/blockquote>/gi, "> $1\n\n")
    .replace(/<blockquote>([\s\S]*?)<\/blockquote>/gi, "> $1\n\n")
    .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, "```\n$1\n```\n\n")
    .replace(/<hr\s*\/?>/gi, "---\n\n")
    .replace(/<li><p>([\s\S]*?)<\/p><\/li>/gi, "- $1\n")
    .replace(/<li>([\s\S]*?)<\/li>/gi, "- $1\n")
    .replace(/<\/?(ul|ol)>/gi, "\n")
    .replace(
      /<a[^>]*href=(?:"([^"]*)"|'([^']*)')[^>]*>([\s\S]*?)<\/a>/gi,
      (_, dqHref: string | undefined, sqHref: string | undefined, label: string) => {
        const safeHref = sanitizeRichEditorUrl(dqHref ?? sqHref ?? "");
        return safeHref ? `[${label}](${safeHref})` : label;
      },
    )
    .replace(/<p>([\s\S]*?)<\/p>/gi, "$1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

const DANGEROUS_CONTAINER_RE = /<(script|iframe|object|embed|style|link|meta|base)\b[^>]*>[\s\S]*?<\/\1>/gi;
const DANGEROUS_STRAY_TAG_RE = /<\/?(script|iframe|object|embed|style|link|meta|base)\b[^>]*\/?>/gi;
const INLINE_EVENT_ATTR_RE = /(?:^|[\s/])on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const URL_ATTR_RE = /\b(href|src|formaction)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;

/**
 * 净化原生 HTML 富文本，先循环剥离嵌套危险容器标签再清理残留标签、空白/斜杠分隔事件处理器及非法协议。
 */
export function sanitizeRichHtml(html: string): string {
  if (!html) return "";
  let strippedTags = html;
  let prev: string;
  do {
    prev = strippedTags;
    strippedTags = strippedTags.replace(DANGEROUS_CONTAINER_RE, "");
  } while (strippedTags !== prev);

  return strippedTags
    .replace(DANGEROUS_STRAY_TAG_RE, "")
    .replace(INLINE_EVENT_ATTR_RE, " ")
    .replace(URL_ATTR_RE, (_, attr: string, dq?: string, sq?: string, uq?: string) => {
      const rawUrl = dq ?? sq ?? uq ?? "";
      const safeUrl = sanitizeRichEditorUrl(rawUrl);
      if (!safeUrl) return "";
      return `${attr}="${escapeHtml(safeUrl)}"`;
    });
}

function applyEmphasisMarkdown(escapedText: string): string {
  return escapedText
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/~~(.*?)~~/g, "<s>$1</s>");
}

function formatInlineMarkdownSafe(line: string): string {
  const escaped = escapeHtml(line);
  const tokens: string[] = [];
  const stashToken = (html: string): string => {
    const idx = tokens.push(html) - 1;
    return `\uE000TOK_${idx}\uE001`;
  };

  // 先提取行内代码与超链接，避免后续 `*`/`~~` 规则误伤链接 URL
  const protectedLine = escaped
    .replace(/`([^`]+)`/g, (_, code: string) => stashToken(`<code>${code}</code>`))
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, rawHref: string) => {
      const safeHref = sanitizeRichEditorUrl(rawHref);
      const formattedLabel = applyEmphasisMarkdown(label);
      if (!safeHref) return stashToken(formattedLabel);
      return stashToken(`<a href="${escapeHtml(safeHref)}">${formattedLabel}</a>`);
    });

  return applyEmphasisMarkdown(protectedLine).replace(/\uE000TOK_(\d+)\uE001/g, (_, idx) => tokens[Number(idx)] ?? "");
}

export function simpleMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";
  const lines = markdown.split("\n");
  const htmlParts: string[] = [];
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      continue;
    }

    if (line.startsWith("### ")) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push(`<h3>${formatInlineMarkdownSafe(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push(`<h2>${formatInlineMarkdownSafe(line.slice(3))}</h2>`);
    } else if (line.startsWith("# ")) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push(`<h1>${formatInlineMarkdownSafe(line.slice(2))}</h1>`);
    } else if (line.startsWith("> ")) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push(`<blockquote><p>${formatInlineMarkdownSafe(line.slice(2))}</p></blockquote>`);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        htmlParts.push("<ul>");
        inList = true;
      }
      htmlParts.push(`<li><p>${formatInlineMarkdownSafe(line.slice(2))}</p></li>`);
    } else if (line === "---") {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push("<hr />");
    } else {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push(`<p>${formatInlineMarkdownSafe(line)}</p>`);
    }
  }

  if (inList) {
    htmlParts.push("</ul>");
  }

  return htmlParts.join("");
}

export const htmlRichEditorCodec: RichEditorCodec = {
  decode: (value) => sanitizeRichHtml(value || ""),
  encode: (html, isEmpty) => (isEmpty ? "" : sanitizeRichHtml(html)),
};

export const markdownRichEditorCodec: RichEditorCodec = {
  decode: (value) => simpleMarkdownToHtml(value || ""),
  encode: (html, isEmpty) => (isEmpty ? "" : simpleHtmlToMarkdown(html)),
};

export function resolveRichEditorCodec(
  format: "html" | "markdown" = "html",
  customCodec?: RichEditorCodec,
): RichEditorCodec {
  if (customCodec) return customCodec;
  return format === "markdown" ? markdownRichEditorCodec : htmlRichEditorCodec;
}
