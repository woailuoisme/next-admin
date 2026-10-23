import type * as React from "react";

export type GridColumns =
  | 1
  | 2
  | 3
  | 4
  | 6
  | 12
  | {
      default?: number;
      sm?: number;
      md?: number;
      lg?: number;
      xl?: number;
    };

export interface InfolistGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: GridColumns;
  gap?: "none" | "sm" | "md" | "lg";
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
  /** 可选国际化字典覆盖 */

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
