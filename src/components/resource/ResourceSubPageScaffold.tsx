"use client";

import { useMemoizedFn } from "ahooks";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { ActionResourceProvider } from "@/components/actions";
import { ViewDialog } from "@/components/dialogs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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

	const {
		data: entity = null,
		isLoading,
		isError,
		refetch,
	} = useResourceDetail(resource, id ?? "", {
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
		const isViewError = Boolean(id && isError && !entity);
		const isViewNotFound = Boolean(id && !isLoading && !isViewError && !entity);
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

		const errorFallback =
			isViewError || isViewNotFound ? (
				<Alert variant="destructive">
					<AlertCircle aria-hidden="true" />
					<AlertDescription className="flex flex-col gap-3">
						<span>{isViewError ? tResource("detail_load_error") : tResource("detail_not_found")}</span>
						{isViewError ? (
							<div>
								<Button type="button" variant="outline" size="xs" onClick={() => void refetch()}>
									{tResource("retry")}
								</Button>
							</div>
						) : null}
					</AlertDescription>
				</Alert>
			) : null;

		return (
			<ActionResourceProvider value={actionBridge}>
				<ViewDialog
					presentation="page"
					breadcrumbs={breadcrumbs}
					backTo={resource.basePath}
					onEdit={canEdit && renderForm && id && entity ? () => handleEditNavigate(id) : undefined}
					{...viewProps}
				>
					{errorFallback ?? viewProps.children}
				</ViewDialog>
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
					detailError={mode === "edit" && Boolean(id && isError && !entity)}
					onRetryDetail={() => void refetch()}
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
