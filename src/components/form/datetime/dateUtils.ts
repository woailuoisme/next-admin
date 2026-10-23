import { isValid, parseISO } from "date-fns";

/**
 * 宽松解析受控日期值
 * 依次尝试：Date 实例 → ISO 字符串 → Date 可解析字符串；无效则返回 undefined
 */
export function parseDate(val: unknown): Date | undefined {
  if (!val) return undefined;
  if (val instanceof Date) return isValid(val) ? val : undefined;
  if (typeof val === "string") {
    const parsed = parseISO(val);
    if (isValid(parsed)) return parsed;
    const fallback = new Date(val);
    return isValid(fallback) ? fallback : undefined;
  }
  return undefined;
}
