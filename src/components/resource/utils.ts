import type { useTranslations } from "next-intl";

import type { ResourceDefinition, ResourcePresentationConfig } from "@/lib/resource";

import type { ResourcePresentation } from "./types";

export function resolveResourcePresentation(
  presentation: ResourcePresentation | ResourcePresentationConfig | undefined,
  key: "create" | "edit" | "view",
): ResourcePresentation {
  if (!presentation) return "dialog";
  if (typeof presentation === "string") return presentation;
  return presentation[key] ?? "dialog";
}

export function safeResourceTranslate(t: ReturnType<typeof useTranslations>, key: string): string | undefined {
  if (typeof (t as { has?: (k: string) => boolean }).has === "function") {
    return (t as { has: (k: string) => boolean }).has(key) ? t(key as never) : undefined;
  }
  return undefined;
}

export function resolveResourceFormDefaults<
  TItem extends { id: string | number },
  TInput extends Record<string, unknown>,
>(
  resource: ResourceDefinition<TItem, TInput, any, any, any>,
  entity: TItem | null,
  customResolver?: (entity: TItem | null) => TInput,
): TInput {
  if (customResolver) {
    return customResolver(entity);
  }
  if (entity && resource.toFormValues) {
    return resource.toFormValues(entity);
  }
  if (entity) {
    return { ...entity } as unknown as TInput;
  }
  if (typeof resource.defaultValues === "function") {
    return resource.defaultValues();
  }
  return (resource.defaultValues ?? {}) as TInput;
}
