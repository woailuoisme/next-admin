"use client";

import { useMemoizedFn } from "ahooks";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { type ResourceDefinition, useCan, useResourceDetail } from "@/lib/resource";

import { ResourceFormController } from "./ResourceFormController";
import { ResourceViewHost } from "./ResourceViewHost";
import type { BreadcrumbItem, ResourceContentAdapters } from "./types";
import { safeResourceTranslate } from "./utils";

export interface ResourceSubPageScaffoldProps<
  TItem extends { id: string | number },
  TInput extends Record<string, unknown> = Record<string, unknown>,
> extends ResourceContentAdapters<TItem, TInput> {
  resource: ResourceDefinition<TItem, TInput, any, any, any>;
  mode: "create" | "edit" | "view";
  id?: string;
}

/**
 * ResourceSubPageScaffold:
 * 为 Next.js App Router 独立子路由（/create, /[id], /[id]/edit）提供零胶水 page 模式宿主。
 * 复用完全相同的纯字段组件（ProductForm / OrderInfolist），自动接管加载、面包屑、提交与回退跳转。
 */
export function ResourceSubPageScaffold<
  TItem extends { id: string | number },
  TInput extends Record<string, unknown> = Record<string, unknown>,
>({
  resource,
  mode,
  id,
  resolveFormDefaults,
  viewTitle,
  viewDescription,
  viewBadge,
  renderForm,
  renderView,
}: ResourceSubPageScaffoldProps<TItem, TInput>) {
  const router = useRouter();
  const t = useTranslations(resource.i18nNamespace as never);
  const canEdit = useCan(resource.name, "edit");

  const { data: entity = null, isLoading } = useResourceDetail(resource, id ?? "", {
    enabled: mode !== "create" && Boolean(id),
  });

  const handleAfterSuccess = useMemoizedFn((stayOnForm: boolean) => {
    if (!stayOnForm) {
      router.push(resource.basePath);
    }
  });

  const listTitle = safeResourceTranslate(t, resource.i18nKeys.heading) ?? resource.entityName;
  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    const base: BreadcrumbItem[] = [{ label: listTitle, href: resource.basePath }];
    if (mode === "create") {
      base.push({
        label: safeResourceTranslate(t, resource.i18nKeys.formCreateTitle) ?? `Create ${resource.entityName}`,
      });
    } else if (mode === "edit") {
      base.push({
        label: resource.getTitle?.(entity) ?? `#${id ?? ""}`,
        href: id ? `${resource.basePath}/${id}` : undefined,
      });
      base.push({ label: safeResourceTranslate(t, resource.i18nKeys.formEditTitle) ?? `Edit ${resource.entityName}` });
    } else {
      base.push({ label: resource.getTitle?.(entity) ?? `#${id ?? ""}` });
    }
    return base;
  }, [entity, id, listTitle, mode, resource, t]);

  if (mode === "view" && renderView) {
    const fallbackTitle = safeResourceTranslate(t, resource.i18nKeys.viewTitle) ?? `${resource.entityName} Details`;
    return (
      <ResourceViewHost
        presentation="page"
        title={viewTitle ? viewTitle(entity) : (resource.getTitle?.(entity) ?? fallbackTitle)}
        description={viewDescription ? viewDescription(entity) : safeResourceTranslate(t, "detail_sheet_desc")}
        badge={viewBadge ? viewBadge(entity) : undefined}
        breadcrumbs={breadcrumbs}
        backTo={resource.basePath}
        loading={isLoading && !entity}
        onEdit={
          canEdit && renderForm && id
            ? () => {
                router.push(`${resource.basePath}/${id}/edit`);
              }
            : undefined
        }
      >
        {renderView({ entity, isLoading: isLoading && !entity })}
      </ResourceViewHost>
    );
  }

  if ((mode === "create" || mode === "edit") && renderForm) {
    return (
      <ResourceFormController
        resource={resource}
        presentation="page"
        mode={mode}
        entity={entity}
        breadcrumbs={breadcrumbs}
        backTo={resource.basePath}
        onAfterSuccess={handleAfterSuccess}
        resolveFormDefaults={resolveFormDefaults}
        renderForm={renderForm}
      />
    );
  }

  return null;
}
