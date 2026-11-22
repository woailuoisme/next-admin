import type { QueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import type { z } from "zod";

import type { DialogSize } from "@/components/dialogs/types";
import type { AppFormContract } from "@/components/form/core/types";
import type { SchemaNode } from "@/components/schema";
import type { ResourceActionName, ResourceDefinition } from "@/lib/resource/types";

/**
 * 语义化动作色彩（严格映射到 globals.css 主题令牌）
 */
export type ActionColor = "default" | "primary" | "secondary" | "destructive" | "warning" | "success";

/**
 * 动作渲染宿主表面类型
 */
export type ActionSurface = "toolbar" | "cell" | "batch" | "inline";

/**
 * 分组动作布局形态
 */
export type ActionGroupLayout = "dropdown" | "button-group" | "inline";

/**
 * 支持静态值或基于 payload 动态求值的声明属性
 */
export type ActionPayloadResolver<TPayload, TResult> = TResult | ((payload: TPayload) => TResult);

export type ActionAuthorizeFn<TPayload> = (
  payload: TPayload,
  helpers: { can: (action: ResourceActionName, record?: unknown) => boolean },
) => boolean;

/**
 * 动作确认框配置（对齐 Filament v5 Confirmation Modal）
 */
export interface ActionConfirmConfig<TPayload = void> {
  title?: ActionPayloadResolver<TPayload, ReactNode>;
  description?: ActionPayloadResolver<TPayload, ReactNode>;
  confirmText?: ActionPayloadResolver<TPayload, string>;
  cancelText?: ActionPayloadResolver<TPayload, string>;
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  color?: ActionColor;
  requireConfirmKeyword?: boolean | string;
  confirmKeyword?: string;
  autoFocusInput?: boolean;
}

export interface ActionFormRenderContext<TPayload = void> {
  form: AppFormContract & { Field: ComponentType<any> };
  payload: TPayload;
  isSubmitting: boolean;
}

export interface ActionContentRenderContext<TPayload = void> {
  payload: TPayload;
  close: () => void;
}

/**
 * 动作模态框 / SlideOver 抽屉配置（对齐 Filament v5 Modals & SlideOver）
 */
export interface ActionModalConfig<
  TPayload = void,
  TFormValues extends Record<string, unknown> = Record<string, unknown>,
> {
  /** "dialog" 为居中模态框，"sheet" 为右侧 SlideOver 抽屉 */
  variant?: "dialog" | "sheet";
  size?: DialogSize;
  widthClassName?: string;
  allowFullscreen?: boolean;
  title?: ActionPayloadResolver<TPayload, ReactNode>;
  description?: ActionPayloadResolver<TPayload, ReactNode>;
  badge?: ActionPayloadResolver<TPayload, ReactNode>;
  submitText?: ActionPayloadResolver<TPayload, string>;
  cancelText?: ActionPayloadResolver<TPayload, string>;
  closeText?: ActionPayloadResolver<TPayload, string>;
  /** 表单校验 Schema（存在 fields / renderForm 时生效） */
  schema?: z.ZodType<TFormValues>;
  /** 表单初始默认值 */
  defaultValues?: TFormValues | ((payload: TPayload) => TFormValues);
  /** 声明式表单 Schema 节点或轻量字段列表 */
  fields?: readonly SchemaNode<TFormValues>[];
  /** 自定义表单 JSX 渲染插槽 */
  renderForm?: (ctx: ActionFormRenderContext<TPayload>) => ReactNode;
  /** 纯展示 / 预览型模态内容（如 Infolist 详情或交互预览） */
  renderContent?: (ctx: ActionContentRenderContext<TPayload>) => ReactNode;
  /** 内容模态框底部自定义扩展动作 */
  footerActions?: ActionEntry<ActionContentRenderContext<TPayload>>[];
  /** 提交成功后是否自动关闭，默认 true */
  closeOnSubmit?: boolean;
  /** 表单脏检查拦截，默认 false */
  enableDirtyGuard?: boolean;
}

/**
 * 资源注入的运行时动作上下文（由 ResourceScaffold / ResourceSubPageScaffold 提供）
 */
export interface ActionRuntimeResourceBridge<TItem extends { id: string | number } = any> {
  resource: ResourceDefinition<TItem, any, any, any, any>;
  rows: TItem[];
  createLabel?: ReactNode;
  openCreate: () => void;
  openEdit: (id: string) => void;
  openView: (id: string) => void;
  /** 可选删除后回调（如独立详情页删除后跳回列表） */
  onAfterDelete?: () => void;
}

/**
 * Action 执行上下文（传递给 before / handler / after / message 解析）
 */
export interface ActionRunContext<
  TPayload = void,
  TFormValues extends Record<string, unknown> = Record<string, unknown>,
> {
  payload: TPayload;
  data: TFormValues;
  closeModal: () => void;
  clearSelection?: () => void;
  queryClient: QueryClient;
  resourceBridge?: ActionRuntimeResourceBridge | null;
}

export type ExportFormat = "xlsx" | "csv" | "json";

export interface ExportColumnOption<TItem = any> {
  field: string;
  headerName: string;
  defaultSelected?: boolean;
  valueFormatter?: (value: unknown, row: TItem) => unknown;
}

export interface ExportActionConfig<TPayload = any, TItem = any> {
  id?: string;
  label?: ActionPayloadResolver<TPayload, ReactNode>;
  tooltip?: ActionPayloadResolver<TPayload, ReactNode>;
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  color?: ActionColor;
  variant?: ActionDef<TPayload>["variant"];
  size?: ActionDef<TPayload>["size"];
  permission?: ResourceActionName;
  authorize?: ResourceActionName | ActionAuthorizeFn<TPayload>;
  hidden?: ActionPayloadResolver<TPayload, boolean>;
  disabled?: ActionPayloadResolver<TPayload, boolean>;
  formats?: readonly ExportFormat[];
  defaultFormat?: ExportFormat;
  fileName?: ActionPayloadResolver<TPayload, string>;
  columns?: ExportColumnOption<TItem>[];
  resolveRows?: (payload: TPayload, bridge?: ActionRuntimeResourceBridge | null) => TItem[] | Promise<TItem[]>;
  after?: (ctx: { format: ExportFormat; count: number; payload: TPayload }) => void | Promise<void>;
}

export interface ImportFieldDef {
  key: string;
  label: string;
  required?: boolean;
  aliases?: readonly string[];
  /** 可选值转换（例如字符串转数字或布尔） */
  transform?: (raw: unknown) => unknown;
}

export interface ImportActionConfig<TInput extends Record<string, unknown> = Record<string, unknown>, TPayload = void> {
  id?: string;
  label?: ActionPayloadResolver<TPayload, ReactNode>;
  tooltip?: ActionPayloadResolver<TPayload, ReactNode>;
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  color?: ActionColor;
  variant?: ActionDef<TPayload>["variant"];
  size?: ActionDef<TPayload>["size"];
  permission?: ResourceActionName;
  authorize?: ResourceActionName | ActionAuthorizeFn<TPayload>;
  hidden?: ActionPayloadResolver<TPayload, boolean>;
  disabled?: ActionPayloadResolver<TPayload, boolean>;
  entityName?: string;
  fields: readonly ImportFieldDef[];
  rowSchema: z.ZodType<TInput>;
  sampleRows?: readonly Record<string, unknown>[];
  templateFileName?: string;
  onImport?: (validRows: TInput[], ctx: ActionRunContext<TPayload, Record<string, unknown>>) => Promise<void>;
  invalidates?: readonly (readonly unknown[])[];
}

export interface BuiltinModalMeta {
  kind: "export" | "import";
  exportConfig?: ExportActionConfig<any, any>;
  importConfig?: ImportActionConfig<any, any>;
}

/**
 * 统一核心 Action 定义
 */
export interface ActionDef<TPayload = void, TFormValues extends Record<string, unknown> = Record<string, unknown>> {
  kind: "action";
  id: string;
  label?: ActionPayloadResolver<TPayload, ReactNode>;
  /** 未显式提供 label 时使用的 actions 命名空间 i18n 键（支持响应式语言切换） */
  defaultLabelKey?: string;
  ariaLabel?: ActionPayloadResolver<TPayload, string>;
  tooltip?: ActionPayloadResolver<TPayload, ReactNode>;
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  badge?: ActionPayloadResolver<TPayload, string | number | undefined>;
  color?: ActionColor;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "xs" | "sm" | "default" | "icon" | "icon-sm" | "icon-xs";
  separator?: boolean;
  hidden?: ActionPayloadResolver<TPayload, boolean>;
  disabled?: ActionPayloadResolver<TPayload, boolean>;
  authorize?: ResourceActionName | ActionAuthorizeFn<TPayload>;
  href?: ActionPayloadResolver<TPayload, string>;
  openInNewTab?: boolean;
  confirm?: boolean | ActionConfirmConfig<TPayload>;
  modal?: ActionPayloadResolver<TPayload, ActionModalConfig<TPayload, TFormValues>>;
  before?: (ctx: ActionRunContext<TPayload, TFormValues>) => void | boolean | Promise<void | boolean>;
  handler?: (ctx: ActionRunContext<TPayload, TFormValues>) => unknown | Promise<unknown>;
  after?: (ctx: ActionRunContext<TPayload, TFormValues> & { result: unknown }) => void | Promise<void>;
  successMessage?: string | ((result: unknown, ctx: ActionRunContext<TPayload, TFormValues>) => string);
  errorMessage?: string | ((error: unknown, ctx: ActionRunContext<TPayload, TFormValues>) => string);
  invalidates?: readonly (readonly unknown[])[];
  /** 批量动作执行完成后是否自动清空选区，默认 true；若 handler 异步弹窗接管可设为 false */
  autoClearSelection?: boolean;
  /** 内部预置弹窗元信息（Import / Export） */
  builtinModal?: BuiltinModalMeta;
}

/**
 * 统一分组 Action 定义
 */
export interface ActionGroupDef<TPayload = void> {
  kind: "group";
  id: string;
  layout: ActionGroupLayout;
  label?: ActionPayloadResolver<TPayload, ReactNode>;
  ariaLabel?: ActionPayloadResolver<TPayload, string>;
  tooltip?: ActionPayloadResolver<TPayload, ReactNode>;
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  color?: ActionColor;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  size?: "xs" | "sm" | "default" | "icon" | "icon-sm" | "icon-xs";
  separator?: boolean;
  dropdownWidth?: string;
  hidden?: ActionPayloadResolver<TPayload, boolean>;
  disabled?: ActionPayloadResolver<TPayload, boolean>;
  authorize?: ResourceActionName | ActionAuthorizeFn<TPayload>;
  actions: ActionEntry<TPayload>[];
}

export type ActionEntry<TPayload = void> = ActionDef<TPayload, any> | ActionGroupDef<TPayload>;
