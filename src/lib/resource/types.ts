import type { UseQueryOptions } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";
import type { z } from "zod";

import type { ModalKeyMapping } from "@/components/dialogs/hooks/useResourceModalState";
import type { ResourcePresentation } from "@/components/resource/types";

export type ResourceActionName = "list" | "view" | "create" | "edit" | "delete" | (string & {});

export interface ResourcePresentationConfig {
  create?: ResourcePresentation;
  edit?: ResourcePresentation;
  view?: ResourcePresentation;
}

export interface ResourceManifestItem {
  /** 唯一资源标识，例如 "products" */
  name: string;
  /** 单数实体名，用于默认弹窗标题与提示，例如 "Product" */
  entityName: string;
  /** 应用路由基础路径，例如 "/products" */
  basePath: string;
  /** i18n 命名空间，例如 "products" */
  i18nNamespace: string;
  /** 侧边栏菜单翻译 key（对应 menu 命名空间） */
  menuKey: string;
  /** 菜单分组标识，例如 "catalog" */
  menuGroup?: string;
  /** 菜单排序权重（越小越靠前） */
  menuOrder?: number;
  /** 导航图标 */
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  /** 可选徽标计数 */
  badge?: string | number;
  /** 允许访问的角色列表，未声明则对所有角色开放 */
  roles?: readonly string[];
  /** 可选动作级角色权限映射（例如 { delete: ["admin"] }） */
  permissions?: Partial<Record<ResourceActionName, readonly string[]>>;
}

export interface ResourceCustomAction<TVars = any, TResult = any> {
  mutationFn: (vars: TVars) => Promise<TResult>;
  successMessage?: (result: TResult, vars: TVars) => string;
  errorMessage?: () => string;
  invalidates?: readonly (readonly unknown[])[];
}

export interface ResourceKeys<TFilters = Record<string, unknown>> {
  readonly all: readonly [string];
  readonly lists: () => readonly [string, "list"];
  readonly list: (filters?: TFilters) => readonly [string, "list", TFilters];
  readonly details: () => readonly [string, "detail"];
  readonly detail: (id: string) => readonly [string, "detail", string];
}

export interface ResourceApi<
  TItem,
  TInput,
  TFilters = Record<string, unknown>,
  TListResponse = { items: TItem[]; total: number },
> {
  list: (filters: TFilters) => Promise<TListResponse>;
  detail: (id: string) => Promise<TItem>;
  create?: (input: TInput, idempotencyKey?: string) => Promise<TItem>;
  update?: (id: string, input: Partial<TInput>) => Promise<TItem>;
  delete?: (id: string) => Promise<void>;
  batchDelete?: (items: TItem[]) => Promise<void>;
}

export interface DefineResourceConfig<
  TItem extends { id: string | number },
  TInput = Record<string, unknown>,
  TFilters = Record<string, unknown>,
  TListResponse = { items: TItem[]; total: number },
  TActions extends Record<string, ResourceCustomAction<any, any>> = Record<string, never>,
> {
  /** 资源名称 */
  name: string;
  /** 实体名称（用于默认标题与提示） */
  entityName: string;
  /** 页面路由基础路径 */
  basePath: string;
  /** API 端点路径（相对于 apiClient prefix），如 "products" */
  endpoint: string;
  /** i18n 命名空间 */
  i18nNamespace: string;
  /** 页面标题与描述的翻译 key，默认分别为 "page_title" 与 "page_description" */
  i18nKeys?: {
    title?: string;
    description?: string;
    heading?: string;
    headingDescription?: string;
    createAction?: string;
    formCreateTitle?: string;
    formEditTitle?: string;
    formCreateDesc?: string;
    formEditDesc?: string;
    viewTitle?: string;
  };
  /** Zod 表单校验 Schema */
  schema?: z.ZodType<TInput>;
  /** URL 搜索参数校验 Schema */
  searchSchema?: z.ZodType<TFilters>;
  /** 呈现形态配置 */
  presentation?: ResourcePresentation | ResourcePresentationConfig;
  /** URL 弹窗状态同步键映射 */
  modalKeys?: ModalKeyMapping;
  /** 是否把弹窗状态同步进 URL 查询参数 */
  syncModalWithUrl?: boolean;
  /** 分页模式 */
  paginationMode?: "server" | "client";
  /** 列表响应拆包模式："raw" 直接返回响应体；"data" 读取 { data } 包装 */
  listUnwrap?: "raw" | "data";
  /** 请求列表前对筛选条件进行归一化转换 */
  transformFilters?: (filters: TFilters) => Record<string, unknown>;
  /** 变更成功后额外需要失效的 queryKeys */
  invalidates?: readonly (readonly unknown[])[];
  /** 提取记录展示名称（用于删除确认与 Toast） */
  getTitle?: (item: TItem | null) => string | undefined;
  /** 创建模式默认表单值或工厂 */
  defaultValues?: TInput | (() => TInput);
  /** 将详情实体映射为编辑态表单默认值 */
  toFormValues?: (item: TItem) => TInput;
  /** 覆盖或扩展标准 REST API 实现 */
  api?: Partial<ResourceApi<TItem, TInput, TFilters, TListResponse>>;
  /** 自定义资源动作（如订单改状态、用户启停） */
  actions?: TActions;
  /** 列表缓存时长（毫秒），默认 30_000 */
  staleTime?: number;
}

export interface ResourceDefinition<
  TItem extends { id: string | number } = { id: string | number } & Record<string, unknown>,
  TInput = Record<string, unknown>,
  TFilters = Record<string, unknown>,
  TListResponse = { items: TItem[]; total: number },
  TActions extends Record<string, ResourceCustomAction<any, any>> = Record<string, never>,
> {
  readonly name: string;
  readonly entityName: string;
  readonly basePath: string;
  readonly endpoint: string;
  readonly i18nNamespace: string;
  readonly i18nKeys: Required<
    NonNullable<DefineResourceConfig<TItem, TInput, TFilters, TListResponse, TActions>["i18nKeys"]>
  >;
  readonly schema?: z.ZodType<TInput>;
  readonly searchSchema?: z.ZodType<TFilters>;
  readonly presentation: ResourcePresentation | ResourcePresentationConfig;
  readonly modalKeys?: ModalKeyMapping;
  readonly syncModalWithUrl: boolean;
  readonly paginationMode: "server" | "client";
  readonly invalidates: readonly (readonly unknown[])[];
  readonly getTitle?: (item: TItem | null) => string | undefined;
  readonly defaultValues?: TInput | (() => TInput);
  readonly toFormValues?: (item: TItem) => TInput;
  readonly keys: ResourceKeys<TFilters>;
  readonly api: ResourceApi<TItem, TInput, TFilters, TListResponse>;
  readonly actions: TActions;
  readonly queries: {
    all: () => readonly [string];
    list: (filters?: TFilters) => UseQueryOptions<TListResponse>;
    detail: (id: string) => UseQueryOptions<TItem>;
  };
}
