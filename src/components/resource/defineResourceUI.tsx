"use client";

import { useTranslations } from "next-intl";

import { SchemaRenderer } from "@/components/schema";
import type { ResourceSubPageRenderProps } from "@/lib/resource/nextServerPage";
import type { ResourceCustomAction, ResourceDefinition } from "@/lib/resource/types";

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
	const titleFn = config.infolist?.title;
	const viewTitle = titleFn ? (entity: TItem | null) => titleFn(entity, t) : undefined;
	const descFn = config.infolist?.description;
	const viewDescription = descFn ? (entity: TItem | null) => descFn(entity, t) : undefined;
	const badgeFn = config.infolist?.badge;
	const viewBadge = badgeFn ? (entity: TItem | null) => badgeFn(entity, t) : undefined;

	const formConfig = config.form;
	const renderForm: ResourceContentAdapters<TItem, TInput>["renderForm"] = formConfig
		? ({ form, mode, entity, isEditing, isSubmitting }) =>
				formConfig.render ? (
					formConfig.render({ form, mode, entity, isEditing, isSubmitting })
				) : (
					<SchemaRenderer
						i18nNamespace={resource.i18nNamespace}
						schema={typeof formConfig.schema === "function" ? formConfig.schema({ t, isEditing }) : formConfig.schema}
						columns={formConfig.columns}
						form={form}
						mode={mode}
						isEditing={isEditing}
					/>
				)
		: undefined;

	const infolistConfig = config.infolist;
	const renderView: ResourceContentAdapters<TItem, TInput>["renderView"] = infolistConfig
		? ({ entity, isLoading }) => {
				if (infolistConfig.render) {
					return infolistConfig.render({ entity, isLoading, t });
				}
				if (!infolistConfig.schema || !entity) return null;
				const resolvedSchema =
					typeof infolistConfig.schema === "function" ? infolistConfig.schema({ entity, t }) : infolistConfig.schema;
				return (
					<SchemaRenderer
						i18nNamespace={resource.i18nNamespace}
						schema={resolvedSchema}
						columns={infolistConfig.columns}
						record={entity}
						orientation={infolistConfig.orientation}
						dense={infolistConfig.dense}
						mode="view"
					/>
				);
			}
		: undefined;

	return {
		viewTitle,
		viewDescription,
		viewBadge,
		viewActions: config.infolist?.actions,
		renderForm,
		renderView,
	};
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
	}) => <ResourceTable resource={resource} schema={config.table} tableState={tableState} />;

	return (
		<ResourceScaffold<TItem, TInput, TFilters, TListResponse>
			resource={resource}
			search={search}
			formSize={config.form?.size}
			viewSize={config.infolist?.size}
			allowFullscreen={config.allowFullscreen}
			headerActions={config.headerActions}
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
 * 自动产出 RSC-safe `ListView` 与 `ActionView`。
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
	function ResourceListView({ search }: { search?: TFilters }) {
		return <ResourceListViewImpl resource={resource} config={config} search={search} />;
	}

	function ResourceActionView({ mode, id }: ResourceSubPageRenderProps) {
		return <ResourceActionViewImpl resource={resource} config={config} mode={mode} id={id} />;
	}

	return {
		resource,
		config,
		ListView: ResourceListView,
		ActionView: ResourceActionView,
	};
}
