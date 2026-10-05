/**
 * 简易 Markdown 与 HTML 互相转译转换器（轻量且不额外依赖外部库）
 */
export function simpleHtmlToMarkdown(html: string): string {
  if (!html || html === "<p></p>") return "";
  return html
    .replace(/<h1>(.*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2>(.*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3>(.*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i>(.*?)<\/i>/gi, "*$1*")
    .replace(/<s>(.*?)<\/s>/gi, "~~$1~~")
    .replace(/<del>(.*?)<\/del>/gi, "~~$1~~")
    .replace(/<code>(.*?)<\/code>/gi, "`$1`")
    .replace(/<blockquote><p>(.*?)<\/p><\/blockquote>/gi, "> $1\n\n")
    .replace(/<blockquote>(.*?)<\/blockquote>/gi, "> $1\n\n")
    .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, "```\n$1\n```\n\n")
    .replace(/<hr\s*\/?>/gi, "---\n\n")
    .replace(/<li><p>(.*?)<\/p><\/li>/gi, "- $1\n")
    .replace(/<li>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<\/?(ul|ol)>/gi, "\n")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<p>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
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
      htmlParts.push(`<h3>${line.slice(4)}</h3>`);
    } else if (line.startsWith("## ")) {
      htmlParts.push(`<h2>${line.slice(3)}</h2>`);
    } else if (line.startsWith("# ")) {
      htmlParts.push(`<h1>${line.slice(2)}</h1>`);
    } else if (line.startsWith("> ")) {
      htmlParts.push(`<blockquote><p>${line.slice(2)}</p></blockquote>`);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        htmlParts.push("<ul>");
        inList = true;
      }
      htmlParts.push(`<li><p>${line.slice(2)}</p></li>`);
    } else if (line === "---") {
      htmlParts.push("<hr />");
    } else {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      // 基础内联格式替换
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/~~(.*?)~~/g, "<s>$1</s>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
      htmlParts.push(`<p>${formatted}</p>`);
    }
  }

  if (inList) {
    htmlParts.push("</ul>");
  }

  return htmlParts.join("");
}
