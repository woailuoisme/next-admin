"use client";

import { memo, type ReactNode } from "react";

import { type GridGap, resolveGridClassName } from "@/components/shared/grid";

import type { GridColumns } from "../core";

export interface FormGridProps {
  columns?: GridColumns;
  gap?: GridGap;
  className?: string;
  children: ReactNode;
}

export const FormGrid = memo(function FormGrid({ columns = 1, gap = "md", className, children }: FormGridProps) {
  return <div className={resolveGridClassName(columns, gap, className)}>{children}</div>;
});
