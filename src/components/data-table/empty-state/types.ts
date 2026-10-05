import type React from "react";

import type { Button } from "@/components/ui/button";

export type TableEmptyStateIconColor = "muted" | "primary" | "warning" | "destructive" | "success";

export type TableEmptyStateSize = "sm" | "md" | "lg";

export interface TableEmptyStateAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  disabled?: boolean;
  className?: string;
}

export interface TableEmptyStateProps {
  heading?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  iconColor?: TableEmptyStateIconColor;
  size?: TableEmptyStateSize;
  actions?: React.ReactNode | TableEmptyStateAction[];
  renderActions?: (actions: React.ReactNode) => React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export interface TableEmptyStateContext {
  isFiltered: boolean;
  resetFilters?: () => void;
  onResetFilters?: () => void;
  resetFiltersText?: string;
}

export interface TableEmptyStateConfig extends TableEmptyStateProps {
  filtered?: TableEmptyStateProps;
}

// Aliases for DataTable compatibility
export type DataTableEmptyStateIconColor = TableEmptyStateIconColor;
export type DataTableEmptyStateSize = TableEmptyStateSize;
export type DataTableEmptyStateAction = TableEmptyStateAction;
export type DataTableEmptyStateProps = TableEmptyStateProps;
export type DataTableEmptyStateContext = TableEmptyStateContext;
export type DataTableEmptyStateConfig = TableEmptyStateConfig;
