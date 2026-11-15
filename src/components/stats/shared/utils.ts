const STRICT_NUMBER_RE = /^[+-]?(?:\d+\.?\d*|\.\d+)$/;

/**
 * 解析可能带常见货币符号、百分号、空格或千分位分隔符的有限数值输入
 * 拒绝科学计数法与多小数点等畸形字符串；无法解析时返回 NaN
 */
export function parseNumericValue(input: number | string | null | undefined): number {
  if (typeof input === "number") {
    return Number.isFinite(input) ? input : Number.NaN;
  }
  if (input === null || input === undefined) {
    return Number.NaN;
  }
  const cleaned = String(input)
    .trim()
    .replace(/[\s,$¥€£%]/g, "");
  if (!STRICT_NUMBER_RE.test(cleaned)) {
    return Number.NaN;
  }
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}
