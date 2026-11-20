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
  const viewTitle = useMemo(() => {
    const titleFn = config.infolist?.title;
    return titleFn ? (entity: TItem | null) => titleFn(entity, t) : undefined;
  }, [config.infolist, t]);
  const viewDescription = useMemo(() => {
    const descFn = config.infolist?.description;
    return descFn ? (entity: TItem | null) => descFn(entity, t) : undefined;
  }, [config.infolist, t]);
  const viewBadge = useMemo(() => {
    const badgeFn = config.infolist?.badge;
    return badgeFn ? (entity: TItem | null) => badgeFn(entity, t) : undefined;
  }, [config.infolist, t]);

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

function ResourceListViewImpl<
  TItem extends { id: string | number },
  TInput extends Record<string, unknown>,
  TFilters extends Record<string, unknown>,
  TListResponse,
  TActions extends Record<string, ResourceCustomAction<any, any>>,
>({
  resource,
  config,
  search,
}: {
  resource: ResourceDefinition<TItem, TInput, TFilters, TListResponse, TActions>;
  config: ResourceUIConfig<TItem, TFilters, TListResponse, TActions>;
  search?: TFilters;
}) {
  const t = useTranslations(resource.i18nNamespace as never) as unknown as ResourceTranslateFn;
  const headerExtra = config.headerExtra?.(t);
  const adapters = useResourceUIAdapters(resource, config, t);

  const statsSchema = config.stats;
  const renderStats: ResourceScaffoldProps<TItem, TInput, TFilters, TListResponse>["renderStats"] = statsSchema
    ? ({ rows, total, rawResponse, isLoading }) => (
        <ResourceStats
          i18nNamespace={resource.i18nNamespace}
          schema={statsSchema}
          rows={rows}
          total={total}
          rawResponse={rawResponse}
          isLoading={isLoading}
        />
      )
    : undefined;

  const renderTable: ResourceScaffoldProps<TItem, TInput, TFilters, TListResponse>["renderTable"] = ({
    tableState,
    openView,
    openEdit,
    openDelete,
    handleBatchDelete,
    canDelete,
  }) => (
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
}

function ResourceActionViewImpl<
  TItem extends { id: string | number },
  TInput extends Record<string, unknown>,
  TFilters extends Record<string, unknown>,
  TListResponse,
  TActions extends Record<string, ResourceCustomAction<any, any>>,
>({
  resource,
  config,
  mode,
  id,
}: ResourceSubPageRenderProps & {
  resource: ResourceDefinition<TItem, TInput, TFilters, TListResponse, TActions>;
  config: ResourceUIConfig<TItem, TFilters, TListResponse, TActions>;
}) {
  const t = useTranslations(resource.i18nNamespace as never) as unknown as ResourceTranslateFn;
  const adapters = useResourceUIAdapters(resource, config, t);

  return <ResourceSubPageScaffold<TItem, TInput> resource={resource} mode={mode} id={id} {...adapters} />;
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
    "use no memo";
    return <ResourceListViewImpl resource={resource} config={config} search={search} />;
  });

  const ActionView = memo(function ResourceActionView({ mode, id }: ResourceSubPageRenderProps) {
    "use no memo";
    return <ResourceActionViewImpl resource={resource} config={config} mode={mode} id={id} />;
  });

  return {
    resource,
    config,
    ListView,
    ActionView,
  };
}
