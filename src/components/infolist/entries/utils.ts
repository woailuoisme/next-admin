/**
 * 安全序列化任意对象值，遇到循环引用或 BigInt 等异常时回退为 String(value)。
 */
export function safeStringify(value: unknown, pretty = false): string {
  if (typeof value !== "object" || value === null) {
    return String(value ?? "");
  }

  try {
    return pretty ? JSON.stringify(value, null, 2) : JSON.stringify(value);
  } catch {
    return String(value);
  }
}
