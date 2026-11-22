import type { LucideIcon } from "lucide-react";
import type { NumberFormatOptions } from "next-intl";
import type { ComponentType, ReactNode } from "react";

import type { ActionEntry } from "@/components/actions";
import type { BaseTableSearchParams } from "@/components/data-table/core/tableSearchSchema";
import type {
  DataTableColDef,
  DataTableFilterDefinition,
  DataTablePinnedColumns,
  DataTableSlotProps,
  TableStateAdapter,
} from "@/components/data-table/core/types";
import type { BreadcrumbItem, DialogSize, SurfacePresentation } from "@/components/dialogs/types";
import type { AppFormContract } from "@/components/form/core/types";
import type { EntryOrientation } from "@/components/infolist/core/types";
import type { SchemaNode, SchemaOptionsFromResourceSpec } from "@/components/schema";
import type { GridColumns } from "@/components/shared/grid";
import type { SparklineLayout, StatCardTheme, StatDensity } from "@/components/stats/shared/types";
import type { StatCardTrendData } from "@/components/stats/stat-card/types";
import type { ResourceSubPageRenderProps } from "@/lib/resource/nextServerPage";
import type { ResourceCustomAction, ResourceDefinition } from "@/lib/resource/types";

export type ResourcePresentation = SurfacePresentation;
export type { BreadcrumbItem };

export type ResourceTranslateFn = (key: string, values?: Record<string, unknown>) => string;

export type ResourceActionsInput<TPayload> =
  | ActionEntry<TPayload>[]
  | ((ctx: { t: ResourceTranslateFn }) => ActionEntry<TPayload>[]);

export interface StatItemSpec {
  id: string;
  title: string;
  value: number | string | null;
  prefix?: ReactNode;
  suffix?: ReactNode;
  formatOptions?: NumberFormatOptions;
  icon?: LucideIcon;
  theme?: StatCardTheme;
  description?: string;
  trend?: StatCardTrendData;
  sparklineData?: number[];
  sparklineType?: "area" | "bar";
}

export interface ResourceStatsSchema<TItem, TListResponse> {
  columns?: 2 | 3 | 4;
  density?: StatDensity;
  sparklineLayout?: SparklineLayout;
  build: (ctx: {
    rows: TItem[];
    total: number;
    rawResponse: TListResponse | undefined;
    t: ResourceTranslateFn;
  }) => StatItemSpec[];
}

export interface ResourceFormSlotContext<TItem> {
  form: AppFormContract & { Field: ComponentType<any> };
  mode: "create" | "edit";
  entity: TItem | null;
  isEditing: boolean;
  isSubmitting: boolean;
}

export interface ResourceViewSlotContext<TItem> {
  entity: TItem | null;
  isLoading: boolean;
}

export interface ResourceContentAdapters<TItem, TInput = Record<string, unknown>> {
  resolveFormDefaults?: (entity: TItem | null) => TInput;
  viewTitle?: (entity: TItem | null) => ReactNode;
  viewDescription?: (entity: TItem | null) => ReactNode;
  viewBadge?: (entity: TItem | null) => ReactNode;
  viewActions?: ResourceActionsInput<TItem>;
  renderForm?: (ctx: ResourceFormSlotContext<TItem>) => ReactNode;
  renderView?: (ctx: ResourceViewSlotContext<TItem>) => ReactNode;
}

export interface ResourceTableSlotContext<
  TItem extends { id: string | number },
  TListResponse = { items: TItem[]; total: number },
> {
  tableState: TableStateAdapter<TItem>;
  rows: TItem[];
  total: number;
  rawResponse: TListResponse | undefined;
  isLoading: boolean;
  openCreate: () => void;
  openEdit: (id: string) => void;
  openView: (id: string) => void;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface ResourceStatsSlotContext<
  TItem extends { id: string | number },
  TListResponse = { items: TItem[]; total: number },
> {
  rows: TItem[];
  total: number;
  rawResponse: TListResponse | undefined;
  isLoading: boolean;
}

export interface ResourceScaffoldProps<
  TItem extends { id: string | number },
  TInput extends Record<string, unknown> = Record<string, unknown>,
  TFilters extends BaseTableSearchParams = BaseTableSearchParams,
  TListResponse = { items: TItem[]; total: number },
> extends ResourceContentAdapters<TItem, TInput> {
  resource: ResourceDefinition<TItem, TInput, TFilters, TListResponse, any>;
  search?: TFilters & Record<string, unknown>;
  title?: ReactNode;
  description?: ReactNode;
  createLabel?: ReactNode;
  headerActions?: ResourceActionsInput<void>;
  formSize?: DialogSize;
  viewSize?: DialogSize;
  allowFullscreen?: boolean;
  onCreate?: () => void;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  renderStats?: (ctx: ResourceStatsSlotContext<TItem, TListResponse>) => ReactNode;
  renderTable: (ctx: ResourceTableSlotContext<TItem, TListResponse>) => ReactNode;
}

export interface ResourceRowActionsColumnOptions {
  field?: string;
  headerName?: string;
  width?: number;
  align?: "left" | "center" | "right";
  headerAlign?: "left" | "center" | "right";
  pinned?: "left" | "right" | false;
  maxInline?: number;
  moreActionsLabel?: string;
}

export interface ResourceTableColumnsContext {
  t: ResourceTranslateFn;
}

export interface ResourceTableSchema<TItem extends { id: string | number }> {
  columns: (ctx: ResourceTableColumnsContext) => DataTableColDef<TItem>[];
  toolbarActions?: ResourceActionsInput<void>;
  rowActions?: ResourceActionsInput<TItem>;
  rowActionsColumn?: ResourceRowActionsColumnOptions | ((t: ResourceTranslateFn) => ResourceRowActionsColumnOptions);
  batchActions?: ResourceActionsInput<TItem[]>;
  filters?: (t: ResourceTranslateFn) => DataTableFilterDefinition[];
  pinnedColumns?: DataTablePinnedColumns;
  exportFileName?: string;
  slotProps?: DataTableSlotProps;
  checkboxSelection?: boolean;
  onRowClick?: "view" | ((row: TItem, ctx: { openView: (id: string) => void; openEdit: (id: string) => void }) => void);
  getRowId?: (row: TItem) => string;
}

export type ResourceOptionsFromResourceSpec<TOptionItem extends { id: string | number; name?: string } = any> =
  SchemaOptionsFromResourceSpec<TOptionItem>;

export interface ResourceFormConfig<TItem> {
  size?: DialogSize;
  columns?: GridColumns;
  schema?: readonly SchemaNode[] | ((ctx: { t: ResourceTranslateFn; isEditing: boolean }) => readonly SchemaNode[]);
  render?: (ctx: ResourceFormSlotContext<TItem>) => ReactNode;
}

export interface ResourceInfolistConfig<TItem> {
  size?: DialogSize;
  columns?: GridColumns;
  orientation?: EntryOrientation;
  dense?: boolean;
  title?: (entity: TItem | null, t: ResourceTranslateFn) => ReactNode;
  description?: (entity: TItem | null, t: ResourceTranslateFn) => ReactNode;
  badge?: (entity: TItem | null, t: ResourceTranslateFn) => ReactNode;
  actions?: ResourceActionsInput<TItem>;
  schema?:
    | readonly SchemaNode<TItem>[]
    | ((ctx: { entity: TItem | null; t: ResourceTranslateFn }) => readonly SchemaNode<TItem>[]);
  render?: (ctx: { entity: TItem | null; isLoading: boolean; t: ResourceTranslateFn }) => ReactNode;
}

export interface ResourceUIConfig<
  TItem extends { id: string | number },
  TFilters = Record<string, unknown>,
  TListResponse = { items: TItem[]; total: number },
  _TActions extends Record<string, ResourceCustomAction<any, any>> = Record<string, never>,
> {
  allowFullscreen?: boolean;
  headerActions?: ResourceActionsInput<void>;
  stats?: ResourceStatsSchema<TItem, TListResponse>;
  table: ResourceTableSchema<TItem>;
  form?: ResourceFormConfig<TItem>;
  infolist?: ResourceInfolistConfig<TItem>;
  /** 仅供泛型约束推断保留，无需显式传值 */
  readonly __filters?: TFilters;
}

export interface ResourceUIBundle<
  TItem extends { id: string | number },
  TInput extends Record<string, unknown> = Record<string, unknown>,
  TFilters = Record<string, unknown>,
  TListResponse = { items: TItem[]; total: number },
  TActions extends Record<string, ResourceCustomAction<any, any>> = Record<string, never>,
> {
  readonly resource: ResourceDefinition<TItem, TInput, TFilters, TListResponse, TActions>;
  readonly config: ResourceUIConfig<TItem, TFilters, TListResponse, TActions>;
  readonly ListView: ComponentType<{ search?: TFilters }>;
  readonly ActionView: ComponentType<ResourceSubPageRenderProps>;
}
