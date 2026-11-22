import type React from "react";

export type DataTableFilterOperator =
  | "contains"
  | "notContains"
  | "equals"
  | "notEquals"
  | "startsWith"
  | "endsWith"
  | "isEmpty"
  | "isNotEmpty"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual"
  | "is";

export interface DataTableFilterItem {
  id: string;
  field: string;
  operator: DataTableFilterOperator;
  value?: any;
}

export interface DataTableFilterModel {
  items: DataTableFilterItem[];
  quickFilterValues?: string[];
}

export type DataTableFilterLayout = "popover" | "sheet" | "aboveContent";

export interface DataTableSelectFilterOption {
  label: string;
  value: string | number;
  badge?: string | number;
  badgeColor?: string;
}

export interface DataTableSelectFilterDef {
  type: "select";
  field?: string;
  name?: string;
  columnField?: string;
  label?: string;
  options: DataTableSelectFilterOption[];
  multiple?: boolean;
  placeholder?: string;
}

export interface DataTableTernaryFilterDef {
  type: "ternary";
  field?: string;
  name?: string;
  columnField?: string;
  label?: string;
  trueLabel?: string;
  falseLabel?: string;
  placeholder?: string;
}

export interface DataTableCustomFilterDef {
  type: "custom";
  field?: string;
  name?: string;
  columnField?: string;
  label?: string;
  render: (props: { value: any; onChange: (val: any) => void; filterItem?: DataTableFilterItem }) => React.ReactNode;
}

export type DataTableFilterDefinition = DataTableSelectFilterDef | DataTableTernaryFilterDef | DataTableCustomFilterDef;

export interface DataTableFilterConfig {
  layout?: DataTableFilterLayout;
  columns?: 1 | 2 | 3 | 4;
  deferFilters?: boolean;
  sheetTitle?: string;
  sheetDescription?: string;
  filters?: DataTableFilterDefinition[];
  showQueryBuilder?: boolean;
  showActiveFiltersPills?: boolean;
  maxHeight?: number | string;
}
