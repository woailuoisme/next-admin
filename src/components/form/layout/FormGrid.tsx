import { memo, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { GridColumns } from "../core";

export interface FormGridProps {
  columns?: GridColumns;
  gap?: "none" | "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}

const gapClasses = {
  none: "gap-0",
  sm: "gap-2.5",
  md: "gap-4",
  lg: "gap-6",
};

const numberColsMap: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  6: "grid-cols-1 sm:grid-cols-3 lg:grid-cols-6",
  12: "grid-cols-12",
};

/**
 * 断点 → 列数 → 类名
 * Tailwind 静态扫描源码字面量，必须写全量类名，禁止模板字符串拼接（否则类不会被生成）
 */
const responsiveColsMap: Record<"sm" | "md" | "lg" | "xl", Record<number, string>> = {
  sm: {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
    6: "sm:grid-cols-6",
    12: "sm:grid-cols-12",
  },
  md: {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    6: "md:grid-cols-6",
    12: "md:grid-cols-12",
  },
  lg: {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    6: "lg:grid-cols-6",
    12: "lg:grid-cols-12",
  },
  xl: {
    1: "xl:grid-cols-1",
    2: "xl:grid-cols-2",
    3: "xl:grid-cols-3",
    4: "xl:grid-cols-4",
    6: "xl:grid-cols-6",
    12: "xl:grid-cols-12",
  },
};

export const FormGrid = memo(function FormGrid({
  columns = 1,
  gap = "md",
  className,
  children,
}: FormGridProps) {
  const gridColsClass =
    typeof columns === "number"
      ? (numberColsMap[columns] ?? "grid-cols-1")
      : cn(
          "grid-cols-1",
          columns.sm && responsiveColsMap.sm[columns.sm],
          columns.md && responsiveColsMap.md[columns.md],
          columns.lg && responsiveColsMap.lg[columns.lg],
          columns.xl && responsiveColsMap.xl[columns.xl],
        );

  return <div className={cn("grid w-full", gridColsClass, gapClasses[gap], className)}>{children}</div>;
});
