import { z } from "zod";

/**
 * Standard table search parameters for URL synchronization.
 * Follows Zod 4 declarative rules with zero custom error messages.
 */
export const baseTableSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type BaseTableSearchParams = z.infer<typeof baseTableSearchSchema>;

/**
 * 将 URL 查询字符串中的标量值转为对应的原生类型（布尔 / 有效正整数 / 原字符串），
 * 保留前导零邮编或超长数字串不被强转破坏。
 */
export function parseScalarSearchParam(value: string): string | number | boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^\d+$/.test(value) && value.length < 10 && !value.startsWith("0")) {
    const num = Number(value);
    return Number.isNaN(num) ? value : num;
  }
  return value;
}

/**
 * 使用可选 Zod schema 校验并剔除 undefined 与未声明的额外查询参数，
 * 供 SSR 与 CSR 共用，确保两端 TanStack Query `queryKey` 结构一致。
 */
export function normalizeSearchParamsWithSchema<TFilters>(
  normalized: Record<string, unknown>,
  searchSchema?: z.ZodType<TFilters>,
): TFilters {
  if (!searchSchema) {
    return normalized as TFilters;
  }
  const parsed = searchSchema.safeParse(normalized);
  if (!parsed.success) {
    return normalized as TFilters;
  }
  const compact: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(parsed.data as Record<string, unknown>)) {
    if (val !== undefined) {
      compact[key] = val;
    }
  }
  return compact as TFilters;
}
