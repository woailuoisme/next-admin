"use client";

import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";

import type { ResourceSubPageRenderProps } from "@/lib/resource/nextServerPage";
import type { ResourceCustomAction, ResourceDefinition } from "@/lib/resource/types";

import { ResourceFormSchemaRenderer } from "./ResourceFormSchemaRenderer";
import { ResourceScaffold, type ResourceScaffoldProps } from "./ResourceScaffold";
import { ResourceStats } from "./ResourceStats";
import { ResourceSubPageScaffold } from "./ResourceSubPageScaffold";
import { ResourceTable } from "./ResourceTable";
import type { ResourceContentAdapters, ResourceTranslateFn, ResourceUIBundle, ResourceUIConfig } from "./types";

function useResourceUIAdapters<
  TItem extends { id: string | number },
  TInput extends Record<string, unknown>,
  TFilters,
  TListResponse,
  TActions extends Record<string, ResourceCustomAction<any, any>>,
>(
  resource: ResourceDefinition<TItem, TInput, TFilters, TListResponse, TActions>,
  config: ResourceUIConfig<TItem, TFilters, TListResponse, TActions>,
  t: ResourceTranslateFn,
): ResourceContentAdapters<TItem, TInput> {
  const viewTitle = useMemo(
    () => (config.infolist?.title ? (entity: TItem | null) => config.infolist!.title!(entity, t) : undefined),
    [config.infolist, t],
  );
  const viewDescription = useMemo(
    () =>
      config.infolist?.description ? (entity: TItem | null) => config.infolist!.description!(entity, t) : undefined,
    [config.infolist, t],
  );
  const viewBadge = useMemo(
    () => (config.infolist?.badge ? (entity: TItem | null) => config.infolist!.badge!(entity, t) : undefined),
    [config.infolist, t],
  );

  const renderForm = useMemo<ResourceContentAdapters<TItem, TInput>["renderForm"]>(() => {
    const formConfig = config.form;
    if (!formConfig) return undefined;
    return ({ form, mode, entity, isEditing, isSubmitting }) => (
      <ResourceFormSchemaRenderer
        i18nNamespace={resource.i18nNamespace}
        config={formConfig}
        form={form}
        mode={mode}
        entity={entity}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
      />
    );
  }, [config.form, resource.i18nNamespace]);

  const renderView = useMemo<ResourceContentAdapters<TItem, TInput>["renderView"]>(() => {
    const infolistConfig = config.infolist;
    if (!infolistConfig) return undefined;
    return ({ entity, isLoading }) => infolistConfig.render({ entity, isLoading, t });
  }, [config.infolist, t]);

  return useMemo(
    () => ({ viewTitle, viewDescription, viewBadge, renderForm, renderView }),
    [renderForm, renderView, viewBadge, viewDescription, viewTitle],
  );
}

/**
 * defineResourceUI:
 * 混合架构的核心声明式 UI 工厂，将零胶水契约（ResourceDefinition）与表现层 Schema 绑定，
 * 自动产出 RSC-safe `ListView` 与 `ActionView`，彻底消灭 `src/features/<domain>/pages/*Page.tsx`
 * 以及所有 `*Table.tsx` / `*MetricsCards.tsx` 胶水壳层。
 */
export function defineResourceUI<
  TItem extends { id: string | number },
  TInput extends Record<string, unknown> = Record<string, unknown>,
  TFilters extends Record<string, unknown> = Record<string, unknown>,
  TListResponse = { items: TItem[]; total: number },
  TActions extends Record<string, ResourceCustomAction<any, any>> = Record<string, never>,
>(
  resource: ResourceDefinition<TItem, TInput, TFilters, TListResponse, TActions>,
  config: ResourceUIConfig<TItem, TFilters, TListResponse, TActions>,
): ResourceUIBundle<TItem, TInput, TFilters, TListResponse, TActions> {
  const ListView = memo(function ResourceListView({ search }: { search?: TFilters }) {
    const t = useTranslations(resource.i18nNamespace as never) as unknown as ResourceTranslateFn;
    const headerExtra = useMemo(() => config.headerExtra?.(t), [t]);
    const adapters = useResourceUIAdapters(resource, config, t);

    const renderStats = useMemo<ResourceScaffoldProps<TItem, TInput, TFilters, TListResponse>["renderStats"]>(() => {
      if (!config.stats) return undefined;
      const statsSchema = config.stats;
      return ({ rows, total, rawResponse, isLoading }) => (
        <ResourceStats
          i18nNamespace={resource.i18nNamespace}
          schema={statsSchema}
          rows={rows}
          total={total}
          rawResponse={rawResponse}
          isLoading={isLoading}
        />
      );
    }, []);

    const renderTable = useMemo<ResourceScaffoldProps<TItem, TInput, TFilters, TListResponse>["renderTable"]>(
      () =>
        ({ tableState, openView, openEdit, openDelete, handleBatchDelete, canDelete }) => (
          <ResourceTable
            resource={resource}
            schema={config.table}
            tableState={tableState}
            openView={openView}
            openEdit={openEdit}
            openDelete={openDelete}
            handleBatchDelete={handleBatchDelete}
            canDelete={canDelete}
          />
        ),
      [],
    );

    return (
      <ResourceScaffold<TItem, TInput, TFilters, TListResponse>
        resource={resource}
        search={search}
        formSize={config.form?.size}
        viewSize={config.infolist?.size}
        allowFullscreen={config.allowFullscreen}
        headerExtra={headerExtra}
        renderStats={renderStats}
        renderTable={renderTable}
        {...adapters}
      />
    );
  });

  const ActionView = memo(function ResourceActionView({ mode, id }: ResourceSubPageRenderProps) {
    const t = useTranslations(resource.i18nNamespace as never) as unknown as ResourceTranslateFn;
    const adapters = useResourceUIAdapters(resource, config, t);

    return <ResourceSubPageScaffold<TItem, TInput> resource={resource} mode={mode} id={id} {...adapters} />;
  });

  return {
    resource,
    config,
    ListView,
    ActionView,
  };
}
