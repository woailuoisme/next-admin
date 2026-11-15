"use client";

import { memo } from "react";

import { FormDialog } from "@/components/dialogs";

import type { ResourceFormHostProps } from "./types";

import { ResourceFormPage } from "./ResourceFormPage";

/**
 * ResourceFormHost:
 * Filament v5 风格企业级表单宿主容器。
 * 支持根据 presentation 属性在三种工业级形态间无缝切换：
 * - "dialog": 居中模态弹窗 (Modal)
 * - "drawer": 右侧滑出抽屉 (SlideOver / Sheet)
 * - "page": 独立路由全屏页面 (Page)
 *
 * 内部表单内容与业务逻辑 100% 复用，底栏吸底操作栏与未保存拦截完全一致。
 */
const NOOP = () => {};

export const ResourceFormHost = memo(function ResourceFormHost<TData = Record<string, unknown>>({
  presentation = "dialog",
  open = false,
  onOpenChange = NOOP,
  form,
  defaultValues,
  mode,
  entity,
  entityName = "Record",
  title,
  createTitle,
  editTitle,
  description,
  badge,
  size = "md",
  widthClassName,
  className,
  footerClassName,
  allowFullscreen,
  fullscreen,
  onFullscreenChange,
  breadcrumbs,
  backTo,
  backLabel,
  submitText,
  createSubmitText,
  editSubmitText,
  cancelText,
  saveAndContinueText,
  onSaveAndContinue,
  isSubmitting = false,
  isSubmitDisabled = false,
  isDirty = false,
  enableDirtyGuard,
  onSubmit,
  onCancel,
  extraActions,
  children,
}: ResourceFormHostProps<TData>) {
  if (presentation === "page") {
    return (
      <ResourceFormPage
        form={form}
        defaultValues={defaultValues}
        mode={mode}
        entity={entity}
        entityName={entityName}
        title={title}
        createTitle={createTitle}
        editTitle={editTitle}
        description={description}
        badge={badge}
        breadcrumbs={breadcrumbs}
        backTo={backTo}
        backLabel={backLabel}
        submitText={submitText}
        createSubmitText={createSubmitText}
        editSubmitText={editSubmitText}
        cancelText={cancelText}
        saveAndContinueText={saveAndContinueText}
        onSaveAndContinue={onSaveAndContinue}
        isSubmitting={isSubmitting}
        isSubmitDisabled={isSubmitDisabled}
        isDirty={isDirty}
        enableDirtyGuard={enableDirtyGuard ?? true}
        onSubmit={onSubmit}
        onCancel={onCancel}
        extraActions={extraActions}
        footerClassName={footerClassName}
        className={className}
      >
        {children}
      </ResourceFormPage>
    );
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      variant={presentation === "drawer" ? "sheet" : "dialog"}
      form={form}
      defaultValues={defaultValues}
      mode={mode}
      entity={entity}
      entityName={entityName}
      title={title}
      createTitle={createTitle}
      editTitle={editTitle}
      description={description}
      badge={badge}
      size={size}
      widthClassName={widthClassName}
      submitText={submitText}
      createSubmitText={createSubmitText}
      editSubmitText={editSubmitText}
      cancelText={cancelText}
      saveAndContinueText={saveAndContinueText}
      onSaveAndContinue={onSaveAndContinue}
      onCancel={onCancel}
      isDirty={isDirty}
      enableDirtyGuard={enableDirtyGuard ?? false}
      isSubmitting={isSubmitting}
      isSubmitDisabled={isSubmitDisabled}
      onSubmit={onSubmit}
      extraFooterActions={extraActions}
      className={className}
      footerClassName={footerClassName}
      allowFullscreen={allowFullscreen}
      fullscreen={fullscreen}
      onFullscreenChange={onFullscreenChange}
    >
      {children}
    </FormDialog>
  );
});
