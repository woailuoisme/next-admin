import type { AccessControlParams, ResourceActionName } from "@/lib/resource";

import type { ActionColor, ActionDef, ActionEntry, ActionGroupDef, ActionPayloadResolver } from "./types";

export const ACTION_COLOR_BUTTON_VARIANT: Record<
  ActionColor,
  "default" | "outline" | "secondary" | "ghost" | "destructive"
> = {
  default: "outline",
  primary: "default",
  secondary: "secondary",
  destructive: "destructive",
  warning: "outline",
  success: "outline",
};

export const ACTION_COLOR_TEXT_CLASSES: Record<ActionColor, string> = {
  default: "",
  primary: "text-primary hover:text-primary",
  secondary: "",
  destructive: "text-destructive hover:text-destructive",
  warning: "text-chart-4 hover:text-chart-4 border-chart-4/40 hover:bg-chart-4/10",
  success: "text-chart-2 hover:text-chart-2 border-chart-2/40 hover:bg-chart-2/10",
};

export const ACTION_CONFIRM_BADGE_CLASSES: Record<ActionColor, { wrapper: string; icon: string; button: string }> = {
  default: {
    wrapper: "bg-muted text-foreground",
    icon: "text-foreground",
    button: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  primary: {
    wrapper: "bg-primary/10 text-primary",
    icon: "text-primary",
    button: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  secondary: {
    wrapper: "bg-secondary text-secondary-foreground",
    icon: "text-secondary-foreground",
    button: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
  },
  destructive: {
    wrapper: "bg-destructive/10 text-destructive",
    icon: "text-destructive",
    button: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  },
  warning: {
    wrapper: "bg-chart-4/15 text-chart-4",
    icon: "text-chart-4",
    button: "bg-chart-4 text-primary-foreground hover:bg-chart-4/90",
  },
  success: {
    wrapper: "bg-chart-2/15 text-chart-2",
    icon: "text-chart-2",
    button: "bg-chart-2 text-primary-foreground hover:bg-chart-2/90",
  },
};

export function resolveActionValue<TPayload, TResult>(
  value: ActionPayloadResolver<TPayload, TResult> | undefined,
  payload: TPayload,
): TResult | undefined {
  if (typeof value === "function") {
    return (value as (p: TPayload) => TResult)(payload);
  }
  return value;
}

export function isActionAuthorized<TPayload>(
  authorize: ActionDef<TPayload>["authorize"] | ActionGroupDef<TPayload>["authorize"],
  payload: TPayload,
  can: (query: AccessControlParams) => boolean,
  resourceName?: string,
): boolean {
  if (!authorize) return true;

  if (typeof authorize === "string") {
    if (!resourceName) return true;
    return can({
      resource: resourceName,
      action: authorize,
      record:
        payload && typeof payload === "object" && !Array.isArray(payload)
          ? (payload as Record<string, unknown>)
          : undefined,
    });
  }

  return authorize(payload, {
    can: (action: ResourceActionName, record?: unknown) =>
      resourceName
        ? can({ resource: resourceName, action, record: record as Record<string, unknown> | undefined })
        : true,
  });
}

export function isActionEntryVisible<TPayload>(
  entry: ActionEntry<TPayload>,
  payload: TPayload,
  can: (query: AccessControlParams) => boolean,
  resourceName?: string,
): boolean {
  if (!isActionAuthorized(entry.authorize, payload, can, resourceName)) {
    return false;
  }

  if (resolveActionValue(entry.hidden, payload)) {
    return false;
  }

  if (entry.kind === "group") {
    return entry.actions.some((child) => isActionEntryVisible(child, payload, can, resourceName));
  }

  return true;
}

/**
 * 过滤不可见动作，并递归规范化分组、清除首尾或连续冗余分割线
 */
export function resolveVisibleActions<TPayload>(
  entries: readonly ActionEntry<TPayload>[],
  payload: TPayload,
  can: (query: AccessControlParams) => boolean,
  resourceName?: string,
): ActionEntry<TPayload>[] {
  const visible = entries
    .filter((entry) => isActionEntryVisible(entry, payload, can, resourceName))
    .map((entry): ActionEntry<TPayload> => {
      if (entry.kind !== "group") return entry;
      return {
        ...entry,
        actions: resolveVisibleActions(entry.actions, payload, can, resourceName),
      };
    });

  return visible.map((entry, idx) => {
    if (!entry.separator) return entry;
    if (idx === 0) {
      return { ...entry, separator: false };
    }
    return entry;
  });
}
