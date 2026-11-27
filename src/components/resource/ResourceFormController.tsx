"use client";

import { useMemoizedFn } from "ahooks";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useRef } from "react";

import { type DialogSize, FormDialog } from "@/components/dialogs";
import { useAppForm } from "@/components/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { type ResourceDefinition, useResourceCreate, useResourceDetail, useResourceUpdate } from "@/lib/resource";

import type { BreadcrumbItem, ResourceFormSlotContext, ResourcePresentation } from "./types";
import { resolveResourceFormDefaults, safeResourceTranslate } from "./useResourceBridge";

export type { ResourceFormSlotContext };

export interface ResourceFormControllerProps<
	TItem extends { id: string | number },
	TInput extends Record<string, unknown>,
> {
	resource: ResourceDefinition<TItem, TInput, any, any, any>;
	presentation: ResourcePresentation;
	mode?: "create" | "edit";
	editId?: string | null;
	entity?: TItem | null;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onAfterSuccess?: (stayOnForm: boolean) => void;
	size?: DialogSize;
	allowFullscreen?: boolean;
	loading?: boolean;
	detailError?: boolean;
	onRetryDetail?: () => void;
	breadcrumbs?: BreadcrumbItem[];
	backTo?: string;
	resolveFormDefaults?: (entity: TItem | null) => TInput;
	renderForm: (ctx: ResourceFormSlotContext<TItem>) => ReactNode;
}

/**
 * 共享资源表单生命周期控制器（供 ResourceScaffold 与 ResourceSubPageScaffold 共用）：
 * 统一收口详情补全拉取（`editId`）、`defaultValues` 派生、Zod 校验、`create/update` 提交与“保存并继续编辑”。
 */
export function ResourceFormController<TItem extends { id: string | number }, TInput extends Record<string, unknown>>({
	resource,
	presentation,
	mode: explicitMode,
	editId = null,
	entity: explicitEntity = null,
	open = true,
	onOpenChange,
	onAfterSuccess,
	size,
	allowFullscreen,
	loading = false,
	detailError = false,
	onRetryDetail,
	breadcrumbs,
	backTo,
	resolveFormDefaults,
	renderForm,
}: ResourceFormControllerProps<TItem, TInput>) {
	const t = useTranslations(resource.i18nNamespace as never);
	const tResource = useTranslations("resource");
	const createMutation = useResourceCreate(resource);
	const updateMutation = useResourceUpdate(resource);
	const keepOpenAfterSubmitRef = useRef(false);

	const shouldFetchDetail = Boolean(open && editId && !explicitEntity);
	const detailQuery = useResourceDetail(resource, editId ?? "", { enabled: shouldFetchDetail });
	const effectiveEntity = explicitEntity ?? detailQuery.data ?? null;
	const mode: "create" | "edit" = explicitMode ?? (editId ? "edit" : "create");

	const isEditing = mode === "edit";
	const isEditingEntityMissing = isEditing && !effectiveEntity;
	const isDetailLoading = isEditing && (loading || (shouldFetchDetail && detailQuery.isLoading)) && !effectiveEntity;
	const isDetailError =
		isEditing && Boolean(detailError || (shouldFetchDetail && detailQuery.isError)) && !effectiveEntity;
	const isDetailNotFound = isEditing && !isDetailLoading && !isDetailError && !effectiveEntity;
	const isPending = createMutation.isPending || updateMutation.isPending;

	const handleRetryDetail = () => {
		if (onRetryDetail) {
			onRetryDetail();
			return;
		}
		void detailQuery.refetch();
	};

	const defaultValues = resolveResourceFormDefaults(resource, effectiveEntity, resolveFormDefaults);

	const handleSubmit = useMemoizedFn(async ({ value }: { value: TInput }) => {
		const stay = keepOpenAfterSubmitRef.current;
		keepOpenAfterSubmitRef.current = false;
		try {
			if (isEditing) {
				if (!effectiveEntity) return;
				await updateMutation.mutateAsync({ id: String(effectiveEntity.id), input: value });
			} else {
				await createMutation.mutateAsync(value);
			}
		} catch {
			return;
		}
		onAfterSuccess?.(stay);
		if (!stay) onOpenChange?.(false);
	});

	const form = useAppForm({
		defaultValues,
		validators: resource.schema ? { onChange: resource.schema as never } : undefined,
		onSubmit: handleSubmit,
	});

	const handleSaveAndContinue = useMemoizedFn(async () => {
		keepOpenAfterSubmitRef.current = true;
		try {
			await form.handleSubmit();
		} finally {
			keepOpenAfterSubmitRef.current = false;
		}
	});

	const createTitle = safeResourceTranslate(t, resource.i18nKeys.formCreateTitle);
	const editTitle = safeResourceTranslate(t, resource.i18nKeys.formEditTitle);
	const createDesc = safeResourceTranslate(t, resource.i18nKeys.formCreateDesc);
	const editDesc = safeResourceTranslate(t, resource.i18nKeys.formEditDesc);
	const fallbackDesc = safeResourceTranslate(t, "form_desc");

	return (
		<FormDialog
			presentation={presentation}
			open={open}
			onOpenChange={onOpenChange}
			form={form}
			defaultValues={defaultValues}
			mode={mode}
			entity={effectiveEntity}
			entityName={resource.entityName}
			createTitle={createTitle}
			editTitle={editTitle}
			description={isEditing ? (editDesc ?? fallbackDesc) : (createDesc ?? fallbackDesc)}
			size={size}
			allowFullscreen={allowFullscreen}
			breadcrumbs={breadcrumbs}
			backTo={backTo}
			enableDirtyGuard
			loading={isDetailLoading}
			isSubmitting={isPending}
			isSubmitDisabled={isEditingEntityMissing || isDetailError}
			onSaveAndContinue={handleSaveAndContinue}
		>
			{isDetailError || isDetailNotFound ? (
				<Alert variant="destructive">
					<AlertCircle aria-hidden="true" />
					<AlertDescription className="flex flex-col gap-3">
						<span>{isDetailError ? tResource("detail_load_error") : tResource("detail_not_found")}</span>
						{isDetailError ? (
							<div>
								<Button type="button" variant="outline" size="xs" onClick={handleRetryDetail}>
									{tResource("retry")}
								</Button>
							</div>
						) : null}
					</AlertDescription>
				</Alert>
			) : (
				renderForm({ form, mode, entity: effectiveEntity, isEditing, isSubmitting: isPending })
			)}
		</FormDialog>
	);
}
