/**
 * 解析可能带单位、百分号或千分位的数值输入
 * 无法解析时返回 NaN，调用方负责兜底
 */
export function parseNumericValue(input: number | string | null | undefined): number {
  if (typeof input === "number") {
    return input;
  }
  return Number.parseFloat(String(input ?? "").replace(/[^0-9.-]/g, ""));
}
