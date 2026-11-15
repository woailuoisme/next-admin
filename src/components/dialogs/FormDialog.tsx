"use client";

import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { Loader2 } from "lucide-react";
import { memo, type SubmitEvent, useId, useMemo, useState } from "react";

import { dispatchFormSubmit, FormContext } from "@/components/form/core/FormContext";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { SheetFooter } from "@/components/ui/sheet";
import { cn } from "cn";

import type { FormDialogProps } from "./types";

import { useFormHostSync } from "./hooks/useFormHostSync";
import { ModalFrame } from "./ModalFrame";
import { DIALOG_BODY_CLASS, DIALOG_FOOTER_CLASS } from "./sizeClasses";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";

export const FormDialog = memo(function FormDialog<TData = Record<string, unknown>>({
  open,
  onOpenChange,
  variant = "dialog",
  widthClassName,
  mode,
  entity,
  form,
  defaultValues,
  entityName = "Record",
  title,
  createTitle,
  editTitle,
  description,
  badge,
  size = "md",
  submitText,
  createSubmitText,
  editSubmitText,
  cancelText,
  saveAndContinueText,
  onSaveAndContinue,
  onCancel,
  isDirty = false,
  enableDirtyGuard = false,
  isSubmitting = false,
  isSubmitDisabled = false,
  onSubmit,
  children,
  extraFooterActions,
  className,
  footerClassName,
  allowFullscreen = false,
  fullscreen: controlledFullscreen,
  onFullscreenChange,
}: FormDialogProps<TData>) {
  const t = useTranslations("dialog");
  const formId = useId();
  const isEdit = mode ? mode === "edit" : Boolean(entity);
  const [prevOpen, setPrevOpen] = useState(open);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [pendingCloseSource, setPendingCloseSource] = useState<"cancel" | "dismiss">("dismiss");

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setShowDiscardConfirm(false);
      setPendingCloseSource("dismiss");
    }
  }

  const { isFormDirty } = useFormHostSync({
    open,
    form,
    entity,
    defaultValues,
    isDirtyProp: isDirty,
  });

  const baseTitle =
    title ??
    (isEdit
      ? (editTitle ?? t("form_edit_title", { entityName }))
      : (createTitle ?? t("form_create_title", { entityName })));

  const resolvedTitle = badge ? (
    <span className="inline-flex items-center gap-2.5">
      <span>{baseTitle}</span>
      {badge}
    </span>
  ) : (
    baseTitle
  );

  const resolvedSubmitText =
    submitText ??
    (isEdit
      ? (editSubmitText ?? t("form_edit_submit", { entityName }))
      : (createSubmitText ?? t("form_create_submit", { entityName })));

  const resolvedCancelText = cancelText ?? t("cancel");
  const resolvedSaveAndContinueText = saveAndContinueText ?? t("save_and_continue");
  const displaySubmitText = isSubmitting && !submitText ? t("form_submitting") : resolvedSubmitText;

  const formContextValue = useMemo(() => ({ form }), [form]);

  const requestClose = useMemoizedFn((fromCancelButton: boolean) => {
    if (isSubmitting) return;
    const source = fromCancelButton ? "cancel" : "dismiss";
    if (enableDirtyGuard && isFormDirty) {
      setPendingCloseSource(source);
      setShowDiscardConfirm(true);
      return;
    }
    if (fromCancelButton) {
      onCancel?.();
    }
    onOpenChange(false);
  });

  const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
    if (isSubmitting) return;
    if (!nextOpen) {
      requestClose(false);
      return;
    }
    onOpenChange(nextOpen);
  });

  const handleCancel = useMemoizedFn(() => {
    requestClose(true);
  });

  const handleConfirmDiscard = useMemoizedFn(() => {
    setShowDiscardConfirm(false);
    if (pendingCloseSource === "cancel") {
      onCancel?.();
    }
    setPendingCloseSource("dismiss");
    onOpenChange(false);
  });

  const handleFormSubmit = useMemoizedFn((e: SubmitEvent<HTMLFormElement>) => {
    dispatchFormSubmit(e, form, onSubmit);
  });

  const renderFormContent = (
    FooterComponent: React.ComponentType<{
      className?: string;
      children?: React.ReactNode;
    }>,
  ) => (
    // 本组件拥有 <form> 元素（吸底提交按钮位于其内部并依赖原生提交）
    // children 只能是字段内容，严禁再渲染 form / <Form as="form">，否则会嵌套 <form> 导致 hydration 报错
    <form id={formId} onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className={DIALOG_BODY_CLASS}>
        <FormContext value={formContextValue}>{children}</FormContext>
      </div>

      <FooterComponent className={cn(DIALOG_FOOTER_CLASS, footerClassName)}>
        {extraFooterActions ? <div className="mr-auto flex items-center gap-2">{extraFooterActions}</div> : null}
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="h-8.5 px-4 text-xs font-medium"
        >
          {resolvedCancelText}
        </Button>
        {onSaveAndContinue ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => void onSaveAndContinue()}
            disabled={isSubmitting || isSubmitDisabled}
            className="h-8.5 px-4 text-xs font-medium"
          >
            {isSubmitting ? <Loader2 className="mr-2 size-3.5 animate-spin" /> : null}
            {resolvedSaveAndContinueText}
          </Button>
        ) : null}
        <Button
          type="submit"
          disabled={isSubmitting || isSubmitDisabled}
          className="h-8.5 px-4 text-xs font-medium shadow-xs"
        >
          {isSubmitting ? <Loader2 className="mr-2 size-3.5 animate-spin" /> : null}
          {displaySubmitText}
        </Button>
      </FooterComponent>
    </form>
  );

  return (
    <>
      <ModalFrame
        open={open}
        onOpenChange={handleOpenChange}
        variant={variant}
        size={size}
        widthClassName={widthClassName}
        className={className}
        allowFullscreen={allowFullscreen}
        fullscreen={controlledFullscreen}
        onFullscreenChange={onFullscreenChange}
        title={resolvedTitle}
        description={description}
      >
        {renderFormContent(variant === "sheet" ? SheetFooter : DialogFooter)}
      </ModalFrame>

      <UnsavedChangesDialog
        open={showDiscardConfirm}
        onOpenChange={setShowDiscardConfirm}
        title={t("unsaved_changes_title")}
        description={t("unsaved_changes_desc")}
        stayText={t("unsaved_changes_stay")}
        discardText={t("unsaved_changes_discard")}
        onConfirmDiscard={handleConfirmDiscard}
      />
    </>
  );
});
