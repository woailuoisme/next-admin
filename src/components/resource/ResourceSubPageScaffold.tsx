"use client";

import { useMemoizedFn } from "ahooks";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { ActionResourceProvider } from "@/components/actions";
import { ViewDialog } from "@/components/dialogs";
import { type ResourceDefinition, useCan, useResourceDetail } from "@/lib/resource";

import { ResourceFormController } from "./ResourceFormController";
import type { BreadcrumbItem, ResourceContentAdapters } from "./types";
import { buildResourceViewProps, safeResourceTranslate, useResourceBridge } from "./useResourceBridge";

export interface ResourceSubPageScaffoldProps<
	TItem extends { id: string | number },
	TInput extends Record<string, unknown> = Record<string, unknown>,
> extends ResourceContentAdapters<TItem, TInput> {
	resource: ResourceDefinition<TItem, TInput, any, any, any>;
	mode: "create" | "edit" | "view";
	id?: string;
}

/**
 * 为 Next.js App Router 独立子路由（`/create`, `/[id]`, `/[id]/edit`）提供零胶水 page 模式宿主。
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
	viewActions,
	renderForm,
	renderView,
}: ResourceSubPageScaffoldProps<TItem, TInput>) {
	const router = useRouter();
	const tResource = useTranslations("resource");
	const canEdit = useCan(resource.name, "edit");

	const { data: entity = null, isLoading } = useResourceDetail(resource, id ?? "", {
		enabled: mode !== "create" && Boolean(id),
	});

	const handleAfterSuccess = useMemoizedFn((stayOnForm: boolean) => {
		if (!stayOnForm) router.push(resource.basePath);
	});

	const handleEditNavigate = useMemoizedFn((targetId?: string) => {
		const resolvedId = targetId ?? id;
		if (resolvedId) router.push(`${resource.basePath}/${resolvedId}/edit`);
	});

	const { t, actionBridge } = useResourceBridge({
		resource,
		rows: entity ? [entity] : [],
		openCreate: () => router.push(`${resource.basePath}/create`),
		openEdit: (targetId) => handleEditNavigate(targetId),
		openView: (targetId) => router.push(`${resource.basePath}/${targetId}`),
		onAfterDelete: () => router.push(resource.basePath),
	});

	const listTitle = safeResourceTranslate(t, resource.i18nKeys.heading) ?? resource.entityName;
	const breadcrumbs: BreadcrumbItem[] = [{ label: listTitle, href: resource.basePath }];
	if (mode === "create") {
		breadcrumbs.push({
			label: safeResourceTranslate(t, resource.i18nKeys.formCreateTitle) ?? `Create ${resource.entityName}`,
		});
	} else if (mode === "edit") {
		breadcrumbs.push({
			label: resource.getTitle?.(entity) ?? `#${id ?? ""}`,
			href: id ? `${resource.basePath}/${id}` : undefined,
		});
		breadcrumbs.push({
			label: safeResourceTranslate(t, resource.i18nKeys.formEditTitle) ?? `Edit ${resource.entityName}`,
		});
	} else {
		breadcrumbs.push({ label: resource.getTitle?.(entity) ?? `#${id ?? ""}` });
	}

	if (mode === "view" && renderView) {
		const viewProps = buildResourceViewProps({
			resource,
			t,
			entity,
			viewTitle,
			viewDescription,
			viewBadge,
			viewActions,
			isLoading,
			renderView,
		});

		return (
			<ActionResourceProvider value={actionBridge}>
				<ViewDialog
					presentation="page"
					breadcrumbs={breadcrumbs}
					backTo={resource.basePath}
					onEdit={canEdit && renderForm && id ? () => handleEditNavigate(id) : undefined}
					{...viewProps}
				/>
			</ActionResourceProvider>
		);
	}

	if ((mode === "create" || mode === "edit") && renderForm) {
		return (
			<ActionResourceProvider value={actionBridge}>
				<ResourceFormController
					resource={resource}
					presentation="page"
					mode={mode}
					entity={entity}
					loading={mode === "edit" && isLoading && !entity}
					breadcrumbs={breadcrumbs}
					backTo={resource.basePath}
					onAfterSuccess={handleAfterSuccess}
					resolveFormDefaults={resolveFormDefaults}
					renderForm={renderForm}
				/>
			</ActionResourceProvider>
		);
	}

	return (
		<div role="status" className="text-muted-foreground flex min-h-48 items-center justify-center p-6 text-sm">
			{tResource("unsupported_mode_fallback")}
		</div>
	);
}
