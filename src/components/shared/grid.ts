import { cn } from "cn";

/**
 * 12 栅格跨度 token（form / infolist / dialogs 共用同一套栅格体系）
 */
export type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full";

export type ColumnsCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface ResponsiveColumns {
  default?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export type GridColumns = number | ResponsiveColumns;

export type GridGap = "none" | "sm" | "compact" | "md" | "lg";

/**
 * 栅格跨度 token → Tailwind 类名
 */
export const COL_SPAN_CLASSES: Record<ColSpan, string> = {
  1: "col-span-1",
  2: "col-span-1 md:col-span-2",
  3: "col-span-1 md:col-span-3",
  4: "col-span-1 md:col-span-4",
  5: "col-span-1 md:col-span-5",
  6: "col-span-1 md:col-span-6",
  7: "col-span-1 md:col-span-7",
  8: "col-span-1 md:col-span-8",
  9: "col-span-1 md:col-span-9",
  10: "col-span-1 md:col-span-10",
  11: "col-span-1 md:col-span-11",
  12: "col-span-full",
  full: "col-span-full",
};

export const GRID_GAP_CLASSES: Record<GridGap, string> = {
  none: "gap-0",
  sm: "gap-2.5",
  compact: "gap-3",
  md: "gap-4",
  lg: "gap-6",
};

const NUMBER_COLS_MAP: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
  6: "grid-cols-1 sm:grid-cols-3 lg:grid-cols-6",
  7: "grid-cols-1 sm:grid-cols-3 lg:grid-cols-7",
  8: "grid-cols-1 sm:grid-cols-4 lg:grid-cols-8",
  9: "grid-cols-1 sm:grid-cols-3 lg:grid-cols-9",
  10: "grid-cols-1 sm:grid-cols-5 lg:grid-cols-10",
  11: "grid-cols-1 sm:grid-cols-4 lg:grid-cols-11",
  12: "grid-cols-12",
};

/**
 * 断点 → 列数 → Tailwind 静态类名全量映射（覆盖 1..12 列，确保 Tailwind v4 JIT 静态扫描生成）
 */
const DEFAULT_COLS_MAP: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
  9: "grid-cols-9",
  10: "grid-cols-10",
  11: "grid-cols-11",
  12: "grid-cols-12",
};

const SM_COLS_MAP: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
  7: "sm:grid-cols-7",
  8: "sm:grid-cols-8",
  9: "sm:grid-cols-9",
  10: "sm:grid-cols-10",
  11: "sm:grid-cols-11",
  12: "sm:grid-cols-12",
};

const MD_COLS_MAP: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
  7: "md:grid-cols-7",
  8: "md:grid-cols-8",
  9: "md:grid-cols-9",
  10: "md:grid-cols-10",
  11: "md:grid-cols-11",
  12: "md:grid-cols-12",
};

const LG_COLS_MAP: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  7: "lg:grid-cols-7",
  8: "lg:grid-cols-8",
  9: "lg:grid-cols-9",
  10: "lg:grid-cols-10",
  11: "lg:grid-cols-11",
  12: "lg:grid-cols-12",
};

const XL_COLS_MAP: Record<number, string> = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
  6: "xl:grid-cols-6",
  7: "xl:grid-cols-7",
  8: "xl:grid-cols-8",
  9: "xl:grid-cols-9",
  10: "xl:grid-cols-10",
  11: "xl:grid-cols-11",
  12: "xl:grid-cols-12",
};

/**
 * 统一解析网格容器类名（columns + gap）
 */
export function resolveGridClassName(columns: GridColumns = 1, gap: GridGap = "md", className?: string): string {
  const gridColsClass =
    typeof columns === "number"
      ? (NUMBER_COLS_MAP[columns] ?? "grid-cols-1")
      : cn(
          columns.default ? (DEFAULT_COLS_MAP[columns.default] ?? "grid-cols-1") : "grid-cols-1",
          columns.sm ? SM_COLS_MAP[columns.sm] : undefined,
          columns.md ? MD_COLS_MAP[columns.md] : undefined,
          columns.lg ? LG_COLS_MAP[columns.lg] : undefined,
          columns.xl ? XL_COLS_MAP[columns.xl] : undefined,
        );

  return cn("grid w-full", gridColsClass, GRID_GAP_CLASSES[gap], className);
}

/**
 * 解析纯数字列数到固定非响应式 `grid-cols-*`（适用于表头/等分内部栅格）
 */
export function resolveFixedColsClassName(columns: number): string {
  return DEFAULT_COLS_MAP[columns] ?? "grid-cols-1";
}
