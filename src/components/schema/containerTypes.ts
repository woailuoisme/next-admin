import type { ReactNode } from "react";

import type { EntryOrientation } from "@/components/infolist/core/types";
import type { ColSpan, GridColumns, GridGap } from "@/components/shared/grid";
import type { IconComponentType } from "@/components/shared/renderable";

import type { AppFormContract, SchemaEntrySpec, SchemaEvaluationContext, SchemaFieldSpec } from "./types";

export interface SchemaSectionSpec<TValues = Record<string, any>> {
  type: "section";
  key?: string;
  title?: ReactNode;
  titleKey?: string;
  description?: ReactNode;
  descriptionKey?: string;
  icon?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  columns?: GridColumns;
  card?: boolean;
  visibleWhen?: (ctx: SchemaEvaluationContext<TValues>) => boolean;
  schema: readonly SchemaNode<TValues>[];
}

export interface SchemaGridSpec<TValues = Record<string, any>> {
  type: "grid";
  key?: string;
  columns?: GridColumns;
  gap?: GridGap;
  visibleWhen?: (ctx: SchemaEvaluationContext<TValues>) => boolean;
  schema: readonly SchemaNode<TValues>[];
}

export interface SchemaTabSpec<TValues = Record<string, any>> {
  value: string;
  label?: ReactNode;
  labelKey?: string;
  icon?: ReactNode | IconComponentType;
  badge?: ReactNode;
  disabled?: boolean;
  columns?: GridColumns;
  schema: readonly SchemaNode<TValues>[];
}

export interface SchemaTabsSpec<TValues = Record<string, any>> {
  type: "tabs";
  key?: string;
  defaultValue?: string;
  visibleWhen?: (ctx: SchemaEvaluationContext<TValues>) => boolean;
  tabs: readonly SchemaTabSpec<TValues>[];
}

export interface SchemaFieldsetSpec<TValues = Record<string, any>> {
  type: "fieldset";
  key?: string;
  legend?: ReactNode;
  legendKey?: string;
  description?: ReactNode;
  descriptionKey?: string;
  columns?: GridColumns;
  visibleWhen?: (ctx: SchemaEvaluationContext<TValues>) => boolean;
  schema: readonly SchemaNode<TValues>[];
}

export interface SchemaCustomSpec<TValues = Record<string, any>> {
  type: "custom";
  key?: string;
  colSpan?: ColSpan;
  visibleWhen?: (ctx: SchemaEvaluationContext<TValues>) => boolean;
  render: (ctx: SchemaEvaluationContext<TValues>) => ReactNode;
}

export type SchemaNode<TValues = Record<string, any>> =
  | SchemaFieldSpec<TValues>
  | SchemaEntrySpec<TValues>
  | SchemaSectionSpec<TValues>
  | SchemaGridSpec<TValues>
  | SchemaTabsSpec<TValues>
  | SchemaFieldsetSpec<TValues>
  | SchemaCustomSpec<TValues>;

export interface SchemaRendererProps<TValues = Record<string, any>> {
  /** 统一 Schema 节点（支持 section / grid / tabs / fieldset / custom / field / entry 混排） */
  schema?: readonly SchemaNode<TValues>[];
  /** 顶层网格列数（省略时采用单列纵向堆叠） */
  columns?: GridColumns;
  /** 表单实例（缺省自动从 FormContext 获取） */
  form?: AppFormContract;
  /** 只读详情或混合审计条目的数据记录 */
  record?: TValues | null;
  /** Infolist 条目排版方向 */
  orientation?: EntryOrientation;
  /** Infolist 紧凑模式 */
  dense?: boolean;
  /** 可选 i18n 命名空间 */
  i18nNamespace?: string;
  mode?: "create" | "edit" | "view";
  isEditing?: boolean;
  disabled?: boolean;
  className?: string;
}
