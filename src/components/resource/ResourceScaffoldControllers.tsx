"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import type { DialogSize } from "@/components/dialogs/types";
import { type ResourceDefinition, useResourceDetail } from "@/lib/resource";

import type { ResourceFormController as ResourceFormControllerType } from "./ResourceFormController";
import type { ResourceViewHost as ResourceViewHostType } from "./ResourceViewHost";
import type { ResourceFormSlotContext, ResourcePresentation, ResourceViewSlotContext } from "./types";
import { safeResourceTranslate } from "./utils";

const ResourceFormController = dynamic(() => import("./ResourceFormController").then((m) => m.ResourceFormController), {
  ssr: false,
}) as typeof ResourceFormControllerType;

const ResourceViewHost = dynamic(() => import("./ResourceViewHost").then((m) => m.ResourceViewHost), {
  ssr: false,
}) as typeof ResourceViewHostType;

export interface ScaffoldModalFormProps<TItem extends { id: string | number }, TInput extends Record<string, unknown>> {
  resource: ResourceDefinition<TItem, TInput, any, any, any>;
  presentation: ResourcePresentation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId: string | null;
  activeEditItem: TItem | null;
  size: DialogSize;
  allowFullscreen: boolean;
  resolveFormDefaults?: (entity: TItem | null) => TInput;
  renderForm: (ctx: ResourceFormSlotContext<TItem>) => ReactNode;
}

export function ScaffoldModalForm<TItem extends { id: string | number }, TInput extends Record<string, unknown>>({
  resource,
  presentation,
  open,
  onOpenChange,
  editId,
  activeEditItem,
  size,
  allowFullscreen,
  resolveFormDefaults,
  renderForm,
}: ScaffoldModalFormProps<TItem, TInput>) {
  const { data: fetchedEntity } = useResourceDetail(resource, editId ?? "", {
    enabled: Boolean(open && editId && !activeEditItem),
  });

  const effectiveEntity = activeEditItem ?? fetchedEntity ?? null;
  const mode: "create" | "edit" = editId ? "edit" : "create";

  return (
    <ResourceFormController
      resource={resource}
      presentation={presentation}
      mode={mode}
      entity={effectiveEntity}
      open={open}
      onOpenChange={onOpenChange}
      size={size}
      allowFullscreen={allowFullscreen}
      resolveFormDefaults={resolveFormDefaults}
      renderForm={renderForm}
    />
  );
}

export interface InternalViewControllerProps<TItem extends { id: string | number }> {
  resource: ResourceDefinition<TItem, any, any, any, any>;
  presentation: ResourcePresentation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewId: string | null;
  activeViewItem: TItem | null;
  size: DialogSize;
  allowFullscreen: boolean;
  onEdit?: (id: string) => void;
  viewTitle?: (entity: TItem | null) => ReactNode;
  viewDescription?: (entity: TItem | null) => ReactNode;
  viewBadge?: (entity: TItem | null) => ReactNode;
  renderView: (ctx: ResourceViewSlotContext<TItem>) => ReactNode;
}

export function InternalViewController<TItem extends { id: string | number }>({
  resource,
  presentation,
  open,
  onOpenChange,
  viewId,
  activeViewItem,
  size,
  allowFullscreen,
  onEdit,
  viewTitle,
  viewDescription,
  viewBadge,
  renderView,
}: InternalViewControllerProps<TItem>) {
  const t = useTranslations(resource.i18nNamespace as never);
  const { data: fetchedEntity, isLoading } = useResourceDetail(resource, viewId ?? "", {
    enabled: Boolean(open && viewId),
  });

  const effectiveEntity = fetchedEntity ?? activeViewItem ?? null;

  const fallbackTitle = safeResourceTranslate(t, resource.i18nKeys.viewTitle) ?? `${resource.entityName} Details`;
  const resolvedTitle = viewTitle
    ? viewTitle(effectiveEntity)
    : (resource.getTitle?.(effectiveEntity) ?? fallbackTitle);
  const resolvedDescription = viewDescription
    ? viewDescription(effectiveEntity)
    : safeResourceTranslate(t, "detail_sheet_desc");
  const resolvedBadge = viewBadge ? viewBadge(effectiveEntity) : undefined;

  return (
    <ResourceViewHost
      presentation={presentation}
      open={open}
      onOpenChange={onOpenChange}
      title={resolvedTitle}
      description={resolvedDescription}
      badge={resolvedBadge}
      size={size}
      allowFullscreen={allowFullscreen}
      loading={isLoading && !effectiveEntity}
      onEdit={
        onEdit && effectiveEntity
          ? () => {
              onOpenChange(false);
              onEdit(String(effectiveEntity.id));
            }
          : undefined
      }
    >
      {renderView({ entity: effectiveEntity, isLoading: isLoading && !effectiveEntity })}
    </ResourceViewHost>
  );
}
