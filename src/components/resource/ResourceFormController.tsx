"use client";

import { useForm } from "@tanstack/react-form";
import { useMemoizedFn } from "ahooks";
import { useTranslations } from "next-intl";
import { type ReactNode, useMemo, useRef } from "react";

import type { DialogSize } from "@/components/dialogs/types";
import { type ResourceDefinition, useResourceCreate, useResourceUpdate } from "@/lib/resource";

import { ResourceFormHost } from "./ResourceFormHost";
import type { BreadcrumbItem, ResourceFormSlotContext, ResourcePresentation } from "./types";
import { resolveResourceFormDefaults, safeResourceTranslate } from "./utils";

export type { ResourceFormSlotContext };

export interface ResourceFormControllerProps<
  TItem extends { id: string | number },
  TInput extends Record<string, unknown>,
> {
  resource: ResourceDefinition<TItem, TInput, any, any, any>;
  presentation: ResourcePresentation;
  mode: "create" | "edit";
  entity: TItem | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAfterSuccess?: (stayOnForm: boolean) => void;
  size?: DialogSize;
  allowFullscreen?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  backTo?: string;
  resolveFormDefaults?: (entity: TItem | null) => TInput;
  renderForm: (ctx: ResourceFormSlotContext<TItem>) => ReactNode;
}

/**
 * 共享资源表单生命周期控制器（供 ResourceScaffold 与 ResourceSubPageScaffold 共用）：
 * - 统一收口 defaultValues、Zod 校验、create/update mutation 与“保存并继续编辑”；
 * - 编辑模式下强制校验 entity 已就绪（未加载完成前禁用提交并在 submit 中二次保护），杜绝误触发 createMutation。
 */
export function ResourceFormController<TItem extends { id: string | number }, TInput extends Record<string, unknown>>({
  resource,
  presentation,
  mode,
  entity,
  open,
  onOpenChange,
  onAfterSuccess,
  size,
  allowFullscreen,
  breadcrumbs,
  backTo,
  resolveFormDefaults,
  renderForm,
}: ResourceFormControllerProps<TItem, TInput>) {
  const t = useTranslations(resource.i18nNamespace as never);
  const createMutation = useResourceCreate(resource);
  const updateMutation = useResourceUpdate(resource);
  const keepOpenAfterSubmitRef = useRef(false);

  const isEditing = mode === "edit";
  const isEditingEntityMissing = isEditing && !entity;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const defaultValues = useMemo<TInput>(
    () => resolveResourceFormDefaults(resource, entity, resolveFormDefaults),
    [entity, resolveFormDefaults, resource],
  );

  const handleSubmit = useMemoizedFn(async ({ value }: { value: TInput }) => {
    const stay = keepOpenAfterSubmitRef.current;
    keepOpenAfterSubmitRef.current = false;
    try {
      if (isEditing) {
        if (!entity) return;
        await updateMutation.mutateAsync({
          id: String(entity.id),
          input: value,
        });
      } else {
        await createMutation.mutateAsync(value);
      }
    } catch {
      // 变更错误已由 useResourceCreate / useResourceUpdate 的 onError 统一处理，
      // 阻止异常穿透 fire-and-forget 的 form.handleSubmit() 产生未捕获 Promise 拒绝。
      return;
    }
    onAfterSuccess?.(stay);
    if (!stay) {
      onOpenChange?.(false);
    }
  });

  const form = useForm({
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
    <ResourceFormHost
      presentation={presentation}
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      defaultValues={defaultValues}
      mode={mode}
      entity={entity}
      entityName={resource.entityName}
      createTitle={createTitle}
      editTitle={editTitle}
      description={isEditing ? (editDesc ?? fallbackDesc) : (createDesc ?? fallbackDesc)}
      size={size}
      allowFullscreen={allowFullscreen}
      breadcrumbs={breadcrumbs}
      backTo={backTo}
      isSubmitting={isPending}
      isSubmitDisabled={isEditingEntityMissing}
      onSaveAndContinue={handleSaveAndContinue}
    >
      {renderForm({ form, mode, entity, isEditing, isSubmitting: isPending })}
    </ResourceFormHost>
  );
}
