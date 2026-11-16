import type { DataTableColDef } from "./types";

/**
 * 统一单元格取值：优先使用列的 valueGetter，回退到行的同名字段
 * 收敛原先散落在表体 / 表尾 / 导出 / 排序中的 `valueGetter ? ... : (row as any)[field]`
 */
export function readCellValue<TData>(row: TData, col: Pick<DataTableColDef<TData>, "field" | "valueGetter">): unknown {
  if (col.valueGetter) {
    return col.valueGetter(row);
  }
  return (row as Record<string, unknown>)[col.field];
}

const CSS_VAR_UNSAFE_RE = /[^a-zA-Z0-9_-]/g;

/**
 * 将列 field 规整为合法的 CSS 自定义属性后缀（保留常见字母/数字/_/-，避免嵌套路径 `.` 破坏 var(--col-*)）。
 */
export function toColumnCssVarKey(field: string): string {
  return field.replace(CSS_VAR_UNSAFE_RE, "_");
}

/**
 * 统一判断列是否可见：显式切换记录（columnVisibility）优先于列定义初始 hidden。
 */
export function isColumnVisible<TData>(
  col: Pick<DataTableColDef<TData>, "field" | "hidden">,
  columnVisibility: Record<string, boolean>,
): boolean {
  const explicit = columnVisibility[col.field];
  if (explicit !== undefined) {
    return explicit;
  }
  return !col.hidden;
}
