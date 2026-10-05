import * as React from "react";

import { cn } from "@/lib/utils";

import type { InfolistGridProps } from "./types";

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

const defaultColsMap: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  12: "grid-cols-12",
};

const smColsMap: Record<number, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  6: "sm:grid-cols-6",
  12: "sm:grid-cols-12",
};

const mdColsMap: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  6: "md:grid-cols-6",
  12: "md:grid-cols-12",
};

const lgColsMap: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  6: "lg:grid-cols-6",
  12: "lg:grid-cols-12",
};

const xlColsMap: Record<number, string> = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  6: "xl:grid-cols-6",
  12: "xl:grid-cols-12",
};

export const InfolistGrid = React.memo(function InfolistGrid({
  columns = 1,
  gap = "md",
  className,
  children,
  ...props
}: InfolistGridProps) {
  const gridColsClass =
    typeof columns === "number"
      ? (numberColsMap[columns] ?? "grid-cols-1")
      : cn(
          columns.default ? (defaultColsMap[columns.default] ?? "grid-cols-1") : "grid-cols-1",
          columns.sm && smColsMap[columns.sm],
          columns.md && mdColsMap[columns.md],
          columns.lg && lgColsMap[columns.lg],
          columns.xl && xlColsMap[columns.xl],
        );

  return (
    <div className={cn("grid w-full", gridColsClass, gapClasses[gap], className)} {...props}>
      {children}
    </div>
  );
});
