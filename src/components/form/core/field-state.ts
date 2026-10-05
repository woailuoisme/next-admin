import { useId } from "react";

/**
 * 统一的字段 DOM id
 * 显式 id 优先 → 按字段名派生（保证 label htmlFor 与控件可关联）→ React 自动 id
 */
export function useFieldId(name?: string, explicitId?: string): string {
  const autoId = useId();
  return explicitId || (name ? `field-${name}` : autoId);
}

/**
 * 统一的字段错误态判定
 * 显式 error 优先，否则取 TanStack Form meta（仅在已触碰时展示校验错误）
 */
export function resolveFieldHasError(
  error: unknown,
  meta?: { isTouched?: boolean; errors?: unknown[] },
): boolean {
  return Boolean(error || (meta?.isTouched && meta?.errors?.length));
}
