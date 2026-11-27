"use client";

import { useMemoizedFn } from "ahooks";
import { useTranslations } from "next-intl";
import { type ReactNode, type SubmitEvent, useEffect, useState } from "react";

import { dispatchFormSubmit, useLockedAsyncCallback } from "@/components/form/core/FormContext";

import type { FormDialogProps } from "../types";
import { useBackNavigation } from "../useBackNavigation";
import { useFormHostSync } from "./useFormHostSync";

const NOOP = () => {};

/**
 * Dialog / Drawer / Page 共用表单状态编排 Hook：
 * 收口标题解析、脏状态拦截（含 page 模式 beforeunload）、提交互斥锁与取消/确认关闭逻辑。
 */
export function useFormSurfaceState<TData = Record<string, unknown>>({
  isPage,
  open = true,
  onOpenChange = NOOP,
  form,
  defaultValues,
  mode,
  entity,
  entityName,
  title,
  createTitle,
  editTitle,
  submitText,
  createSubmitText,
  editSubmitText,
  cancelText,
  saveAndContinueText,
  onSaveAndContinue,
  onSubmit,
  onCancel,
  backTo,
  isDirty = false,
  enableDirtyGuard: explicitDirtyGuard,
  loading = false,
  isSubmitting = false,
  isSubmitDisabled = false,
}: Pick<
  FormDialogProps<TData>,
  | "open"
  | "onOpenChange"
  | "form"
  | "defaultValues"
  | "mode"
  | "entity"
  | "entityName"
  | "title"
  | "createTitle"
  | "editTitle"
  | "submitText"
  | "createSubmitText"
  | "editSubmitText"
  | "cancelText"
  | "saveAndContinueText"
  | "onSaveAndContinue"
  | "onSubmit"
  | "onCancel"
  | "backTo"
  | "isDirty"
  | "enableDirtyGuard"
  | "loading"
  | "isSubmitting"
  | "isSubmitDisabled"
> & { isPage: boolean }) {
  const enableDirtyGuard = explicitDirtyGuard ?? isPage;
  const tDialog = useTranslations("dialog");
  const tResource = useTranslations("resource");
  const goBack = useBackNavigation(backTo);

  const isEdit = mode ? mode === "edit" : Boolean(entity);
  const [prevOpen, setPrevOpen] = useState(open);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [pendingCloseSource, setPendingCloseSource] = useState<"cancel" | "dismiss">("dismiss");

  if (!isPage && prevOpen !== open) {
    setPrevOpen(open);
    if (!open) {
      setShowDiscardConfirm(false);
      setPendingCloseSource("dismiss");
    }
  }

  const { isFormDirty } = useFormHostSync({
    open: isPage ? true : open,
    form,
    entity,
    defaultValues,
    isDirtyProp: isDirty,
  });

  useEffect(() => {
    if (!isPage || !enableDirtyGuard || !isFormDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enableDirtyGuard, isFormDirty, isPage]);

  const resolvedEntityName = entityName ?? tDialog("default_entity");
  const baseTitle =
    title ??
    (isEdit
      ? (editTitle ?? tDialog("form_edit_title", { entityName: resolvedEntityName }))
      : (createTitle ?? tDialog("form_create_title", { entityName: resolvedEntityName })));

  const resolveDefaultSubmitText = (
    explicitSubmitText: ReactNode,
    dialogKey: "form_edit_submit" | "form_create_submit",
  ) =>
    explicitSubmitText ??
    (isPage && !entityName ? tResource("save_changes") : tDialog(dialogKey, { entityName: resolvedEntityName }));

  const resolvedSubmitText =
    submitText ??
    (isEdit
      ? resolveDefaultSubmitText(editSubmitText, "form_edit_submit")
      : resolveDefaultSubmitText(createSubmitText, "form_create_submit"));

  const resolvedCancelText = cancelText ?? (isPage ? tResource("cancel") : tDialog("cancel"));
  const resolvedSaveAndContinueText =
    saveAndContinueText ?? (isPage ? tResource("save_and_continue") : tDialog("save_and_continue"));
  const displaySubmitText = isSubmitting && !submitText ? tDialog("form_submitting") : resolvedSubmitText;

  const formContextValue = { form };
  const isSubmitBlocked = isSubmitting || isSubmitDisabled || loading;

  const finishClose = useMemoizedFn((fromCancel: boolean) => {
    if (isPage) {
      if (onCancel) onCancel();
      else goBack();
      return;
    }
    if (fromCancel) onCancel?.();
    onOpenChange(false);
  });

  const requestClose = useMemoizedFn((fromCancel: boolean) => {
    if (isSubmitting) return;
    if (enableDirtyGuard && isFormDirty) {
      setPendingCloseSource(fromCancel ? "cancel" : "dismiss");
      setShowDiscardConfirm(true);
      return;
    }
    finishClose(fromCancel);
  });

  const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
    if (isSubmitting) return;
    if (!nextOpen) {
      requestClose(false);
      return;
    }
    onOpenChange(nextOpen);
  });

  const handleConfirmDiscard = useMemoizedFn(() => {
    setShowDiscardConfirm(false);
    const wasCancel = pendingCloseSource === "cancel";
    setPendingCloseSource("dismiss");
    finishClose(wasCancel);
  });

  const handleFormSubmit = useMemoizedFn((e: SubmitEvent<HTMLFormElement>) => {
    dispatchFormSubmit(e, form, onSubmit, isSubmitBlocked);
  });

  const handleSaveAndContinueClick = useLockedAsyncCallback(onSaveAndContinue, isSubmitBlocked);

  return {
    baseTitle,
    displaySubmitText,
    resolvedCancelText,
    resolvedSaveAndContinueText,
    formContextValue,
    isSubmitBlocked,
    showDiscardConfirm,
    setShowDiscardConfirm,
    handleCancel: () => requestClose(true),
    handleOpenChange,
    handleConfirmDiscard,
    handleFormSubmit,
    handleSaveAndContinueClick,
  };
}
