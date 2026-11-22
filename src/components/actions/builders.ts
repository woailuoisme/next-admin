import type { ResourceCustomAction, ResourceDefinition } from "@/lib/resource/types";
import { toastMessages } from "@/lib/toastMessages";

import type { ActionGroupOptions, CustomActionConfig, ResourceBoundActionConfig } from "./builderTypes";
import { crudActionBuilders, lifecycleActionBuilders } from "./presetBuilders";
import type { ActionDef, ActionEntry, ActionGroupDef } from "./types";

export type {
  ActionGroupOptions,
  BatchDeleteActionConfig,
  CustomActionConfig,
  DeleteActionConfig,
  LifecycleTrashedActionConfig,
  ReplicateActionConfig,
  ResourceActionOverride,
  ResourceBoundActionConfig,
} from "./builderTypes";

/**
 * 声明式动作工厂命名空间（Filament v5 Actions 对齐，对齐仓库 col.* 风格）
 */
export const action = {
  /**
   * 自定义通用 Action
   */
  custom<TPayload = void, TFormValues extends Record<string, unknown> = Record<string, unknown>>(
    config: CustomActionConfig<TPayload, TFormValues>,
  ): ActionDef<TPayload, TFormValues> {
    return { kind: "action", ...config };
  },

  /**
   * 分组动作（默认 dropdown，可切换 button-group / inline）
   */
  group<TPayload = void>(
    actions: ActionEntry<TPayload>[],
    options: ActionGroupOptions<TPayload> = {},
  ): ActionGroupDef<TPayload> {
    return {
      kind: "group",
      id: options.id ?? `group-${actions.map((a) => a.id).join("-") || "empty"}`,
      layout: options.layout ?? "dropdown",
      actions,
      ...options,
    };
  },

  /**
   * 直接绑定 ResourceDefinition.actions 中的自定义突变动作（自动复用 mutationFn、Toast 与 Query 失效）
   */
  resource<
    TItem extends { id: string | number },
    TActions extends Record<string, ResourceCustomAction<any, any>>,
    K extends keyof TActions & string,
    TPayload = TItem,
  >(
    resource: ResourceDefinition<TItem, any, any, any, TActions>,
    actionKey: K,
    config: ResourceBoundActionConfig<TPayload, TActions[K]>,
  ): ActionDef<TPayload> {
    const def = resource.actions[actionKey];
    const { permission, mapVars, ...rest } = config;
    return {
      kind: "action",
      id: config.id ?? `${resource.name}-${actionKey}`,
      authorize: config.authorize ?? permission,
      invalidates: config.invalidates ?? def?.invalidates,
      handler: async ({ payload }) => {
        if (!def) {
          throw new Error(`Action "${actionKey}" is not defined on resource "${resource.name}"`);
        }
        return def.mutationFn(mapVars(payload));
      },
      successMessage:
        config.successMessage ??
        ((result, ctx) => (def?.successMessage ? def.successMessage(result, mapVars(ctx.payload)) : "")),
      errorMessage:
        config.errorMessage ?? (() => (def?.errorMessage ? def.errorMessage() : toastMessages.updateError())),
      ...rest,
    };
  },

  ...crudActionBuilders,
  ...lifecycleActionBuilders,
} as const;
