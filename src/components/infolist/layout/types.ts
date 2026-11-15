import type * as React from "react";

import type { ColumnsCount, GridColumns, GridGap, ResponsiveColumns } from "@/components/shared/grid";

export type { ColumnsCount, GridColumns, GridGap, ResponsiveColumns };

export interface InfolistGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: GridColumns;
  gap?: GridGap;
  children?: React.ReactNode;
}

export interface InfolistSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  columns?: GridColumns;
  card?: boolean;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export interface InfolistFieldsetProps extends React.HTMLAttributes<HTMLFieldSetElement> {
  legend?: React.ReactNode;
  description?: React.ReactNode;
  columns?: GridColumns;
  children?: React.ReactNode;
}

export interface InfolistTabItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  columns?: GridColumns;
  children: React.ReactNode;
}

export interface InfolistTabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  tabs: InfolistTabItem[];
  className?: string;
}
