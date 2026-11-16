"use client";

import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { Loader2 } from "lucide-react";
import { memo, type ReactNode, type SubmitEvent, useEffect, useMemo, useState } from "react";

import { useFormHostSync } from "@/components/dialogs/hooks/useFormHostSync";
import { UnsavedChangesDialog } from "@/components/dialogs/UnsavedChangesDialog";
import { dispatchFormSubmit, FormBodyRegion, useLockedAsyncCallback } from "@/components/form/core/FormContext";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

import type { ResourceFormHostProps } from "./types";

import { ResourcePageHeader } from "./ResourcePageHeader";
import { useResourceBackNavigation } from "./useResourceBackNavigation";

function ResourceFormPageImpl<TData = Record<string, unknown>>({
  form,
  defaultValues,
  mode,
  entity,
  entityName,
  title,
  createTitle,
  editTitle,
  description,
  badge,
  breadcrumbs,
  backTo,
  backLabel,
  submitText,
  createSubmitText,
  editSubmitText,
  cancelText,
  saveAndContinueText,
  onSaveAndContinue,
  loading = false,
  isSubmitting = false,
  isSubmitDisabled = false,
  isDirty = false,
  enableDirtyGuard = true,
  onSubmit,
  onCancel,
  extraActions,
  footerClassName,
  className,
  children,
}: Omit<ResourceFormHostProps<TData>, "presentation" | "open" | "onOpenChange" | "size">) {
  const t = useTranslations("resource");
  const tDialog = useTranslations("dialog");
  const tCommon = useTranslations("common");
  const goBack = useResourceBackNavigation(backTo);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const isEdit = mode ? mode === "edit" : Boolean(entity);
  const { isFormDirty } = useFormHostSync({
    open: true,
    form,
    entity,
    defaultValues,
    isDirtyProp: isDirty,
  });

  const resolvedTitle =
    title ??
    (isEdit
      ? (editTitle ?? (entityName ? tDialog("form_edit_title", { entityName }) : undefined))
      : (createTitle ?? (entityName ? tDialog("form_create_title", { entityName }) : undefined)));

  const resolvedSubmitText =
    submitText ??
    (isEdit
      ? (editSubmitText ?? (entityName ? tDialog("form_edit_submit", { entityName }) : t("save_changes")))
      : (createSubmitText ?? (entityName ? tDialog("form_create_submit", { entityName }) : t("save_changes"))));
  const resolvedCancelText = cancelText ?? t("cancel");
  const resolvedSaveAndContinueText = saveAndContinueText ?? t("save_and_continue");

  const formContextValue = useMemo(() => ({ form }), [form]);

  // 浏览器刷新/关闭未保存拦截
  useEffect(() => {
    if (!enableDirtyGuard || !isFormDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enableDirtyGuard, isFormDirty]);

  const executeCancel = useMemoizedFn(() => {
    if (onCancel) {
      onCancel();
    } else {
      goBack();
    }
  });

  const handleCancel = useMemoizedFn(() => {
    if (enableDirtyGuard && isFormDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    executeCancel();
  });

  const handleConfirmDiscard = useMemoizedFn(() => {
    setShowDiscardConfirm(false);
    executeCancel();
  });

  const isSubmitBlocked = isSubmitting || isSubmitDisabled || loading;

  const handleFormSubmit = useMemoizedFn((e: SubmitEvent<HTMLFormElement>) => {
    dispatchFormSubmit(e, form, onSubmit, isSubmitBlocked);
  });

  const handleSaveAndContinueClick = useLockedAsyncCallback(onSaveAndContinue, isSubmitBlocked);

  return (
    <div className={cn("mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8", className)}>
      <ResourcePageHeader
        title={resolvedTitle}
        description={description}
        badge={badge}
        breadcrumbs={breadcrumbs}
        backTo={backTo}
        backLabel={backLabel}
        extraActions={extraActions}
      />

      {/* 本组件拥有 <form> 元素：children 只能是字段内容，严禁再嵌套 form / <Form as="form"> */}
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <FormBodyRegion
          formContextValue={formContextValue}
          loading={loading}
          loadingLabel={tCommon("loading_page_aria")}
          className="min-h-75 space-y-6"
          contentClassName="space-y-6"
        >
          {children}
        </FormBodyRegion>

        {/* 工业级吸底固定操作栏 (Sticky Bottom Bar) */}
        <div
          className={cn(
            "sticky bottom-0 z-20 -mx-4 flex flex-row items-center justify-between gap-3 border-t border-border/70 bg-background/85 px-4 py-3.5 backdrop-blur-md transition-all sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8",
            footerClassName,
          )}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-foreground h-8.5 px-3.5 text-xs"
          >
            {resolvedCancelText}
          </Button>

          <div className="flex items-center gap-2.5">
            {onSaveAndContinue ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleSaveAndContinueClick()}
                disabled={isSubmitBlocked}
                className="h-8.5 px-4 text-xs font-medium"
              >
                {isSubmitting ? <Loader2 className="mr-2 size-3.5 animate-spin" aria-hidden="true" /> : null}
                {resolvedSaveAndContinueText}
              </Button>
            ) : null}

            <Button type="submit" disabled={isSubmitBlocked} className="h-8.5 px-4 text-xs font-medium shadow-xs">
              {isSubmitting ? <Loader2 className="mr-2 size-3.5 animate-spin" aria-hidden="true" /> : null}
              {resolvedSubmitText}
            </Button>
          </div>
        </div>
      </form>

      <UnsavedChangesDialog
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
        title={t("unsaved_changes_title")}
        description={t("unsaved_changes_confirm")}
        stayText={t("unsaved_changes_stay")}
        discardText={t("unsaved_changes_discard")}
        onConfirmDiscard={handleConfirmDiscard}
      />
    </div>
  );
}

export const ResourceFormPage = memo(ResourceFormPageImpl) as <TData = Record<string, unknown>>(
  props: Omit<ResourceFormHostProps<TData>, "presentation" | "open" | "onOpenChange" | "size">,
) => ReactNode;
