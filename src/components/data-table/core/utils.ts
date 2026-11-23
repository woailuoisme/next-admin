import type { CSSProperties } from "react";

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

/**
 * 统一解析展开列的逻辑起始粘性偏移（存在勾选列时紧随 44px 勾选列之后）
 */
export function resolveExpandColumnLeft(checkboxSelection: boolean, hasPinnedStart: boolean): string | undefined {
  if (checkboxSelection) return "44px";
  return hasPinnedStart ? "0px" : undefined;
}

export interface BuildColumnPinStylesOptions {
  varKey: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  isLeftPinned: boolean;
  isRightPinned: boolean;
  leftFallback?: string;
  rightFallback?: string;
}

/**
 * 统一构造表头、数据行、汇总行与骨架屏单元格的宽度及逻辑起止（insetInlineStart/End）粘性定位样式
 */
export function buildColumnPinStyles({
  varKey,
  width,
  minWidth,
  maxWidth,
  isLeftPinned,
  isRightPinned,
  leftFallback = "0px",
  rightFallback = "0px",
}: BuildColumnPinStylesOptions): CSSProperties {
  return {
    width: `var(--col-w-${varKey}, ${width ? `${width}px` : "auto"})`,
    minWidth: minWidth ? `${minWidth}px` : undefined,
    maxWidth: maxWidth ? `${maxWidth}px` : undefined,
    insetInlineStart: isLeftPinned ? `var(--col-left-${varKey}, ${leftFallback})` : undefined,
    insetInlineEnd: isRightPinned ? `var(--col-right-${varKey}, ${rightFallback})` : undefined,
  };
}
