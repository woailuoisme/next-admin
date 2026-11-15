"use client";

import * as React from "react";

import { resolveGridClassName } from "@/components/shared/grid";

import type { InfolistGridProps } from "./types";

export const InfolistGrid = React.memo(function InfolistGrid({
  columns = 1,
  gap = "md",
  className,
  children,
  ...props
}: InfolistGridProps) {
  return (
    <div className={resolveGridClassName(columns, gap, className)} {...props}>
      {children}
    </div>
  );
});
