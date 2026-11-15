"use client";

import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { isEqual } from "es-toolkit";
import { Loader2 } from "lucide-react";
import { memo, type SubmitEvent, useEffect, useId, useMemo, useRef } from "react";

import { dispatchFormSubmit, FormContext } from "@/components/form/core/FormContext";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { SheetFooter } from "@/components/ui/sheet";
import { cn } from "cn";

import type { FormDialogProps } from "./types";

import { ModalFrame } from "./ModalFrame";
import { DIALOG_BODY_CLASS, DIALOG_FOOTER_CLASS } from "./sizeClasses";

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
  size = "md",
  submitText,
  createSubmitText,
  editSubmitText,
  cancelText,
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

  const prevOpenRef = useRef(false);
  const prevEntityIdRef = useRef<unknown>(undefined);
  const prevDefaultsRef = useRef<Record<string, unknown> | undefined>(undefined);
  const baseDefaultsRef = useRef<Record<string, unknown> | undefined>(undefined);

  // Synchronize entity / defaultValues on open, entity swap, or late async defaults while clean
  useEffect(() => {
    if (!form) return;

    if (baseDefaultsRef.current === undefined) {
      const formDefaults = form.options?.defaultValues;
      baseDefaultsRef.current =
        formDefaults && typeof formDefaults === "object" ? { ...(formDefaults as Record<string, unknown>) } : {};
    }

    if (!open) {
      prevOpenRef.current = false;
      prevEntityIdRef.current = undefined;
      prevDefaultsRef.current = undefined;
      return;
    }

    const currentEntityId =
      entity && typeof entity === "object"
        ? ((entity as Record<string, unknown>).id ?? (entity as Record<string, unknown>)._id ?? undefined)
        : entity;
    const justOpened = !prevOpenRef.current && open;
    const entityChanged = prevEntityIdRef.current !== currentEntityId && (justOpened || currentEntityId !== undefined);
    const defaultsArrivedClean = !form.state?.isDirty && !isEqual(prevDefaultsRef.current, defaultValues);

    if (justOpened || entityChanged || defaultsArrivedClean) {
      const mergedValues: Record<string, unknown> = {
        ...baseDefaultsRef.current,
        ...defaultValues,
      };
      if (entity && typeof entity === "object") {
        for (const [key, val] of Object.entries(entity as Record<string, unknown>)) {
          if (val !== undefined) {
            mergedValues[key] = val;
          }
        }
      }

      if (Object.keys(mergedValues).length > 0) {
        form.reset(mergedValues);
      } else {
        form.reset();
      }
    }

    prevOpenRef.current = open;
    prevEntityIdRef.current = currentEntityId;
    prevDefaultsRef.current = defaultValues;
  }, [open, entity, form, defaultValues]);

  const resolvedTitle =
    title ??
    (isEdit
      ? (editTitle ?? t("form_edit_title", { entityName }))
      : (createTitle ?? t("form_create_title", { entityName })));

  const resolvedSubmitText =
    submitText ??
    (isEdit
      ? (editSubmitText ?? t("form_edit_submit", { entityName }))
      : (createSubmitText ?? t("form_create_submit", { entityName })));

  const resolvedCancelText = cancelText ?? t("cancel");
  const displaySubmitText = isSubmitting && !submitText ? t("form_submitting") : resolvedSubmitText;

  const formContextValue = useMemo(() => ({ form }), [form]);

  const handleOpenChange = useMemoizedFn((nextOpen: boolean) => {
    if (isSubmitting) return;
    onOpenChange(nextOpen);
  });

  const handleCancel = useMemoizedFn(() => {
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
  );
});
