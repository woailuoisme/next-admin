import type { ResourceActionName, ResourceCustomAction } from "@/lib/resource/types";

import type { ActionConfirmConfig, ActionDef, ActionGroupDef, ActionGroupLayout, ActionPayloadResolver } from "./types";

export type CustomActionConfig<
  TPayload = void,
  TFormValues extends Record<string, unknown> = Record<string, unknown>,
> = Omit<ActionDef<TPayload, TFormValues>, "kind">;

export interface ActionGroupOptions<TPayload = void> {
  id?: string;
  layout?: ActionGroupLayout;
  label?: ActionGroupDef<TPayload>["label"];
  ariaLabel?: ActionGroupDef<TPayload>["ariaLabel"];
  tooltip?: ActionGroupDef<TPayload>["tooltip"];
  icon?: ActionGroupDef<TPayload>["icon"];
  color?: ActionGroupDef<TPayload>["color"];
  variant?: ActionGroupDef<TPayload>["variant"];
  size?: ActionGroupDef<TPayload>["size"];
  separator?: boolean;
  dropdownWidth?: string;
  hidden?: ActionGroupDef<TPayload>["hidden"];
  disabled?: ActionGroupDef<TPayload>["disabled"];
  authorize?: ActionGroupDef<TPayload>["authorize"];
}

export interface ResourceActionOverride<TPayload = void> {
  id?: string;
  label?: ActionDef<TPayload>["label"];
  tooltip?: ActionDef<TPayload>["tooltip"];
  icon?: ActionDef<TPayload>["icon"];
  color?: ActionDef<TPayload>["color"];
  variant?: ActionDef<TPayload>["variant"];
  size?: ActionDef<TPayload>["size"];
  hidden?: ActionDef<TPayload>["hidden"];
  disabled?: ActionDef<TPayload>["disabled"];
  authorize?: ActionDef<TPayload>["authorize"];
  separator?: boolean;
  onExecute?: (payload: TPayload) => void | Promise<void>;
}

export interface DeleteActionConfig<TItem extends { id: string | number } = any> extends Omit<
  ResourceActionOverride<TItem>,
  "onExecute"
> {
  confirm?: boolean | ActionConfirmConfig<TItem>;
  requireConfirmKeyword?: boolean | string;
  handler?: ActionDef<TItem>["handler"];
}

export interface BatchDeleteActionConfig<TItem extends { id: string | number } = any> extends Omit<
  ResourceActionOverride<TItem[]>,
  "onExecute"
> {
  confirm?: boolean | ActionConfirmConfig<TItem[]>;
  requireConfirmKeyword?: boolean | string;
  handler?: ActionDef<TItem[]>["handler"];
}

export interface ReplicateActionConfig<TItem extends { id: string | number } = any> {
  id?: string;
  label?: ActionPayloadResolver<TItem, string>;
  tooltip?: ActionPayloadResolver<TItem, string>;
  icon?: ActionDef<TItem>["icon"];
  authorize?: ActionDef<TItem>["authorize"];
  hidden?: ActionDef<TItem>["hidden"];
  disabled?: ActionDef<TItem>["disabled"];
  separator?: boolean;
  /** 复制时自动剔除的字段，默认 ["id", "createdAt", "updatedAt"] */
  excludeFields?: readonly (keyof TItem | string)[];
  /** 写入前调整克隆对象 */
  mutateClone?: (cloned: Record<string, unknown>, original: TItem) => Record<string, unknown>;
  /** 可选自定义复制提交函数（缺省自动调用 resourceBridge.resource.api.create） */
  onReplicate?: (cloned: Record<string, unknown>, original: TItem) => Promise<unknown>;
  /** 是否弹出确认框，默认 true */
  confirm?: boolean | ActionConfirmConfig<TItem>;
  successMessage?: ActionDef<TItem>["successMessage"];
}

export interface LifecycleTrashedActionConfig<TItem extends { id: string | number } = any> {
  id?: string;
  label?: ActionPayloadResolver<TItem, string>;
  tooltip?: ActionPayloadResolver<TItem, string>;
  icon?: ActionDef<TItem>["icon"];
  authorize?: ActionDef<TItem>["authorize"];
  hidden?: ActionDef<TItem>["hidden"];
  disabled?: ActionDef<TItem>["disabled"];
  separator?: boolean;
  /** 仅在记录处于软删除态时展示（例如 (row) => Boolean(row.deletedAt)） */
  isTrashed?: (row: TItem) => boolean;
  confirm?: boolean | ActionConfirmConfig<TItem>;
  onExecute?: (row: TItem) => Promise<unknown>;
  successMessage?: ActionDef<TItem>["successMessage"];
}

export interface ResourceBoundActionConfig<TPayload, TAction extends ResourceCustomAction<any, any>> extends Omit<
  CustomActionConfig<TPayload>,
  "id" | "handler" | "successMessage" | "errorMessage" | "invalidates"
> {
  id?: string;
  permission?: ResourceActionName;
  mapVars: (payload: TPayload) => TAction extends ResourceCustomAction<infer TVars, any> ? TVars : never;
  successMessage?: CustomActionConfig<TPayload>["successMessage"];
  errorMessage?: CustomActionConfig<TPayload>["errorMessage"];
  invalidates?: readonly (readonly unknown[])[];
}

export function defaultExcludedClone(
  record: Record<string, unknown>,
  excludeFields: readonly (string | number | symbol)[],
): Record<string, unknown> {
  const excluded = new Set(excludeFields.map(String));
  const clone: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (!excluded.has(key)) {
      clone[key] = value;
    }
  }
  return clone;
}
